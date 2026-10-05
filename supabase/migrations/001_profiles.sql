-- ============================================================
-- Migration 001: public.profiles
-- Purpose: Student profile records (open access model)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) BETWEEN 2 AND 120),
  email TEXT NOT NULL CHECK (email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'),
  roll_number TEXT NOT NULL CHECK (roll_number ~ '^[A-Za-z0-9]{6,15}$'),
  department TEXT NOT NULL CHECK (department IN (
    'CSE','ECE','ME','CE','EE','IT',
    'BBA','BCA','MBA','MCA','B.COM','M.Com','Other'
  )),
  year_of_study INT NOT NULL CHECK (year_of_study BETWEEN 1 AND 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profiles_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_department_year ON public.profiles (department, year_of_study);
