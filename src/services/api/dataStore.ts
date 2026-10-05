import { create } from 'zustand';
import type {
  CampusEvent,
  Club,
  DocumentApplication,
  CreateApplicationInput,
  EventCategory,
} from '@/shared/types/app.types';
import { INITIAL_CLUBS, INITIAL_EVENTS } from '@/shared/lib/constants';
import { supabase } from '@/shared/lib/supabase';

interface CampusDataState {
  events: CampusEvent[];
  clubs: Club[];
  userRsvps: Set<string>; // eventId set
  applications: DocumentApplication[];
  selectedCategory: EventCategory | 'All';
  searchQuery: string;
  isSyncing: boolean;

  // Actions
  fetchFromSupabase: () => Promise<void>;
  setCategory: (category: EventCategory | 'All') => void;
  setSearchQuery: (query: string) => void;
  toggleRsvp: (eventId: string, studentName: string, studentEmail: string) => Promise<void>;
  submitApplication: (input: CreateApplicationInput) => Promise<DocumentApplication>;
}

const APPS_STORAGE_KEY = 'campusos_submitted_applications';
const RSVPS_STORAGE_KEY = 'campusos_user_rsvps';

export const useCampusStore = create<CampusDataState>((set, get) => {
  // Load local cache first
  const savedApps = localStorage.getItem(APPS_STORAGE_KEY);
  let initialApps: DocumentApplication[] = [];
  if (savedApps) {
    try {
      initialApps = JSON.parse(savedApps);
    } catch {
      // ignore
    }
  }

  const savedRsvps = localStorage.getItem(RSVPS_STORAGE_KEY);
  let initialRsvps: Set<string> = new Set();
  if (savedRsvps) {
    try {
      initialRsvps = new Set(JSON.parse(savedRsvps));
    } catch {
      // ignore
    }
  }

  return {
    events: INITIAL_EVENTS,
    clubs: INITIAL_CLUBS,
    userRsvps: initialRsvps,
    applications: initialApps,
    selectedCategory: 'All',
    searchQuery: '',
    isSyncing: false,

    setCategory: (category) => set({ selectedCategory: category }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    fetchFromSupabase: async () => {
      set({ isSyncing: true });
      try {
        // Fetch Clubs
        const { data: remoteClubs } = await supabase.from('clubs').select('*');
        if (remoteClubs && remoteClubs.length > 0) {
          const mappedClubs: Club[] = remoteClubs.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.code ? c.code.toLowerCase() : c.name.toLowerCase().replace(/\s+/g, '-'),
            category: c.category,
            description: c.description || '',
            leadName: c.lead_name || 'Chapter Lead',
            memberCount: c.member_count || 0,
            icon: c.icon || 'Users',
          }));
          set({ clubs: mappedClubs });
        }

        // Fetch Events
        const { data: remoteEvents } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true });

        if (remoteEvents && remoteEvents.length > 0) {
          const mappedEvents: CampusEvent[] = remoteEvents.map((e) => ({
            id: e.id,
            clubId: e.club_id,
            title: e.title,
            category: e.category,
            description: e.description || '',
            venue: e.venue || e.location || 'RBU Campus',
            eventDate: typeof e.event_date === 'string' ? e.event_date.split('T')[0] : '2026-03-15',
            eventTime: e.event_time || '10:00',
            rsvpCount: e.rsvp_count || 0,
            bannerGradient: (e.banner_gradient || 'cultural') as CampusEvent['bannerGradient'],
          }));
          set({ events: mappedEvents });
        }

        // Fetch Applications
        const { data: remoteApps } = await supabase
          .from('document_applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (remoteApps && remoteApps.length > 0) {
          const mappedApps: DocumentApplication[] = remoteApps.map((a) => ({
            id: a.id,
            docType: a.doc_type,
            title: a.title,
            studentName: a.student_name,
            rollNumber: a.roll_number,
            department: a.department,
            targetAuthority: a.target_authority,
            status: a.status,
            createdDate: a.created_date,
            trackingRef: a.tracking_ref,
            formData: a.form_data || {},
            createdAt: a.created_at,
          }));
          set({ applications: mappedApps });
          localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(mappedApps));
        }
      } catch (err) {
        console.warn('Supabase sync warning (using offline/local fallback):', err);
      } finally {
        set({ isSyncing: false });
      }
    },

    toggleRsvp: async (eventId: string, studentName: string, studentEmail: string) => {
      const { userRsvps, events } = get();
      const isRegistered = userRsvps.has(eventId);
      const nextRsvps = new Set(userRsvps);

      if (isRegistered) {
        nextRsvps.delete(eventId);
      } else {
        nextRsvps.add(eventId);
      }

      // Optimistic state change
      const nextEvents = events.map((ev) => {
        if (ev.id === eventId) {
          return {
            ...ev,
            rsvpCount: isRegistered ? Math.max(0, ev.rsvpCount - 1) : ev.rsvpCount + 1,
          };
        }
        return ev;
      });

      localStorage.setItem(RSVPS_STORAGE_KEY, JSON.stringify(Array.from(nextRsvps)));
      set({ userRsvps: nextRsvps, events: nextEvents });

      // Background Supabase persistence
      try {
        if (isRegistered) {
          await supabase
            .from('event_rsvps')
            .delete()
            .match({ event_id: eventId, student_email: studentEmail });
        } else {
          await supabase.from('event_rsvps').insert({
            event_id: eventId,
            student_name: studentName,
            student_email: studentEmail,
          });
        }
      } catch (err) {
        console.warn('RSVP Supabase persistence note:', err);
      }
    },

    submitApplication: async (input: CreateApplicationInput) => {
      const { applications } = get();

      const authCode =
        input.docType === 'venue'
          ? 'DSW'
          : input.docType === 'financial'
          ? 'FAC'
          : input.department || 'GEN';
      const typeCode =
        input.docType === 'venue' ? 'PERM' : input.docType === 'financial' ? 'FIN' : 'NOC';
      const seq = String(applications.length + 1).padStart(4, '0');
      const year = new Date().getFullYear();
      const trackingRef = `RBU/${authCode}/${year}/${typeCode}-${seq}`;

      const newApp: DocumentApplication = {
        id: crypto.randomUUID(),
        docType: input.docType,
        title: input.title,
        studentName: input.studentName,
        rollNumber: input.rollNumber,
        department: input.department,
        targetAuthority: input.targetAuthority,
        status: 'Pending Review',
        createdDate: new Intl.DateTimeFormat('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date()),
        trackingRef,
        formData: input.formData,
        createdAt: new Date().toISOString(),
      };

      const nextApps = [newApp, ...applications];
      localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(nextApps));
      set({ applications: nextApps });

      // Remote sync to Supabase
      try {
        await supabase.from('document_applications').insert({
          id: newApp.id,
          doc_type: newApp.docType,
          title: newApp.title,
          student_name: newApp.studentName,
          roll_number: newApp.rollNumber,
          department: newApp.department,
          target_authority: newApp.targetAuthority,
          status: newApp.status,
          created_date: newApp.createdDate,
          tracking_ref: newApp.trackingRef,
          form_data: newApp.formData,
        });
      } catch (err) {
        console.warn('Application Supabase sync note:', err);
      }

      return newApp;
    },
  };
});
