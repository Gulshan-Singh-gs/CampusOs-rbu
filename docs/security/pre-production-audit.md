# Pre-Production Security Audit Findings

**Date**: October 2026  
**Auditor**: Lead Architect & Application Security Engineer  
**Target Repository**: CampusOS (Rayat Bahra University Campus Services)  
**Status**: Pre-Production Baseline Verified

---

## 1. Executive Summary & Inventory
Reconnaissance was conducted across the active repository including `src/`, `supabase/migrations/`, `public/`, `package.json`, and environment configurations.

### Codebase Inventory
- **Framework & Build**: React 18.3.1, TypeScript 5.6.3, Vite 5.4.8, Tailwind CSS 3.4.13
- **Routing**: React Router v6.26.2 (`/events`, `/clubs`, `/wizard`, `/applications`, `/admin`, `/onboarding`)
- **State Management**: Zustand v4.5.5 (`useCampusStore`, `useSessionStore`, `useThemeStore`)
- **API & Database**: Supabase JS v2.45.4 (`@supabase/supabase-js`), PostgREST 11.x, PostgreSQL 15
- **Input Validation**: Zod v3.23.8 (`ProfileInputSchema`, `RsvpInputSchema`, `CreateApplicationInputSchema`)

---

## 2. Identified Security Deficits & Weaknesses

### Finding 1: Development Bypass Clause in RLS Policies
- **Severity**: 🔴 **CRITICAL** (Production Blocker)
- **File**: `supabase/migrations/006_security_hardening.sql`
- **Details**: Several policies contain `OR (auth.uid() IS NULL)` fallback clauses to accommodate unauthenticated local sessions. If deployed to production with this clause, anonymous attackers can read private document applications, update profile roles, and modify applications directly via PostgREST.

### Finding 2: Unverified Local Onboarding Identity
- **Severity**: 🔴 **CRITICAL** (Production Blocker)
- **File**: `src/features/onboarding/components/OnboardingView.tsx` & `src/services/session/sessionStore.ts`
- **Details**: Users enter unauthenticated form inputs stored in `localStorage` without linking to a verified Supabase Auth JWT. A student could claim another student's roll number or name.

### Finding 3: Public Exposure of Sensitive Profile Fields
- **Severity**: 🟠 **HIGH**
- **File**: `supabase/migrations/unified_schema_seed.sql` & `006_security_hardening.sql`
- **Details**: `public.profiles` allows `SELECT USING (true)`. While display names and club roles must be public, exposing roll numbers, internal auth UUIDs, and verification flags to the public PostgREST API violates least-privilege data minimization.

### Finding 4: Absence of Transactional Capacity & Concurrency Guards on RSVPs
- **Severity**: 🟠 **HIGH**
- **File**: `src/services/api/dataStore.ts` & `supabase/migrations/004_event_rsvps.sql`
- **Details**: The database has a uniqueness constraint on `(event_id, student_email)` and a trigger maintaining `rsvp_count`, but lacks an atomic gate verifying `rsvp_count < max_capacity` inside a database transaction before inserting. Concurrent requests could oversubscribe an event beyond physical hall capacity.

### Finding 5: Client-Initiated Status Transitions on Application State Machine
- **Severity**: 🟡 **MEDIUM**
- **File**: `src/features/tracker/components/AdminPortalView.tsx`
- **Details**: AdminPortalView directly dispatches status changes (`Approved`, `Rejected`). While RLS restricts this, the database lacks a trigger verifying legal transition graphs (e.g. `Pending Review` -> `Approved` or `Rejected`, disallowing resurrection of `Expired` or `Rejected` without record).

### Finding 6: Clear-Text Account Data Persistence Across Logout
- **Severity**: 🟡 **MEDIUM**
- **File**: `src/services/session/sessionStore.ts`
- **Details**: On session clearing, `campusos_student_session` is cleared, but `campusos_submitted_applications` in `dataStore.ts` retains cached applications, creating cross-account leakage if multiple students share a terminal.

---

## 3. Threat Model Mapping
- **Anonymous Attacker**: Probes PostgREST endpoints `/rest/v1/document_applications` and `/rest/v1/event_rsvps`. Must be blocked with 401/403 for any non-public operation.
- **Malicious Student**: Attempts IDOR queries using known peer roll numbers or manipulates application status to "Approved".
- **Attacker with DevTools**: Manipulates browser `localStorage` or injects arbitrary headers. Must be denied by server-side RLS.
