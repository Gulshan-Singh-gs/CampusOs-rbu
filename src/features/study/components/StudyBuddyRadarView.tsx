import React, { useState, useEffect } from 'react';
import { useSessionStore } from '@/services/session/sessionStore';
import { supabase } from '@/shared/lib/supabase';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Badge } from '@/shared/ui/Badge';
import { EmptyState } from '@/shared/ui/EmptyState';
import {
  Compass,
  MapPin,
  Clock,
  Plus,
  CheckCircle,
  BookOpen,
} from 'lucide-react';
import type { StudySession } from '@/shared/types/app.types';

export const StudyBuddyRadarView: React.FC = () => {
  const { profile } = useSessionStore();
  const [activeSessions, setActiveSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    async function loadSessions() {
      try {
        const { data: remoteSessions } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('is_active', true)
          .gt('available_until', new Date().toISOString())
          .order('available_until', { ascending: false });

        if (remoteSessions && remoteSessions.length > 0) {
          setActiveSessions(
            remoteSessions.map((s: any) => ({
              id: s.id,
              studentId: s.student_id,
              studentName: s.student_name || 'Anonymous Student',
              department: s.department || 'CSE',
              subject: s.subject,
              venue: s.venue,
              availableUntil: s.available_until,
              lookingFor: s.looking_for || '',
              isActive: s.is_active,
              createdAt: s.created_at,
            }))
          );
        } else {
          setActiveSessions([]);
        }
      } catch (err) {
        console.warn('Study sessions sync notice:', err);
      }
    }
    loadSessions();
  }, []);

  // Broadcast presence state
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [subject, setSubject] = useState('');
  const [venue, setVenue] = useState('Central Library');
  const duration = 2;
  const [lookingFor, setLookingFor] = useState('');

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const newSession: StudySession = {
      id: crypto.randomUUID(),
      studentId: profile?.id || 'demo',
      studentName: profile?.fullName || 'Anonymous Student',
      department: profile?.department || 'CSE',
      subject: subject.trim(),
      venue: venue.trim(),
      availableUntil: new Date(Date.now() + duration * 3600000).toISOString(),
      lookingFor: lookingFor.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    try {
      if (profile?.id) {
        await supabase.from('study_sessions').insert({
          id: newSession.id,
          student_id: profile.id,
          student_name: newSession.studentName,
          department: newSession.department,
          subject: newSession.subject,
          venue: newSession.venue,
          available_until: newSession.availableUntil,
          looking_for: newSession.lookingFor,
          is_active: true,
        });
      }
    } catch (err) {
      console.warn('Study session persistence notice:', err);
    }

    setActiveSessions([newSession, ...activeSessions]);
    setIsBroadcasting(false);
    setSubject('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 mb-2">
            <Compass className="w-3.5 h-3.5" />
            Opt-in & Privacy-Preserving • Zero Background GPS Tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Study Buddy Radar
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Discover peers studying your subjects right now across campus libraries & halls.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsBroadcasting(!isBroadcasting)}>
          <Plus className="w-4 h-4 mr-1.5" />
          {isBroadcasting ? 'Close Form' : 'Broadcast Study Presence'}
        </Button>
      </div>

      {/* Broadcast Form */}
      {isBroadcasting && (
        <form onSubmit={handleStartSession} className="soft-card p-6 sm:p-8 space-y-4 border" style={{ borderColor: 'var(--surface-border)' }}>
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            Broadcast Your Study Session
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Subject / Topic"
              name="subject"
              placeholder="e.g. Database Management Systems"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <Input
              label="Campus Venue"
              name="venue"
              placeholder="e.g. Central Library, 2nd Floor"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
            />
          </div>
          <Input
            label="What are you working on?"
            name="lookingFor"
            placeholder="e.g. Solving Lab 4 questions or preparing for quiz..."
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary">
              <CheckCircle className="w-4 h-4 mr-2" />
              Activate Radar Presence
            </Button>
          </div>
        </form>
      )}

      {/* Active Sessions List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Active Sessions on Campus ({activeSessions.length})
        </h2>

        {activeSessions.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Active Study Sessions Right Now"
            description="Broadcast your study presence at the library or department reading room to let batchmates join you."
            actionLabel="Broadcast Presence"
            onAction={() => setIsBroadcasting(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="soft-card p-5 sm:p-6 space-y-4 border flex flex-col justify-between"
                style={{ borderColor: 'var(--surface-border)' }}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{session.department}</Badge>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {session.studentName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      Until {new Date(session.availableUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    {session.subject}
                  </h3>

                  <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <MapPin className="w-3.5 h-3.5 text-primary-500" />
                    {session.venue}
                  </p>

                  {session.lookingFor && (
                    <p className="text-xs leading-relaxed italic p-2.5 rounded-lg bg-slate-800/60" style={{ color: 'var(--text-secondary)' }}>
                      "{session.lookingFor}"
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t flex justify-end" style={{ borderColor: 'var(--surface-border)' }}>
                  <Button size="sm" variant="secondary" onClick={() => (window.location.href = '/chat')}>
                    Join Study Table
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
