import React, { useState, useEffect } from 'react';
import { useSessionStore } from '@/services/session/sessionStore';
import { supabase } from '@/shared/lib/supabase';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { EmptyState } from '@/shared/ui/EmptyState';
import {
  Sparkles,
  Users,
  CheckCircle2,
  XCircle,
  Rocket,
  FolderGit2,
} from 'lucide-react';
import type { ProjectIntent } from '@/shared/types/app.types';
import { ProjectIntentInputSchema } from '@/shared/lib/validation';

export const SquadSwipeView: React.FC = () => {
  const { profile } = useSessionStore();
  const [activeTab, setActiveTab] = useState<'discover' | 'create'>('discover');
  const [intents, setIntents] = useState<ProjectIntent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matched, setMatched] = useState<ProjectIntent | null>(null);

  useEffect(() => {
    async function loadIntents() {
      try {
        const { data: remoteIntents } = await supabase
          .from('project_intents')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (remoteIntents && remoteIntents.length > 0) {
          setIntents(
            remoteIntents.map((i: any) => ({
              id: i.id,
              authorId: i.author_id,
              authorName: i.author_name || 'Student Creator',
              authorDepartment: i.author_department || 'CSE',
              projectTitle: i.project_title,
              tagline: i.tagline,
              description: i.description,
              targetRoles: i.target_roles || [],
              requiredSkills: i.required_skills || [],
              isActive: i.is_active,
              createdAt: i.created_at,
            }))
          );
        } else {
          setIntents([]);
        }
      } catch (err) {
        console.warn('Squad intents sync notice:', err);
      }
    }
    loadIntents();
  }, []);

  // Form state
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [desc, setDesc] = useState('');
  const [roles, setRoles] = useState('Frontend Developer, Backend Engineer');
  const [skills, setSkills] = useState('React, Node.js, SQL');
  const [formError, setFormError] = useState('');

  const currentIntent = intents[currentIndex];

  const handleSwipe = async (direction: 'pass' | 'like') => {
    if (direction === 'like' && currentIntent) {
      setMatched(currentIntent);
      try {
        if (profile?.id) {
          await supabase.from('intent_swipes').insert({
            intent_id: currentIntent.id,
            swiper_id: profile.id,
            action: 'like',
          });
        }
      } catch (err) {
        console.warn('Swipe sync notice:', err);
      }
    }
    if (currentIndex < intents.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(intents.length);
    }
  };

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = ProjectIntentInputSchema.safeParse({
      projectTitle: title,
      tagline,
      description: desc,
      targetRoles: roles.split(',').map((r) => r.trim()).filter(Boolean),
      requiredSkills: skills.split(',').map((s) => s.trim()).filter(Boolean),
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0].message);
      return;
    }

    const newIntent: ProjectIntent = {
      id: crypto.randomUUID(),
      authorId: profile?.id || 'demo',
      authorName: profile?.fullName || 'Anonymous Student',
      authorDepartment: profile?.department || 'CSE',
      projectTitle: parsed.data.projectTitle,
      tagline: parsed.data.tagline,
      description: parsed.data.description,
      targetRoles: parsed.data.targetRoles,
      requiredSkills: parsed.data.requiredSkills,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setIntents([newIntent, ...intents]);
    setActiveTab('discover');
    setCurrentIndex(0);

    try {
      if (profile?.id) {
        await supabase.from('project_intents').insert({
          id: newIntent.id,
          author_id: profile.id,
          author_name: newIntent.authorName,
          author_department: newIntent.authorDepartment,
          project_title: newIntent.projectTitle,
          tagline: newIntent.tagline,
          description: newIntent.description,
          target_roles: newIntent.targetRoles,
          required_skills: newIntent.requiredSkills,
          is_active: true,
        });
      }
    } catch (err) {
      console.warn('Project intent persistence notice:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-500">
          <Sparkles className="w-3.5 h-3.5" />
          Squad Matchmaker • Hackathons & Capstone Projects
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Find Teammates & Squad Up
        </h1>
        <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Intent-based matchmaking. Match with peer developers, designers, and project leads.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
            activeTab === 'discover'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white shadow-sm'
          }`}
        >
          Discover Projects
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
            activeTab === 'create'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white shadow-sm'
          }`}
        >
          Post Project Pitch
        </button>
      </div>

      {matched && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-emerald-400">Match Initiated!</p>
              <p className="text-xs text-slate-300">
                You expressed interest in "{matched.projectTitle}".
              </p>
            </div>
          </div>
          <Button size="sm" variant="primary" onClick={() => (window.location.href = '/chat')}>
            Open Room
          </Button>
        </div>
      )}

      {activeTab === 'discover' ? (
        currentIntent ? (
          <div className="soft-card p-6 sm:p-8 space-y-6 relative border" style={{ borderColor: 'var(--surface-border)' }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-primary-500">
                  {currentIntent.authorDepartment} Project Lead
                </span>
                <h2 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {currentIntent.projectTitle}
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Pitched by {currentIntent.authorName}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
                <Rocket className="w-6 h-6" />
              </div>
            </div>

            <p className="text-sm italic font-medium" style={{ color: 'var(--text-primary)' }}>
              "{currentIntent.tagline}"
            </p>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {currentIntent.description}
            </p>

            {/* Target Roles */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Looking For:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentIntent.targetRoles.map((role, idx) => (
                  <Badge key={idx} variant="info">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Required Skills */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Tech Stack / Skills:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentIntent.requiredSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Swipe Action Controls (Accessible Buttons) */}
            <div className="pt-4 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => handleSwipe('pass')}
                className="w-14 h-14 rounded-full border border-slate-700 bg-slate-800/80 hover:bg-rose-500/20 hover:border-rose-500 text-rose-400 flex items-center justify-center transition-all shadow-md hover:scale-105"
                title="Pass"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => handleSwipe('like')}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-lg hover:scale-105"
                title="Express Interest / Match"
              >
                <Rocket className="w-7 h-7" />
              </button>
            </div>
          </div>
        ) : intents.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="No Active Project Pitches"
            description="Be the first student to pitch a hackathon idea, capstone project, or open-source initiative to assemble a squad."
            actionLabel="Create Project Pitch"
            onAction={() => setActiveTab('create')}
          />
        ) : (
          <div className="soft-card p-12 text-center space-y-4">
            <Users className="w-12 h-12 mx-auto text-slate-500" />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              You're all caught up!
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No more active project pitches in your feed. Pitch your own project to find teammates!
            </p>
            <Button variant="primary" onClick={() => setActiveTab('create')}>
              Post a Pitch
            </Button>
          </div>
        )
      ) : (
        <form onSubmit={handleCreateIntent} className="soft-card p-6 sm:p-8 space-y-5">
          {formError && (
            <div className="p-3 text-xs rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {formError}
            </div>
          )}
          <Input
            label="Project Title"
            name="title"
            placeholder="e.g. AI Autonomous Drone"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label="1-Line Elevator Pitch"
            name="tagline"
            placeholder="e.g. Edge computing drone with PX4 autopilot for smart farming."
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Detailed Description & Goals
            </label>
            <textarea
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Explain the hackathon track, what is completed, and timeline..."
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--surface-border)',
                color: 'var(--text-primary)',
              }}
              required
            />
          </div>
          <Input
            label="Roles Needed (comma separated)"
            name="roles"
            value={roles}
            onChange={(e) => setRoles(e.target.value)}
            placeholder="e.g. UI/UX Designer, Python Developer"
            required
          />
          <Input
            label="Required Skills (comma separated)"
            name="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. Figma, React, PyTorch"
            required
          />
          <Button type="submit" variant="primary" fullWidth size="lg">
            Publish Pitch to Campus Feed
          </Button>
        </form>
      )}
    </div>
  );
};
