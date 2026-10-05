# Production Migration & Security Hardening Plan

**Project**: CampusOS RBU  
**Target Architecture**: Zero-Trust University Campus Services Layer  
**Objective**: Eliminate all production security blockers, remove development bypasses, implement atomic capacity controls, and secure profile data boundaries.

---

## Prioritized Implementation Roadmap

### Phase 1: P0 — Production Blockers
1. **Remove Anonymous Development Bypasses**:
   - Purge all `auth.uid() IS NULL` clauses across all SQL migrations and RLS policies.
   - Enforce mandatory `auth.uid() = profiles.auth_user_id` for all mutations and sensitive reads.
2. **Authoritative Profile Creation & Data Minimization**:
   - Create `public_club_leads` secure view so society lead names and badges are queryable without exposing private student roll numbers or UUIDs.
   - Lock `public.profiles` SELECT to only the authenticated owner (`auth.uid() = auth_user_id`) and authorized staff (`role IN ('dsw_admin', 'super_admin')`).
3. **Session Hardening & Logout Sanitization**:
   - Bind Supabase Auth state listener (`supabase.auth.onAuthStateChange`) into session store.
   - Implement complete cache purging on logout (evicting cached applications and tickets) to eliminate cross-account workstation leakage.

---

### Phase 2: P1 — High Priority Business Logic Hardening
1. **Transactional Event RSVP with Capacity Guard**:
   - Create atomic PostgreSQL function `public.register_event_rsvp(p_event_id UUID)` that locks the event row, verifies capacity, checks duplicate registration, inserts into `event_rsvps`, and returns a signed attendance ticket token.
2. **Application State Machine Constraint**:
   - Add database trigger `public.enforce_application_state_transition()` to block illegal transitions (e.g. `Rejected` -> `Approved` or student tampering).
3. **Server-Enforced Audit Logging**:
   - Automatically record status transitions via database triggers rather than relying solely on client-side requests.

---

### Phase 3: P2 & P3 — Hardening, Observability & Regression Testing
1. **Automated Security & RLS Test Suite**:
   - Build automated Node/TypeScript test suite (`tests/security.test.ts`) that verifies:
     - Anonymous write rejection on all tables.
     - IDOR blocking on peer student applications.
     - Role escalation denial on profiles.
     - Atomic capacity race limits.
2. **Documentation Deliverables**:
   - `docs/security/threat-model.md`
   - `docs/security/production-readiness-report.md`
