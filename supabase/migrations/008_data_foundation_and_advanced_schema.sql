-- ============================================================================
-- CAMPUSOS RBU — MIGRATION 008: DATA FOUNDATION & ADVANCED SCHEMA REFACTOR
-- Phase P1: Temporal Datatypes, Normalized Departments, Social Graph, Passport
-- ============================================================================

-- 1. DEPARTMENTS DIRECTORY (DYNAMIC & NORMALIZED)
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    faculty_head TEXT,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial departments
INSERT INTO public.departments (id, name, faculty_head, code)
VALUES
    ('CSE', 'Computer Science & Engineering', 'Dr. Harpreet Singh', 'CSE'),
    ('ECE', 'Electronics & Communication Engineering', 'Dr. Neha Verma', 'ECE'),
    ('ME', 'Mechanical Engineering', 'Dr. Rajesh Sharma', 'ME'),
    ('CE', 'Civil Engineering', 'Dr. Sunita Rani', 'CE'),
    ('EE', 'Electrical Engineering', 'Dr. Amit Patel', 'EE'),
    ('IT', 'Information Technology', 'Dr. Anjali Gupta', 'IT'),
    ('BBA', 'Bachelor of Business Administration', 'Dr. Vikram Malhotra', 'BBA'),
    ('BCA', 'Bachelor of Computer Applications', 'Dr. Sandeep Kumar', 'BCA'),
    ('MBA', 'Master of Business Administration', 'Dr. Pooja Chadha', 'MBA'),
    ('MCA', 'Master of Computer Applications', 'Dr. Gurinder Singh', 'MCA'),
    ('B.COM', 'Bachelor of Commerce', 'Dr. Meenakshi Joshi', 'BCOM'),
    ('M.Com', 'Master of Commerce', 'Dr. Jasleen Kaur', 'MCOM'),
    ('Other', 'Other University Department', 'Office of Registrar', 'OTH')
ON CONFLICT (id) DO NOTHING;

GRANT SELECT ON public.departments TO anon, authenticated;

-- 2. EVENT TEMPORAL REFACTOR (TIMESTAMPTZ STARTS_AT & ENDS_AT)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS lifecycle_status TEXT DEFAULT 'published' CHECK (lifecycle_status IN ('draft', 'published', 'cancelled', 'completed', 'archived'));
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_capacity INT DEFAULT 150 CHECK (max_capacity > 0);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue_coordinates POINT;

-- Migrate existing textual event_date and event_time to canonical UTC starts_at and ends_at
UPDATE public.events
SET 
    starts_at = (event_date || ' ' || COALESCE(NULLIF(event_time, ''), '10:00') || ':00+05:30')::TIMESTAMPTZ,
    ends_at = ((event_date || ' ' || COALESCE(NULLIF(event_time, ''), '10:00') || ':00+05:30')::TIMESTAMPTZ + interval '3 hours')
WHERE starts_at IS NULL AND event_date IS NOT NULL;

-- Temporal indexes for ultra-fast query performance
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON public.events (starts_at ASC);
CREATE INDEX IF NOT EXISTS idx_events_lifecycle ON public.events (lifecycle_status);

-- 3. CAMPUS PASSPORT & EXTENDED PROFILE NORMALIZATION
-- Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'Engineering',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed standard university skills
INSERT INTO public.skills (name, category)
VALUES
    ('React & TypeScript', 'Software Engineering'),
    ('Python & Data Science', 'Data & AI'),
    ('UI/UX & Figma Design', 'Product Design'),
    ('Cloud & DevOps', 'Infrastructure'),
    ('Embedded Systems & IoT', 'Hardware'),
    ('Public Speaking & Debate', 'Leadership'),
    ('Event Management', 'Operations'),
    ('Financial Modeling', 'Finance'),
    ('Robotics & Arduino', 'Hardware'),
    ('Mobile App Development', 'Software Engineering')
ON CONFLICT (name) DO NOTHING;

GRANT SELECT ON public.skills TO anon, authenticated;

-- Student Skills Link Table
CREATE TABLE IF NOT EXISTS public.student_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level TEXT DEFAULT 'Intermediate' CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    endorsement_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_skill UNIQUE (student_id, skill_id)
);

-- Skill Endorsements Table (Strictly Authenticated, No Self-Endorsement)
CREATE TABLE IF NOT EXISTS public.skill_endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_skill_id UUID NOT NULL REFERENCES public.student_skills(id) ON DELETE CASCADE,
    endorser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_endorsement_per_user UNIQUE (student_skill_id, endorser_id)
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS public.student_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    badge_icon TEXT DEFAULT 'Trophy',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. CAMPUS SOCIAL GRAPH (CONNECTIONS)
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_connection_pair UNIQUE (requester_id, recipient_id),
    CONSTRAINT chk_no_self_connection CHECK (requester_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_requester ON public.connections (requester_id, status);
CREATE INDEX IF NOT EXISTS idx_connections_recipient ON public.connections (recipient_id, status);

-- 5. SQUAD MATCHING & PROJECT INTENTS
CREATE TABLE IF NOT EXISTS public.project_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_title TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    target_roles TEXT[] NOT NULL DEFAULT '{}',
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.intent_swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swiper_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    intent_id UUID NOT NULL REFERENCES public.project_intents(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('pass', 'like', 'superlike')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_swiper_intent UNIQUE (swiper_id, intent_id)
);

-- 6. EPHEMERAL CHAT ROOMS & REALTIME MESSAGING
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    is_ephemeral BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_chat_member UNIQUE (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) BETWEEN 1 AND 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages (room_id, created_at ASC);

-- 7. CAMPUS STORIES (24-HOUR AUTO-EXPIRATION)
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    caption TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stories_active ON public.stories (expires_at DESC);

-- 8. STUDY BUDDY RADAR (OPT-IN PRIVACY-FIRST PRESENCE)
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    venue TEXT NOT NULL,
    available_until TIMESTAMPTZ NOT NULL,
    looking_for TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_active ON public.study_sessions (available_until DESC) WHERE is_active = true;

-- 9. NOTIFICATIONS & PREFERENCES
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'system' CHECK (category IN ('rsvp', 'connection', 'chat', 'application', 'system')),
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications (recipient_id, is_read, created_at DESC);

-- 10. ROW LEVEL SECURITY ACTIVATION
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intent_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Zero-Trust RLS Policies for New Entities
CREATE POLICY "Public read departments" ON public.departments FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Public read skills" ON public.skills FOR SELECT TO authenticated, anon USING (true);

-- Student Skills & Endorsements
CREATE POLICY "Public read student skills" ON public.student_skills FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Students manage own skills" ON public.student_skills FOR ALL TO authenticated
USING (student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()))
WITH CHECK (student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can endorse peer skills" ON public.skill_endorsements FOR INSERT TO authenticated
WITH CHECK (
    endorser_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    AND endorser_id NOT IN (
        SELECT student_id FROM public.student_skills WHERE id = student_skill_id
    )
);

CREATE POLICY "Read endorsements" ON public.skill_endorsements FOR SELECT TO authenticated, anon USING (true);

-- Connections: Strictly between authenticated peers
CREATE POLICY "Connections visible to participants" ON public.connections FOR SELECT TO authenticated
USING (
    requester_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR recipient_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Create connection as self" ON public.connections FOR INSERT TO authenticated
WITH CHECK (
    requester_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Update connection as participant" ON public.connections FOR UPDATE TO authenticated
USING (
    requester_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR recipient_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);

-- Chat RLS: Strictly accessible only to joined room members
CREATE POLICY "Chat rooms visible to members" ON public.chat_rooms FOR SELECT TO authenticated
USING (
    id IN (SELECT room_id FROM public.chat_members cm JOIN public.profiles p ON cm.user_id = p.id WHERE p.auth_user_id = auth.uid())
);

CREATE POLICY "Chat messages readable by room members" ON public.chat_messages FOR SELECT TO authenticated
USING (
    room_id IN (SELECT room_id FROM public.chat_members cm JOIN public.profiles p ON cm.user_id = p.id WHERE p.auth_user_id = auth.uid())
);

CREATE POLICY "Post messages as self to member room" ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (
    sender_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    AND room_id IN (SELECT room_id FROM public.chat_members cm JOIN public.profiles p ON cm.user_id = p.id WHERE p.auth_user_id = auth.uid())
);

-- Stories RLS: Visible only while active (not expired)
CREATE POLICY "Stories readable while active" ON public.stories FOR SELECT TO authenticated
USING (expires_at > now());

CREATE POLICY "Post stories as authenticated author" ON public.stories FOR INSERT TO authenticated
WITH CHECK (author_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Notifications RLS: Strictly recipient only
CREATE POLICY "Recipient notifications access" ON public.notifications FOR ALL TO authenticated
USING (recipient_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()))
WITH CHECK (recipient_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Study sessions: Public opt-in visibility while active
CREATE POLICY "Active study sessions visible" ON public.study_sessions FOR SELECT TO authenticated
USING (is_active = true AND available_until > now());

CREATE POLICY "Manage own study sessions" ON public.study_sessions FOR ALL TO authenticated
USING (student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()))
WITH CHECK (student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));
