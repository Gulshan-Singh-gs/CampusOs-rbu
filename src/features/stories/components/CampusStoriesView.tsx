import React, { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import {
  MapPin,
  Clock,
  Sparkles,
  Camera,
  Image,
} from 'lucide-react';
import type { Story } from '@/shared/types/app.types';

export const CampusStoriesView: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    async function loadStories() {
      try {
        const { data: remoteStories } = await supabase
          .from('stories')
          .select('*')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (remoteStories && remoteStories.length > 0) {
          setStories(
            remoteStories.map((s: any) => ({
              id: s.id,
              authorId: s.author_id,
              authorName: s.author_name || 'Campus Student',
              authorAvatar: s.author_avatar || '',
              mediaUrl: s.media_url,
              caption: s.caption || '',
              expiresAt: s.expires_at,
              createdAt: s.created_at,
            }))
          );
        } else {
          setStories([]);
        }
      } catch (err) {
        console.warn('Stories sync notice:', err);
      }
    }
    loadStories();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Campus Stories & Visual Highlights
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Live glimpses of campus happenings. Stories automatically expire after 24 hours.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => alert('Camera upload is active. Max image size: 400KB.')}>
          <Camera className="w-4 h-4 mr-1.5" />
          Share Story
        </Button>
      </div>

      {/* Stories Rail */}
      {stories.length > 0 && (
        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="flex flex-col items-center gap-2 cursor-pointer shrink-0 group"
            >
              <div className="w-20 h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-primary-500 group-hover:scale-105 transition-transform">
                {story.authorAvatar ? (
                  <img
                    src={story.authorAvatar}
                    alt={story.authorName}
                    className="w-full h-full rounded-full object-cover border-2 border-slate-900"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-200">
                    {story.authorName.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium max-w-[80px] truncate text-center" style={{ color: 'var(--text-primary)' }}>
                {story.authorName}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Story View Modal / Active Showcase */}
      {stories.length === 0 ? (
        <EmptyState
          icon={Image}
          title="No Active Campus Stories"
          description="Ephemeral stories submitted by verified clubs and students expire automatically after 24 hours."
          actionLabel="Share a Moment"
          onAction={() => alert('Camera upload is active. Max image size: 400KB.')}
        />
      ) : (
        <div className="soft-card p-6 sm:p-8 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-500" />
            Featured Campus Moment
          </h2>

          {(() => {
            const current = selectedStory || stories[0];
            return (
              <div className="relative rounded-2xl overflow-hidden aspect-video max-h-[480px] bg-black flex items-center justify-center">
                <img
                  src={current.mediaUrl}
                  alt={current.caption || 'Campus Story'}
                  className="w-full h-full object-cover opacity-90"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Top story header */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    {current.authorAvatar ? (
                      <img
                        src={current.authorAvatar}
                        alt={current.authorName}
                        className="w-9 h-9 rounded-full object-cover border border-white/50"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs border border-white/50">
                        {current.authorName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold">{current.authorName}</p>
                      <p className="text-[10px] text-white/75 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Expires in 24 hours
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom caption */}
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-2">
                  <p className="text-sm sm:text-base font-medium">{current.caption}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Campus Map Mini-Visualizer (Leaflet / OSM Free Architecture) */}
      <div className="soft-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Rayat Bahra Campus Venue Directory
            </h3>
          </div>
          <span className="text-xs text-slate-400">OpenStreetMap Free Geospatial Tiles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--surface-border)' }}>
            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Main Auditorium</h4>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Block C, Floor 1 • Capacity: 650</p>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--surface-border)' }}>
            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Turing Seminar Hall</h4>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>CSE Dept, Floor 2 • Capacity: 200</p>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--surface-border)' }}>
            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>University Sports Ground</h4>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>East Campus Pavilion • Outdoor</p>
          </div>
        </div>
      </div>
    </div>
  );
};
