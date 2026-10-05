-- ============================================================
-- Migration 002: public.clubs
-- Purpose: Recognized student societies directory
-- ============================================================

CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 3 AND 120),
  slug TEXT NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category TEXT NOT NULL CHECK (category IN ('Cultural','Technical','Sports','Literary','Social','Other')),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 2000),
  lead_name TEXT NOT NULL,
  member_count INT NOT NULL DEFAULT 0 CHECK (member_count >= 0),
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT clubs_slug_unique UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_clubs_category ON public.clubs (category);
