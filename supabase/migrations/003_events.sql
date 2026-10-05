-- ============================================================
-- Migration 003: public.events
-- Purpose: Campus event feed
-- ============================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 3 AND 160),
  category TEXT NOT NULL CHECK (category IN ('Cultural','Technical','Sports')),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 3000),
  venue TEXT NOT NULL,
  event_date TEXT NOT NULL CHECK (event_date ~ '^\d{4}-\d{2}-\d{2}$'),
  event_time TEXT NOT NULL CHECK (event_time ~ '^\d{2}:\d{2}$'),
  rsvp_count INT NOT NULL DEFAULT 0 CHECK (rsvp_count >= 0),
  banner_gradient TEXT NOT NULL CHECK (banner_gradient IN ('cultural','technical','sports','default')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_date_desc ON public.events (event_date DESC, event_time ASC);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events (category);
CREATE INDEX IF NOT EXISTS idx_events_club_id ON public.events (club_id);
