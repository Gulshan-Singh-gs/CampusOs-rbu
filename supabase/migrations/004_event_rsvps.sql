-- ============================================================
-- Migration 004: public.event_rsvps
-- Purpose: Per-student event registrations
-- ============================================================

CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL CHECK (char_length(trim(student_name)) BETWEEN 2 AND 120),
  student_email TEXT NOT NULL CHECK (student_email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT event_rsvps_unique_per_student UNIQUE (event_id, student_email)
);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON public.event_rsvps (event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_student_email ON public.event_rsvps (student_email);
