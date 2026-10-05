-- ============================================================================
-- RAYAT BAHRA UNIVERSITY (RBU) CAMPUS OS - UNIFIED PRODUCTION SCHEMA & SEED DATA
-- Project Reference: tzuecqaopmnhcbmadeow
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLES DEFINITION

-- User Profiles
-- Accommodates both Supabase auth users & open-student access model
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    roll_number TEXT,
    department TEXT,
    year_of_study INT DEFAULT 1,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'club_admin', 'dsw_admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Campus Clubs & Societies
CREATE TABLE IF NOT EXISTS public.clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Cultural', 'Technical', 'Sports', 'Literary', 'Social', 'Other')),
    description TEXT,
    lead_name TEXT,
    lead_email TEXT,
    member_count INT DEFAULT 0,
    banner_url TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Backfill columns in case clubs table was created in an earlier partial run
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS member_count INT DEFAULT 0;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS lead_name TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS lead_email TEXT;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Backfill columns in case events table was created in an earlier partial run
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Cultural';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.events ALTER COLUMN location DROP NOT NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS banner_gradient TEXT DEFAULT 'default';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS rsvp_count INT DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_time TEXT DEFAULT '10:00';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_capacity INT DEFAULT 500;

-- University Events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Cultural' CHECK (category IN ('Cultural', 'Technical', 'Sports')),
    description TEXT,
    venue TEXT NOT NULL,
    event_date TEXT NOT NULL, -- Stored in ISO 'YYYY-MM-DD' format for reliable client formatting
    event_time TEXT NOT NULL DEFAULT '10:00',
    max_capacity INT DEFAULT 500,
    rsvp_count INT DEFAULT 0 CHECK (rsvp_count >= 0),
    banner_gradient TEXT DEFAULT 'default' CHECK (banner_gradient IN ('cultural', 'technical', 'sports', 'default')),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Event RSVPs (1-Tap Registrations)
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlisted')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT event_rsvps_unique_per_student UNIQUE(event_id, student_email)
);

ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS student_email TEXT;

-- Official Document Applications (Letters to DSW, Approvals, NOCs)
CREATE TABLE IF NOT EXISTS public.document_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_type TEXT NOT NULL CHECK (doc_type IN ('venue', 'financial', 'noc')),
    title TEXT NOT NULL,
    student_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    department TEXT NOT NULL,
    target_authority TEXT NOT NULL DEFAULT 'Dean of Student Welfare',
    status TEXT DEFAULT 'Pending Review' CHECK (status IN ('Pending Review', 'Approved', 'Rejected', 'Expired')),
    created_date TEXT NOT NULL,
    tracking_ref TEXT UNIQUE NOT NULL,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.document_applications ADD COLUMN IF NOT EXISTS doc_type TEXT;
ALTER TABLE public.document_applications ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.document_applications ADD COLUMN IF NOT EXISTS roll_number TEXT;
ALTER TABLE public.document_applications ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.document_applications ADD COLUMN IF NOT EXISTS created_date TEXT;
ALTER TABLE public.document_applications ADD COLUMN IF NOT EXISTS tracking_ref TEXT;
ALTER TABLE public.document_applications ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}'::jsonb;

-- 3. AUTOMATIC TRIGGERS & FUNCTIONS

-- A. Auto-maintain event RSVP counts
CREATE OR REPLACE FUNCTION public.tg_sync_rsvp_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.events
        SET rsvp_count = rsvp_count + 1
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.events
        SET rsvp_count = GREATEST(rsvp_count - 1, 0)
        WHERE id = OLD.event_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_rsvp_count_insert ON public.event_rsvps;
CREATE TRIGGER trg_rsvp_count_insert
AFTER INSERT ON public.event_rsvps
FOR EACH ROW EXECUTE FUNCTION public.tg_sync_rsvp_count();

DROP TRIGGER IF EXISTS trg_rsvp_count_delete ON public.event_rsvps;
CREATE TRIGGER trg_rsvp_count_delete
AFTER DELETE ON public.event_rsvps
FOR EACH ROW EXECUTE FUNCTION public.tg_sync_rsvp_count();

-- B. Sync Auth signup to profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, email, full_name, avatar_url, roll_number, department)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'rbu_roll_number',
    new.raw_user_meta_data->>'department'
  )
  ON CONFLICT (email) DO UPDATE
  SET auth_user_id = EXCLUDED.auth_user_id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_applications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public readable, editable/insertable
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles insertable" ON public.profiles;
CREATE POLICY "Profiles insertable" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);

-- Clubs: Public readable
DROP POLICY IF EXISTS "Clubs are viewable by everyone" ON public.clubs;
CREATE POLICY "Clubs are viewable by everyone" ON public.clubs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert/update clubs" ON public.clubs;
DROP POLICY IF EXISTS "Admins can manage clubs" ON public.clubs;
CREATE POLICY "Admins can manage clubs" ON public.clubs FOR ALL USING (true);

-- Events: Public readable
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (true);

-- RSVPs: Public readable, open-model insert/delete
DROP POLICY IF EXISTS "Users can view own RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Admins view all RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "RSVPs viewable by everyone" ON public.event_rsvps;
CREATE POLICY "RSVPs viewable by everyone" ON public.event_rsvps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Students can create RSVPs" ON public.event_rsvps;
CREATE POLICY "Students can create RSVPs" ON public.event_rsvps FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Students can delete RSVPs" ON public.event_rsvps;
CREATE POLICY "Students can delete RSVPs" ON public.event_rsvps FOR DELETE USING (true);

-- Document Applications: Read & submit
DROP POLICY IF EXISTS "Users can view own applications" ON public.document_applications;
DROP POLICY IF EXISTS "DSW can view all applications" ON public.document_applications;
DROP POLICY IF EXISTS "Applications readable" ON public.document_applications;
CREATE POLICY "Applications readable" ON public.document_applications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can submit applications" ON public.document_applications;
DROP POLICY IF EXISTS "Applications insertable" ON public.document_applications;
CREATE POLICY "Applications insertable" ON public.document_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "DSW can update application status" ON public.document_applications;
DROP POLICY IF EXISTS "Applications updatable" ON public.document_applications;
CREATE POLICY "Applications updatable" ON public.document_applications FOR UPDATE USING (true);

-- 5. RAYAT BAHRA UNIVERSITY SEED DATA
INSERT INTO public.clubs (id, name, code, category, description, lead_name, lead_email, member_count, icon)
VALUES
('a0111111-1111-1111-1111-111111111111', 'RBU Tech Council', 'RBU-TECH', 'Technical', 'Official student technical wing responsible for hackathons, coding contests, and technical workshops across campus.', 'Aaravpreet Singh', 'techcouncil@rayatbahra.edu.in', 180, 'Code'),
('b0222222-2222-2222-2222-222222222222', 'Raunak Cultural Society', 'RBU-RAUNAK', 'Cultural', 'Promoting Punjabi heritage, dance, theater, music, and university-wide cultural fests.', 'Simran Kaur', 'raunak@rayatbahra.edu.in', 340, 'Music'),
('c0333333-3333-3333-3333-333333333333', 'RBU Athletics & Sports Board', 'RBU-SPORTS', 'Sports', 'Governing body for intra-university and inter-university sports competitions, cricket leagues, and track events.', 'Gurinder Sharma', 'sports@rayatbahra.edu.in', 220, 'Trophy'),
('d0444444-4444-4444-4444-444444444444', 'Shotter Jam Cinematics', 'RBU-SHOTTER', 'Cultural', 'Photography and cinematography society covering university convocations, youth festivals, and documentary projects.', 'Riya Sharma', 'shotterjam@rayatbahra.edu.in', 120, 'Camera'),
('e0555555-5555-5555-5555-555555555555', 'Inkwell Literary Society', 'RBU-INKWELL', 'Literary', 'Literary and debating society organizing parliamentary debates, open mics, poetry slams, and MUNs.', 'Kabir Malhotra', 'inkwell@rayatbahra.edu.in', 95, 'PenTool')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.events (id, club_id, title, category, description, venue, location, event_date, event_time, max_capacity, rsvp_count, banner_gradient, is_featured)
VALUES
(
    'e0111111-1111-1111-1111-111111111111',
    'b0222222-2222-2222-2222-222222222222',
    'UTSAV 2026 - Annual Cultural Fest',
    'Cultural',
    'The flagship 2-day cultural extravaganza of Rayat Bahra University featuring star nights, bhangra competitions, fashion shows, and live bands.',
    'Main University Open Air Theater (OAT)',
    'Main University Open Air Theater (OAT)',
    '2026-03-15',
    '18:00',
    5000,
    340,
    'cultural',
    true
),
(
    'e0222222-2222-2222-2222-222222222222',
    'b0222222-2222-2222-2222-222222222222',
    'Lohri Bonfire & Folk Celebration',
    'Cultural',
    'Traditional university Lohri celebration with folk performances, giddha, sugarcane distribution, and evening bonfires.',
    'RBU Student Centre Lawns',
    'RBU Student Centre Lawns',
    '2026-01-13',
    '17:30',
    1200,
    88,
    'cultural',
    false
),
(
    'e0333333-3333-3333-3333-333333333333',
    'c0333333-3333-3333-3333-333333333333',
    'RBU Premier Cricket League 2026',
    'Sports',
    'Inter-departmental T20 cricket tournament spanning two weeks. Teams representing CSE, Mechanical, Pharmacy, Law, and Management.',
    'RBU Sports Complex Grounds',
    'RBU Sports Complex Grounds',
    '2026-02-01',
    '09:00',
    800,
    115,
    'sports',
    true
),
(
    'e0444444-4444-4444-4444-444444444444',
    'a0111111-1111-1111-1111-111111111111',
    'HackCampus 2026 (36-Hour Hackathon)',
    'Technical',
    'National level university hackathon with problem statements in AI, FinTech, and Campus Automation. ₹50,000 prize pool.',
    'CS Block Computing Labs 4 & 5',
    'CS Block Computing Labs 4 & 5',
    '2026-11-22',
    '09:00',
    300,
    42,
    'technical',
    true
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title, category = EXCLUDED.category, venue = EXCLUDED.venue, location = EXCLUDED.location, rsvp_count = EXCLUDED.rsvp_count;
