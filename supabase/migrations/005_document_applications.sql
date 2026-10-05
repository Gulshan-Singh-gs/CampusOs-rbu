-- ============================================================
-- Migration 005: public.document_applications
-- Purpose: Generated letterhead wizard submissions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.document_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type TEXT NOT NULL CHECK (doc_type IN ('venue','financial','noc')),
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 3 AND 160),
  student_name TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  department TEXT NOT NULL,
  target_authority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending Review' CHECK (status IN ('Pending Review','Approved','Rejected','Expired')),
  created_date TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (pg_column_size(form_data) < 102400),
  tracking_ref TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT document_applications_tracking_ref_unique UNIQUE (tracking_ref)
);

CREATE INDEX IF NOT EXISTS idx_doc_apps_student_email ON public.document_applications ((form_data->>'email'), created_at DESC);
CREATE INDEX IF NOT EXISTS idx_doc_apps_status ON public.document_applications (status);
CREATE INDEX IF NOT EXISTS idx_doc_apps_tracking_ref ON public.document_applications (tracking_ref);
