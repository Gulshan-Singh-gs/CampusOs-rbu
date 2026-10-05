import { create } from 'zustand';
import type { Profile, CreateProfileInput } from '@/shared/types/app.types';
import { supabase } from '@/shared/lib/supabase';

interface SessionState {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (input: CreateProfileInput) => void;
  clearSession: () => Promise<void>;
  initializeAuthListener: () => void;
}

const STORAGE_KEY = 'campusos_student_session';
const APPS_STORAGE_KEY = 'campusos_submitted_applications';
const RSVPS_STORAGE_KEY = 'campusos_user_rsvps';

export const useSessionStore = create<SessionState>((set) => {
  // Initialize from localStorage cache
  const saved = localStorage.getItem(STORAGE_KEY);
  let initialProfile: Profile | null = null;
  if (saved) {
    try {
      initialProfile = JSON.parse(saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return {
    profile: initialProfile,
    isLoading: false,

    setProfile: (input: CreateProfileInput) => {
      const newProfile: Profile = {
        id: crypto.randomUUID(),
        ...input,
        role: input.role || 'student',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      set({ profile: newProfile });
    },

    clearSession: async () => {
      // 1. Sign out from Supabase Auth
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut notice:', err);
      }

      // 2. Clear all sensitive account caches to prevent cross-account workstation leakage
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(APPS_STORAGE_KEY);
      localStorage.removeItem(RSVPS_STORAGE_KEY);
      localStorage.removeItem('campusos_local_audit_logs');

      set({ profile: null });
    },

    initializeAuthListener: () => {
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          localStorage.removeItem(STORAGE_KEY);
          set({ profile: null });
        } else if (session?.user) {
          // Sync authenticated identity with profile
          const user = session.user;
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', user.id)
            .single();

          if (dbProfile) {
            const mapped: Profile = {
              id: dbProfile.id,
              fullName: dbProfile.full_name,
              email: dbProfile.email,
              rollNumber: dbProfile.roll_number || '',
              department: dbProfile.department || 'CSE',
              yearOfStudy: dbProfile.year_of_study || 1,
              role: dbProfile.role || 'student',
              isVerified: dbProfile.is_verified || false,
              createdAt: dbProfile.created_at,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
            set({ profile: mapped });
          }
        }
      });
    },
  };
});
