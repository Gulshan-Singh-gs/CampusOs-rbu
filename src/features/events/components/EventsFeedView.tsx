import React, { useEffect } from 'react';
import { useCampusStore } from '@/services/api/dataStore';
import { useSessionStore } from '@/services/session/sessionStore';
import { ServiceGrid } from '@/shared/ui/ServiceGrid';
import { Button } from '@/shared/ui/Button';
import {
  Sparkles,
  Flame,
  Code2,
  Trophy,
  Search,
  MapPin,
  Calendar,
  Clock,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatIndianDate } from '@/shared/lib/formatters';

export const EventsFeedView: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useSessionStore();
  const {
    events,
    userRsvps,
    selectedCategory,
    searchQuery,
    setCategory,
    setSearchQuery,
    toggleRsvp,
    fetchFromSupabase,
  } = useCampusStore();

  useEffect(() => {
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  // Service grid action models
  const serviceCategories = [
    {
      id: 'all',
      title: 'All Highlights',
      subtitle: `${events.length} campus events`,
      icon: Sparkles,
      isActive: selectedCategory === 'All',
      onClick: () => setCategory('All'),
    },
    {
      id: 'cultural',
      title: 'Cultural Fests',
      subtitle: 'UTSAV & Lohri',
      icon: Flame,
      isActive: selectedCategory === 'Cultural',
      onClick: () => setCategory('Cultural'),
    },
    {
      id: 'technical',
      title: 'Tech & Hackathons',
      subtitle: 'HackCampus & AI',
      icon: Code2,
      isActive: selectedCategory === 'Technical',
      onClick: () => setCategory('Technical'),
    },
    {
      id: 'sports',
      title: 'Athletics & Sports',
      subtitle: 'Cricket & Leagues',
      icon: Trophy,
      isActive: selectedCategory === 'Sports',
      onClick: () => setCategory('Sports'),
    },
  ];

  const filteredEvents = events.filter((ev) => {
    const matchesCategory = selectedCategory === 'All' || ev.category === selectedCategory;
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRsvpClick = (eventId: string) => {
    if (!profile) {
      navigate('/onboarding');
      return;
    }
    toggleRsvp(eventId, profile.fullName, profile.email);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
      {/* 1. Header / Editorial Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Campus Life & Services
        </h1>
        <p className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>
          Discover verified university festivals, student hackathons, and sports tournaments.
        </p>
      </div>

      {/* 2. Soft Circular Service Controls (Hero Grid matching Reference Design) */}
      <ServiceGrid
        title="EXPLORE CATEGORIES"
        subtitle="Select a focus area to filter official university feeds"
        items={serviceCategories}
      />

      {/* 3. Search Bar */}
      <div className="max-w-2xl mx-auto relative">
        <Search
          className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
          style={{ color: 'var(--text-secondary)' }}
        />
        <input
          type="text"
          placeholder="Search by event title, venue, or details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 pl-11 pr-5 rounded-full text-sm outline-none transition-all"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* 4. Filtered Events Display with Soft Minimal Cards */}
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between px-1">
          <h3
            className="text-xs font-bold uppercase tracking-[0.14em]"
            style={{ color: 'var(--text-secondary)' }}
          >
            ACTIVE LISTINGS ({filteredEvents.length})
          </h3>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setCategory('All')}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div
            className="soft-card p-12 text-center space-y-3"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
              No campus events found
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Try adjusting your search criteria or select another circular category above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((ev) => {
              const isRegistered = userRsvps.has(ev.id);
              return (
                <div
                  key={ev.id}
                  className="soft-card p-6 flex flex-col justify-between space-y-5 transition-transform hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: 'var(--surface)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--surface-border)',
                        }}
                      >
                        {ev.category}
                      </span>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        {ev.rsvpCount} RSVP'd
                      </span>
                    </div>

                    <h4
                      className="text-lg font-bold tracking-tight leading-snug"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {ev.title}
                    </h4>

                    <p
                      className="text-xs sm:text-sm line-clamp-3 leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {ev.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t space-y-4" style={{ borderColor: 'var(--surface-border)' }}>
                    <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 opacity-60 shrink-0" />
                        <span>{formatIndianDate(ev.eventDate)}</span>
                        <span className="opacity-40">•</span>
                        <Clock className="w-3.5 h-3.5 opacity-60 shrink-0" />
                        <span>{ev.eventTime} IST</span>
                      </div>
                    </div>

                    <Button
                      variant={isRegistered ? 'outline' : 'primary'}
                      size="sm"
                      fullWidth
                      onClick={() => handleRsvpClick(ev.id)}
                      className={isRegistered ? 'border-emerald-500 text-emerald-500' : ''}
                    >
                      {isRegistered ? (
                        <>
                          <Check className="w-4 h-4 mr-1.5" />
                          Registered
                        </>
                      ) : (
                        'RSVP 1-Tap'
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
