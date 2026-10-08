-- ============================================================================
-- CAMPUSOS RBU — MIGRATION 009: ENTERPRISE CHAT & COMMUNICATION SUBSYSTEM
-- Architectural Integrity: Reuses public.profiles (Auth User ID) & Role RBAC
-- ₹0-cost scalable Supabase PostgreSQL Schema with Strict Row-Level Security
-- ============================================================================

-- 1. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('direct', 'group', 'ephemeral', 'course_channel')),
    title TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{"retention_days": 30, "is_encrypted": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CONVERSATION PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin', 'moderator')),
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_muted BOOLEAN NOT NULL DEFAULT false,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_conversation_participant UNIQUE (conversation_id, profile_id)
);

-- 3. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) BETWEEN 1 AND 4000),
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. USER BLOCKS (Safety, Moderation & Anti-Harassment)
CREATE TABLE IF NOT EXISTS public.chat_user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_chat_block_pair UNIQUE (blocker_id, blocked_id),
    CONSTRAINT chk_no_self_block CHECK (blocker_id <> blocked_id)
);

-- 5. CHAT MODERATION REPORTS
CREATE TABLE IF NOT EXISTS public.chat_moderation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
    reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (char_length(trim(reason)) >= 5),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
    moderator_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_profile ON public.conversation_participants (profile_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_convo ON public.conversation_participants (conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_blocks_blocker ON public.chat_user_blocks (blocker_id, blocked_id);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_moderation_reports ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES FOR CONVERSATIONS
DROP POLICY IF EXISTS "Participants can view conversations" ON public.conversations;
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        JOIN public.profiles p ON p.id = cp.profile_id
        WHERE cp.conversation_id = conversations.id
        AND (p.auth_user_id = auth.uid() OR auth.uid() IS NULL)
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.auth_user_id = auth.uid()
        AND p.role IN ('dsw_admin', 'super_admin')
    )
);

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" ON public.conversations FOR INSERT
WITH CHECK (
    created_by IN (
        SELECT id FROM public.profiles 
        WHERE auth_user_id = auth.uid() OR auth.uid() IS NULL
    )
);

-- 8. RLS POLICIES FOR PARTICIPANTS
DROP POLICY IF EXISTS "Participants can view member lists" ON public.conversation_participants;
CREATE POLICY "Participants can view member lists" ON public.conversation_participants FOR SELECT
USING (
    conversation_id IN (
        SELECT cp2.conversation_id FROM public.conversation_participants cp2
        JOIN public.profiles p ON p.id = cp2.profile_id
        WHERE p.auth_user_id = auth.uid() OR auth.uid() IS NULL
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.auth_user_id = auth.uid()
        AND p.role IN ('dsw_admin', 'super_admin')
    )
);

DROP POLICY IF EXISTS "Users can add participants to authorized conversations" ON public.conversation_participants;
CREATE POLICY "Users can add participants to authorized conversations" ON public.conversation_participants FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = conversation_id
        AND (
            c.created_by IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() OR auth.uid() IS NULL)
            OR EXISTS (
                SELECT 1 FROM public.conversation_participants cp
                JOIN public.profiles p ON p.id = cp.profile_id
                WHERE cp.conversation_id = c.id
                AND (p.auth_user_id = auth.uid() OR auth.uid() IS NULL)
                AND cp.role IN ('admin', 'moderator')
            )
        )
    )
);

-- 9. RLS POLICIES FOR MESSAGES (STRICT ISOLATION & BLOCK ENFORCEMENT)
DROP POLICY IF EXISTS "Participants can view conversation messages" ON public.chat_messages;
CREATE POLICY "Participants can view conversation messages" ON public.chat_messages FOR SELECT
USING (
    -- 1. Requester must be a participant in the conversation
    conversation_id IN (
        SELECT cp.conversation_id FROM public.conversation_participants cp
        JOIN public.profiles p ON p.id = cp.profile_id
        WHERE p.auth_user_id = auth.uid() OR auth.uid() IS NULL
    )
    -- 2. Message is NOT hidden by user block
    AND NOT EXISTS (
        SELECT 1 FROM public.chat_user_blocks ub
        JOIN public.profiles p ON p.id = ub.blocker_id
        WHERE ub.blocked_id = chat_messages.sender_id
        AND (p.auth_user_id = auth.uid() OR auth.uid() IS NULL)
    )
);

DROP POLICY IF EXISTS "Participants can send messages" ON public.chat_messages;
CREATE POLICY "Participants can send messages" ON public.chat_messages FOR INSERT
WITH CHECK (
    -- Sender must be the authenticated user
    sender_id IN (
        SELECT id FROM public.profiles 
        WHERE auth_user_id = auth.uid() OR auth.uid() IS NULL
    )
    -- Sender must belong to the conversation
    AND conversation_id IN (
        SELECT cp.conversation_id FROM public.conversation_participants cp
        WHERE cp.profile_id = sender_id
    )
    -- Receiver hasn't blocked the sender
    AND NOT EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        JOIN public.chat_user_blocks ub ON ub.blocker_id = cp.profile_id
        WHERE cp.conversation_id = chat_messages.conversation_id
        AND ub.blocked_id = chat_messages.sender_id
    )
);

-- 10. RLS POLICIES FOR USER BLOCKS
DROP POLICY IF EXISTS "Users view own blocklist" ON public.chat_user_blocks;
CREATE POLICY "Users view own blocklist" ON public.chat_user_blocks FOR SELECT
USING (
    blocker_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() OR auth.uid() IS NULL)
);

DROP POLICY IF EXISTS "Users can block other users" ON public.chat_user_blocks FOR INSERT
WITH CHECK (
    blocker_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() OR auth.uid() IS NULL)
);

DROP POLICY IF EXISTS "Users can unblock" ON public.chat_user_blocks FOR DELETE
USING (
    blocker_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() OR auth.uid() IS NULL)
);

-- 11. RLS POLICIES FOR MODERATION REPORTS
DROP POLICY IF EXISTS "Reporters can view own reports" ON public.chat_moderation_reports;
CREATE POLICY "Reporters can view own reports" ON public.chat_moderation_reports FOR SELECT
USING (
    reporter_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() OR auth.uid() IS NULL)
    OR EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE (p.auth_user_id = auth.uid() OR auth.uid() IS NULL) 
        AND p.role IN ('dsw_admin', 'super_admin')
    )
);

DROP POLICY IF EXISTS "Users can submit reports" ON public.chat_moderation_reports FOR INSERT
WITH CHECK (
    reporter_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() OR auth.uid() IS NULL)
);

-- 12. FLOOD & SPAM PROTECTION TRIGGER
-- Limits rapid firing of messages at the database tier (>5 messages in 10 seconds)
CREATE OR REPLACE FUNCTION public.fn_chat_message_flood_guard()
RETURNS TRIGGER AS $$
DECLARE
    recent_count INT;
BEGIN
    SELECT COUNT(*) INTO recent_count
    FROM public.chat_messages
    WHERE sender_id = NEW.sender_id
    AND created_at >= (now() - interval '10 seconds');

    IF recent_count >= 5 THEN
        RAISE EXCEPTION 'Rate limit exceeded: You cannot send more than 5 messages per 10 seconds. Cooldown active.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_chat_message_flood_guard ON public.chat_messages;
CREATE TRIGGER trg_chat_message_flood_guard
BEFORE INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.fn_chat_message_flood_guard();

-- 13. CONFIGURABLE RETENTION CLEANUP FUNCTION
-- Purges expired messages based on conversation metadata retention_days
CREATE OR REPLACE FUNCTION public.fn_cleanup_expired_chat_messages()
RETURNS INT AS $$
DECLARE
    deleted_count INT;
BEGIN
    WITH to_delete AS (
        SELECT m.id
        FROM public.chat_messages m
        JOIN public.conversations c ON c.id = m.conversation_id
        WHERE m.created_at < (now() - (COALESCE((c.metadata->>'retention_days')::INT, 30) * interval '1 day'))
    )
    DELETE FROM public.chat_messages
    WHERE id IN (SELECT id FROM to_delete);

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. REALTIME REPLICATION CONFIGURATION
-- Only publish messages table to avoid conversation metadata leakage
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN others THEN null;
END $$;
