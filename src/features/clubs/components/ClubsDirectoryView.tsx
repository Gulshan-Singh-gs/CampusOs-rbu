import React, { useEffect, useState } from 'react';
import { useCampusStore } from '@/services/api/dataStore';
import { ServiceGrid } from '@/shared/ui/ServiceGrid';
import { Button } from '@/shared/ui/Button';
import { Toast, ToastProps } from '@/shared/ui/Toast';
import {
  Users2,
  Code2,
  Palette,
  Camera,
  PenTool,
  Trophy,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ClubsDirectoryView: React.FC = () => {
  const { clubs, fetchFromSupabase } = useCampusStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'> | null>(null);

  useEffect(() => {
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  // Circular service controls mapping for society domains
  const clubServices = [
    {
      id: 'all',
      title: 'All Societies',
      subtitle: `${clubs.length} chapters`,
      icon: Users2,
      isActive: selectedFilter === 'All',
      onClick: () => setSelectedFilter('All'),
    },
    {
      id: 'cultural',
      title: 'Cultural Wing',
      subtitle: 'Dance, Theater, Music',
      icon: Palette,
      isActive: selectedFilter === 'Cultural',
      onClick: () => setSelectedFilter('Cultural'),
    },
    {
      id: 'tech',
      title: 'Tech Councils',
      subtitle: 'Coding, AI, Robotics',
      icon: Code2,
      isActive: selectedFilter === 'Technical',
      onClick: () => setSelectedFilter('Technical'),
    },
    {
      id: 'arts',
      title: 'Media & Sports',
      subtitle: 'Photo, Sports & Lit',
      icon: Trophy,
      isActive: selectedFilter === 'Other',
      onClick: () => setSelectedFilter('Other'),
    },
  ];

  const filteredClubs = clubs.filter((c) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Other') {
      return c.category === 'Sports' || c.category === 'Literary' || c.category === 'Other';
    }
    return c.category === selectedFilter;
  });

  const getClubIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'Music':
        return Palette;
      case 'Code':
        return Code2;
      case 'Camera':
        return Camera;
      case 'PenTool':
        return PenTool;
      case 'Trophy':
        return Trophy;
      default:
        return Users2;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
      {/* 1. Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Student Societies & Councils
        </h1>
        <p className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>
          Official recognized university chapters driving campus culture and technical innovation.
        </p>
      </div>

      {/* 2. Soft Circular Service Controls */}
      <ServiceGrid
        title="EXPLORE CHAPTERS"
        subtitle="Filter by disciplinary councils and interest wings"
        items={clubServices}
      />

      {/* 3. Society Roster Grid */}
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between px-1">
          <h3
            className="text-xs font-bold uppercase tracking-[0.14em]"
            style={{ color: 'var(--text-secondary)' }}
          >
            ACTIVE SOCIETIES ({filteredClubs.length})
          </h3>
          <span
            className="text-xs font-medium flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            RBU DSW Endorsed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => {
            const Icon = getClubIcon(club.icon);
            return (
              <div
                key={club.id}
                className="soft-card p-6 flex flex-col justify-between space-y-5 transition-transform hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                      style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--surface-border)',
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: 'var(--icon-color)' }} strokeWidth={1.8} />
                    </div>
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--surface-border)',
                      }}
                    >
                      {club.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      {club.name}
                    </h4>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Lead: <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{club.leadName}</span> •{' '}
                      <span className="text-emerald-500 font-semibold">{club.memberCount} members</span>
                    </p>
                  </div>

                  <p
                    className="text-xs leading-relaxed line-clamp-3"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {club.description}
                  </p>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() =>
                      setToast({
                        type: 'success',
                        title: `Inquiry Submitted to ${club.name}`,
                        message: `Lead ${club.leadName} has been notified. Check your email for orientation details.`,
                      })
                    }
                  >
                    Join Chapter
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Toast component */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};
