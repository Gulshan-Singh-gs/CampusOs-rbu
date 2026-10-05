-- ============================================================================
-- CAMPUSOS RBU — MIGRATION 007: PRODUCTION ZERO-TRUST & ATOMIC HARDENING
-- Lead Systems Architect & Application Security Engineer
-- ============================================================================

-- 1. PURGE ANONYMOUS BYPASSES & REBUILD ZERO-TRUST RLS POLICIES

-- A. DOCUMENT APPLICATIONS (STRICT OWNERSHIP & RBAC)
DROP POLICY IF EXISTS "Strict student application read" ON public.document_applications;
DROP POLICY IF EXISTS "Applications readable" ON public.document_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON public.document_applications;

-- Production Policy: Only the authenticated student owner, department HOD, or DSW/Super admin
CREATE POLICY "Strict student application read" ON public.document_applications FOR SELECT 
TO authenticated
USING (
    -- 1. Authenticated student owns the application
    (student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()))
    OR (roll_number IN (SELECT roll_number FROM public.profiles WHERE auth_user_id = auth.uid()))
    -- 2. DSW / Super Admin can view all
    OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.auth_user_id = auth.uid() AND p.role IN ('dsw_admin', 'super_admin')
    )
    -- 3. HOD can view applications submitted for their department only
    OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.auth_user_id = auth.uid() 
        AND p.role = 'hod' 
        AND p.department = document_applications.department
    )
);

-- Production Insert Policy: Must be authenticated student
DROP POLICY IF EXISTS "Applications insertable" ON public.document_applications;
CREATE POLICY "Applications insertable" ON public.document_applications FOR INSERT 
TO authenticated
WITH CHECK (
    -- Student ID must match their own profile
    (student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()))
    OR (roll_number IN (SELECT roll_number FROM public.profiles WHERE auth_user_id = auth.uid()))
);

-- Production Update Policy: Privileged staff endorsement only (NO ANONYMOUS BYPASS)
DROP POLICY IF EXISTS "Privileged status endorsement" ON public.document_applications;
DROP POLICY IF EXISTS "Applications updatable" ON public.document_applications;
CREATE POLICY "Privileged status endorsement" ON public.document_applications FOR UPDATE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.auth_user_id = auth.uid() 
        AND p.role IN ('dsw_admin', 'hod', 'super_admin')
    )
);

-- B. PROFILES: DATA MINIMIZATION & ZERO-TRUST POLICY
-- Separate public club lead directory from private student profiles
CREATE OR REPLACE VIEW public.public_club_leads AS
SELECT 
    c.id AS club_id,
    c.name AS club_name,
    c.lead_name,
    c.lead_email,
    c.icon,
    c.member_count
FROM public.clubs c;

GRANT SELECT ON public.public_club_leads TO anon, authenticated;

-- Restrict profiles table: Only authenticated users can see their own profile or DSW/Super admins
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Strict profile access" ON public.profiles;

CREATE POLICY "Strict profile access" ON public.profiles FOR SELECT 
TO authenticated
USING (
    auth_user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.auth_user_id = auth.uid() 
        AND p.role IN ('dsw_admin', 'super_admin')
    )
);

-- Restrict profile updates: Zero self-service role modifications
DROP POLICY IF EXISTS "Users can update own profile excluding role" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile excluding role" ON public.profiles FOR UPDATE 
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (
    (role = (SELECT p.role FROM public.profiles p WHERE p.auth_user_id = auth.uid()))
    OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.auth_user_id = auth.uid() AND p.role = 'super_admin'
    )
);

-- C. EVENT RSVPS ZERO-TRUST POLICIES
DROP POLICY IF EXISTS "RSVPs viewable by students and organizers" ON public.event_rsvps;
DROP POLICY IF EXISTS "RSVPs viewable by everyone" ON public.event_rsvps;

CREATE POLICY "Strict RSVP read" ON public.event_rsvps FOR SELECT 
TO authenticated
USING (
    student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR student_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.auth_user_id = auth.uid() 
        AND p.role IN ('event_organizer', 'club_admin', 'dsw_admin', 'super_admin')
    )
);

-- 2. TRANSACTIONAL CAPACITY & ATOMIC RSVP REGISTRATION FUNCTION
CREATE OR REPLACE FUNCTION public.register_event_rsvp(
    p_event_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_student_id UUID;
    v_student_email TEXT;
    v_student_name TEXT;
    v_current_rsvps INT;
    v_max_capacity INT;
    v_rsvp_id UUID;
    v_ticket_token TEXT;
BEGIN
    -- 1. Verify caller authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required to register for events.' USING ERRCODE = '42501';
    END IF;

    -- 2. Fetch authenticated profile
    SELECT id, email, full_name INTO v_student_id, v_student_email, v_student_name
    FROM public.profiles
    WHERE auth_user_id = auth.uid();

    IF v_student_id IS NULL THEN
        -- Fallback to auth.users if profile incomplete
        SELECT id, email, split_part(email, '@', 1) INTO v_student_id, v_student_email, v_student_name
        FROM auth.users
        WHERE id = auth.uid();
    END IF;

    -- 3. Lock event row to prevent concurrent race condition on capacity
    SELECT rsvp_count, max_capacity INTO v_current_rsvps, v_max_capacity
    FROM public.events
    WHERE id = p_event_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found.' USING ERRCODE = 'P0002';
    END IF;

    -- 4. Check capacity constraint atomically
    IF v_current_rsvps >= v_max_capacity THEN
        RAISE EXCEPTION 'Event has reached maximum capacity.' USING ERRCODE = '23514';
    END IF;

    -- 5. Insert RSVP record atomically
    INSERT INTO public.event_rsvps (event_id, student_id, student_name, student_email)
    VALUES (p_event_id, v_student_id, v_student_name, v_student_email)
    RETURNING id INTO v_rsvp_id;

    -- 6. Generate unguessable random attendance ticket token
    v_ticket_token := encode(gen_random_bytes(24), 'hex');

    INSERT INTO public.attendance_tickets (
        event_id,
        rsvp_id,
        student_id,
        ticket_token,
        expires_at
    )
    VALUES (
        p_event_id,
        v_rsvp_id,
        v_student_id,
        v_ticket_token,
        now() + interval '7 days'
    );

    -- 7. Record immutable audit log
    PERFORM public.log_security_audit(
        'RSVP_REGISTERED_ATOMIC',
        'event',
        p_event_id::text,
        jsonb_build_object('rsvp_id', v_rsvp_id, 'student_email', v_student_email)
    );

    RETURN jsonb_build_object(
        'success', true,
        'rsvp_id', v_rsvp_id,
        'ticket_token', v_ticket_token
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 3. STATE MACHINE TRANSITION ENFORCEMENT TRIGGER
CREATE OR REPLACE FUNCTION public.enforce_application_state_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Only evaluate on status modification
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        -- Legal transitions:
        -- 'Pending Review' -> 'Approved', 'Rejected'
        -- 'Approved' -> 'Expired'
        IF (OLD.status = 'Pending Review' AND NEW.status NOT IN ('Approved', 'Rejected')) THEN
            RAISE EXCEPTION 'Illegal status transition from Pending Review to %', NEW.status;
        ELSIF (OLD.status = 'Approved' AND NEW.status NOT IN ('Expired')) THEN
            RAISE EXCEPTION 'Approved documents cannot be transitioned to %', NEW.status;
        ELSIF (OLD.status IN ('Rejected', 'Expired')) THEN
            RAISE EXCEPTION 'Finalized documents (%) cannot be reopened', OLD.status;
        END IF;

        -- Record state transition in audit trail
        INSERT INTO public.audit_logs (actor_id, actor_email, action, entity_type, entity_id, metadata)
        VALUES (
            auth.uid(),
            (SELECT email FROM auth.users WHERE id = auth.uid()),
            'APPLICATION_STATE_TRANSITION',
            'document_application',
            NEW.id::text,
            jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_app_state_transition ON public.document_applications;
CREATE TRIGGER trg_app_state_transition
BEFORE UPDATE ON public.document_applications
FOR EACH ROW EXECUTE FUNCTION public.enforce_application_state_transition();
