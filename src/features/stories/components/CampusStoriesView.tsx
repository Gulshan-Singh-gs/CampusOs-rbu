import React, { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import {
  MapPin,
  Clock,
  Sparkles,
  Camera,
} from 'lucide-react';
import type { Story } from '@/shared/types/app.types';

export const CampusStoriesView: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const stories: Story[] = [
    {
      id: 'st1',
      authorId: 'u1',
      authorName: 'ACM Student Chapter',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      caption: 'Hackathon kickoff at Campus Central Auditorium! 50+ squads registered. 🚀🔥',
      expiresAt: new Date(Date.now() + 68400000).toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'st2',
      authorId: 'u2',
      authorName: 'RBU Sports Council',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
      caption: 'Inter-Department Cricket Tournament Finals underway at Ground 1! 🏏🏆',
      expiresAt: new Date(Date.now() + 45000000).toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'st3',
      authorId: 'u3',
      authorName: 'Robotics Club',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
      caption: 'Testing line-follower & maze solver bots in the Mechatronics Lab.',
      expiresAt: new Date(Date.now() + 32000000).toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

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
      <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => setSelectedStory(story)}
            className="flex flex-col items-center gap-2 cursor-pointer shrink-0 group"
          >
            <div className="w-20 h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-primary-500 group-hover:scale-105 transition-transform">
              <img
                src={story.authorAvatar}
                alt={story.authorName}
                className="w-full h-full rounded-full object-cover border-2 border-slate-900"
              />
            </div>
            <span className="text-xs font-medium max-w-[80px] truncate text-center" style={{ color: 'var(--text-primary)' }}>
              {story.authorName}
            </span>
          </div>
        ))}
      </div>

      {/* Story View Modal / Active Showcase */}
      <div className="soft-card p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-500" />
          Featured Campus Moment
        </h2>

        {selectedStory || stories[0] ? (
          (() => {
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
                    <img
                      src={current.authorAvatar}
                      alt={current.authorName}
                      className="w-9 h-9 rounded-full object-cover border border-white/50"
                    />
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
          })()
        ) : null}
      </div>

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
