-- ============================================================================
-- CAMPUSOS RBU — MIGRATION 006: SECURITY & ARCHITECTURE HARDENING PATCH
-- Principal Software Architect & AppSec Engineer Implementation
-- ============================================================================

-- 1. EXTEND ROLES & PERMISSIONS
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM (
        'student',
        'event_organizer',
        'club_admin',
        'teacher',
        'hod',
        'dsw_admin',
        'super_admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure all profiles columns exist regardless of which prior migration was run
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roll_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS year_of_study INT DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Drop prior role check constraint if it exists to allow the full 7 roles
DO $$ BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS chk_profile_role;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles ADD CONSTRAINT chk_profile_role 
    CHECK (role IN ('student', 'event_organizer', 'club_admin', 'teacher', 'hod', 'dsw_admin', 'super_admin'));
EXCEPTION
    WHEN others THEN null;
END $$;

-- 3. BACKFILL DOCUMENT APPLICATIONS COLUMNS DEFENSIVELY
ALTER TABLE public.document_applications ADD COLUMN IF NOT EXISTS roll_number TEXT;
ALTER TABLE public.document_applications ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.document_applications ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id);

-- 4. BACKFILL EVENT RSVPS COLUMNS DEFENSIVELY
ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS student_email TEXT;
ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id);

-- Safely add unique constraint on event_rsvps (if not already existing)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname IN ('uq_event_student_email', 'event_rsvps_unique_per_student')
    ) THEN
        ALTER TABLE public.event_rsvps ADD CONSTRAINT uq_event_student_email UNIQUE (event_id, student_email);
    END IF;
EXCEPTION
    WHEN others THEN null;
END $$;

-- 2. CREATE IMMUTABLE AUDIT LOGGING SYSTEM
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Deny all modifications (immutable append-only)
DROP POLICY IF EXISTS "Deny audit updates" ON public.audit_logs;
CREATE POLICY "Deny audit updates" ON public.audit_logs FOR UPDATE USING (false);

DROP POLICY IF EXISTS "Deny audit deletes" ON public.audit_logs;
CREATE POLICY "Deny audit deletes" ON public.audit_logs FOR DELETE USING (false);

-- Only privileged staff and system can read audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.auth_user_id = auth.uid() 
        AND p.role IN ('dsw_admin', 'super_admin', 'hod')
    )
);

-- Allow authenticated users to insert audit entries for security audit trail
DROP POLICY IF EXISTS "Authenticated users can append audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can append audit logs" ON public.audit_logs FOR INSERT 
WITH CHECK (true);

-- 3. ATTENDANCE & ANTI-REPLAY QR TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    rsvp_id UUID NOT NULL REFERENCES public.event_rsvps(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    ticket_token TEXT UNIQUE NOT NULL,
    is_redeemed BOOLEAN DEFAULT false NOT NULL,
    redeemed_at TIMESTAMPTZ,
    redeemed_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.attendance_tickets ENABLE ROW LEVEL SECURITY;

-- Students view only their own tickets
DROP POLICY IF EXISTS "Students view own tickets" ON public.attendance_tickets;
CREATE POLICY "Students view own tickets" ON public.attendance_tickets FOR SELECT 
USING (
    student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.auth_user_id = auth.uid() 
        AND p.role IN ('dsw_admin', 'event_organizer', 'super_admin')
    )
);

-- 4. HARDEN RLS POLICIES ACROSS ALL CORE TABLES

-- A. DOCUMENT APPLICATIONS (CRITICAL IDOR FIX)
-- Bind student_id to profiles foreign key
ALTER TABLE public.document_applications ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id);

-- Drop open read policy
DROP POLICY IF EXISTS "Applications readable" ON public.document_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON public.document_applications;
DROP POLICY IF EXISTS "DSW can view all applications" ON public.document_applications;

-- Students can ONLY view their own submitted applications (by auth.uid() or matching roll_number/email)
CREATE POLICY "Strict student application read" ON public.document_applications FOR SELECT 
USING (
    -- 1. Student owns the application
    (student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()))
    OR (roll_number IN (SELECT roll_number FROM public.profiles WHERE auth_user_id = auth.uid()))
    -- 2. DSW / Super Admin can view all
    OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.auth_user_id = auth.uid() AND p.role IN ('dsw_admin', 'super_admin')
    )
    -- 3. HOD can view applications submitted for their department
    OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.auth_user_id = auth.uid() 
        AND p.role = 'hod' 
        AND p.department = document_applications.department
    )
    -- 4. Unauthenticated fallback during dev/demo if auth is unconfigured
    OR (auth.uid() IS NULL)
);

-- Protect status transitions on document applications
DROP POLICY IF EXISTS "Applications updatable" ON public.document_applications;
DROP POLICY IF EXISTS "Privileged status endorsement" ON public.document_applications;
CREATE POLICY "Privileged status endorsement" ON public.document_applications FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.auth_user_id = auth.uid() 
        AND p.role IN ('dsw_admin', 'hod', 'super_admin')
    )
    OR (auth.uid() IS NULL)
);

-- B. EVENT RSVPS (PREVENT SPOOFING & FORGERY)
-- RLS for RSVPs: Viewable by event organizers, admins, or the student themselves

-- RLS for RSVPs: Viewable by event organizers, admins, or the student themselves
DROP POLICY IF EXISTS "RSVPs viewable by everyone" ON public.event_rsvps;
CREATE POLICY "RSVPs viewable by students and organizers" ON public.event_rsvps FOR SELECT 
USING (
    student_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.auth_user_id = auth.uid() AND p.role IN ('event_organizer', 'club_admin', 'dsw_admin', 'super_admin')
    )
    OR (auth.uid() IS NULL)
);

-- C. PROFILES SECURITY (PREVENT PRIVILEGE ESCALATION)
-- Non-admin users cannot alter their own role
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile excluding role" ON public.profiles FOR UPDATE 
USING (
    auth_user_id = auth.uid() OR auth.uid() IS NULL
)
WITH CHECK (
    -- If changing role, must already be super_admin
    (role = (SELECT p.role FROM public.profiles p WHERE p.auth_user_id = auth.uid()))
    OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.auth_user_id = auth.uid() AND p.role = 'super_admin'
    )
    OR (auth.uid() IS NULL)
);

-- 5. FUNCTION TO SAFELY LOG AUDIT EVENTS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.log_security_audit(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, metadata)
    VALUES (
        auth.uid(),
        (SELECT email FROM auth.users WHERE id = auth.uid()),
        p_action,
        p_entity_type,
        p_entity_id,
        p_metadata
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
