# Architecture Decision Record (ADR): Enterprise Chat & Communication Subsystem

**Status:** APPROVED & IMPLEMENTED  
**Date:** 2026-10-08  
**Architect:** Principal Backend Architect & Systems Engineer  
**Context:** CampusOS v2.0.1+ Institutional Communication Infrastructure  

---

## 1. Context & Problem Statement
CampusOS requires an integrated student-to-student and student-to-faculty communication mechanism (Direct Messaging, Squad Project Collab, Ephemeral Chats). 
Key challenges:
1. **Zero Added Cost:** Must leverage existing ₹0-cost tier infrastructure (Supabase PostgreSQL free quota, Cloudflare Pages/Workers free tier).
2. **Unified Identity:** Chat cannot have independent registration or unverified pseudonyms. It must bind to the official student/professor record (`public.profiles`).
3. **Vendor Independence (Self-Hosting Insurance):** The codebase must NOT directly couple React components to the Supabase client. If the university transitions to self-hosted Matrix/Synapse, PostgreSQL, or Redis/WebSockets later, switching should require replacing only the repository implementation.

---

## 2. Decision Matrix & Architectural Decisions

### ADR-01: Repository Pattern for Storage Decoupling
- **Decision:** All chat data operations are encapsulated in `ChatRepository` interface.
- **Implementations:**
  - `SupabaseChatRepository`: Production adapter utilizing Supabase REST & WebSocket Realtime.
  - `MockChatRepository`: Unit test and offline staging adapter operating in-memory.
- **Rationale:** React components import `useChat` hook which injects `ChatService`. No UI component is permitted to import `@supabase/supabase-js`.

### ADR-02: Row-Level Security (RLS) as Primary Security Gate
- **Decision:** Enforce isolation at the database layer using PostgreSQL RLS policies in addition to API-level edge validation in Cloudflare Workers.
- **Rationale:** Prevents data leaks if a client connects directly via Supabase anonymous credentials.

### ADR-03: Realtime Channel Minimization
- **Decision:** Enable Supabase Realtime *exclusively* on `chat_messages` table with conversation filtering.
- **Rationale:** Disabling broadcast on `conversations` and `conversation_participants` saves connection quota and prevents participant privacy leakage.

### ADR-04: Dual-Tier Flood & Spam Protection
- **Decision:** 
  1. **Edge Tier:** Token bucket rate-limiter per authenticated student UID (10 msgs / min) in Cloudflare Worker edge proxy.
  2. **Database Tier:** PostgreSQL `BEFORE INSERT` trigger blocking $>5$ messages within 10 seconds per student.

### ADR-05: Configurable Retention Cleanup
- **Decision:** Store `retention_days` in `conversations.metadata` (default 30 days, or 14 days for ephemeral rooms) with a stored procedure `fn_cleanup_expired_chat_messages()`.

---

## 3. Self-Hosting Migration Roadmap
To self-host the chat subsystem in an on-premises university datacenter:
1. Provision a PostgreSQL instance and run migrations `001` through `009`.
2. Replace `SupabaseChatRepository` with `PostgresWebSocketChatRepository` (or Matrix homeserver adapter).
3. The React frontend (`useChat`, `EphemeralChatView`, etc.) requires zero code modifications.
