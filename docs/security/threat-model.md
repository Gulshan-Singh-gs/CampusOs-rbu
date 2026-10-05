# CampusOS Threat Model

**Version**: 2.0 (Production Hardened)  
**Target**: Rayat Bahra University CampusOS  
**Scope**: Cloudflare Pages Edge, React SPA, Supabase PostgREST, PostgreSQL 15 RLS  

---

## 1. Threat Actors & Capabilities

| Threat Actor | Motivation | Capabilities & Vector |
| :--- | :--- | :--- |
| **Anonymous Web Prober** | Opportunistic data harvesting, vandalism | Direct unauthenticated HTTP requests to Supabase PostgREST endpoints (`/rest/v1/*`) |
| **Malicious Student** | Academic fraud, viewing peer financial aid, forgery | Authenticated JWT session, browser console manipulation, modifying payload parameters |
| **Rogue Event Organizer** | Tampering with peer society events or attendee rosters | Scoped administrative account trying to access foreign club resources |
| **Compromised Faculty Account** | Unauthorized endorsements | Access to `/admin` routes, modifying document approval states |
| **Shared Workstation Spy** | Stealing classmate data in campus computer labs | Inspecting `localStorage` or browser history after previous user departs |

---

## 2. Threat Vector Breakdown & Mitigations

### Threat T-01: Direct PostgREST IDOR on Student Applications
- **Asset**: Student private financial aid requests, family income, CGPA, and disciplinary NOCs.
- **Attack Vector**: Probing `GET /rest/v1/document_applications?id=eq.<other_student_id>`.
- **Existing Control**: RLS policy `Strict student application read` requiring `student_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())`.
- **Residual Risk**: Low. If peer roll number is targeted, RLS rejects row return because authenticated UID does not match the owning profile.

### Threat T-02: Self-Endorsement of Official Letterheads
- **Asset**: University Dean/HOD endorsement stamps and NOC certificates.
- **Attack Vector**: `PATCH /rest/v1/document_applications?id=eq.<id>` with body `{"status": "Approved"}`.
- **Existing Control**: Database trigger `enforce_application_state_transition()` and RLS policy `Privileged status endorsement` requiring `role IN ('dsw_admin', 'hod', 'super_admin')`.
- **Residual Risk**: Zero at database boundary.

### Threat T-03: Event Capacity Exhaustion & Ticket Forgery
- **Asset**: Physical hall occupancy limit (e.g. Main OAT 5000 seats).
- **Attack Vector**: Bot script firing concurrent RSVP requests to exhaust hall quota.
- **Existing Control**: Atomic stored procedure `public.register_event_rsvp()` row-locks the event record (`FOR UPDATE`), checks capacity, and inserts single-use cryptographically random token (`gen_random_bytes(24)`).
- **Residual Risk**: Minimal. Requires authenticated Supabase session.

### Threat T-04: Cross-Account Leakage on Shared Campus Terminals
- **Asset**: Cached student memorandums and session tokens.
- **Attack Vector**: Next student opens browser and views previous student's draft submissions.
- **Existing Control**: `useSessionStore.clearSession()` evicts `campusos_student_session`, `campusos_submitted_applications`, and `campusos_user_rsvps` upon logout.
- **Residual Risk**: Mitigated for users who actively tap Sign Out.
