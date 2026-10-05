# CAMPUSOS — PRODUCTION-GRADE ENGINEERING & SECURITY MIGRATION

You are the lead software architect, senior full-stack engineer, PostgreSQL/Supabase security engineer, DevSecOps engineer, and application security engineer responsible for transforming the existing **CampusOS RBU** repository into a production-grade university platform.

This is an implementation task, not a theoretical review.

You MUST inspect the existing repository, understand the current implementation, and then modify the codebase, database migrations, tests, configuration, and documentation required to achieve the target architecture.

Do NOT blindly rewrite the application.

# 0. SOURCE OF TRUTH

The current architecture/security snapshot is the baseline.

Current stack:

* React 18
* TypeScript
* Vite
* React Router v6
* Zustand
* Tailwind CSS
* Zod
* Supabase Auth
* Supabase PostgREST
* PostgreSQL 15
* PostgreSQL RLS
* Cloudflare Pages
* PWA/offline functionality

Current major tables:

* profiles
* clubs
* events
* event_rsvps
* document_applications
* audit_logs
* attendance_tickets

Current security controls include:

* PostgreSQL RLS
* RBAC
* Zod mutation validation
* audit logging
* RSVP uniqueness constraints
* attendance tickets
* Cloudflare security headers
* client/server trust-boundary separation

However, the current system still has:

1. Local student onboarding without mandatory institutional authentication.
2. `auth.uid() IS NULL` development fallback clauses that permit unauthenticated mutations.
3. LocalStorage-based identity/session behavior.
4. Client-side direct access to Supabase/PostgREST.
5. Public profile reads.
6. Browser-controlled mutation initiation.
7. No complete production-grade abuse/rate-limit architecture.
8. Incomplete verification of all authorization paths.
9. Offline mutation functionality that requires careful production hardening.
10. Dependency advisories that require remediation or documented justification.

Goal: eliminate production blockers without destroying existing functionality.

# 1. NON-NEGOTIABLE PRODUCTION SECURITY PRINCIPLES

Implement the following principles throughout the system.

## 1.1 Zero trust client

Treat everything originating from:

* React
* Zustand
* localStorage
* IndexedDB
* URL parameters
* request bodies
* browser developer tools
* browser console
* PWA cache

as untrusted.

The client may request an action.

The server/database decides whether the action is allowed.

Never use client state as proof of:

* identity
* role
* ownership
* department
* verification
* approval
* attendance
* authorization

# 2. REMOVE THE DEVELOPMENT AUTHENTICATION BYPASS

This is the highest-priority task.

Search the entire repository and database migrations for:

```text
auth.uid() IS NULL
```

and equivalent anonymous-development bypasses.

For production:

* remove these authorization bypasses;
* authenticated identity must be mandatory for protected mutations;
* unauthenticated users may only access explicitly public resources;
* no protected INSERT/UPDATE/DELETE operation may succeed anonymously.

Do NOT simply hide the UI.

Test the actual PostgREST/database behavior.

Expected result:

Anonymous user attempting:

* profile creation
* RSVP
* application submission
* application update
* event creation
* club modification
* audit insertion
* attendance mutation

must be rejected.

# 3. IMPLEMENT REAL INSTITUTIONAL AUTHENTICATION

CampusOS is a university system.

Replace local profile creation as the security identity with Supabase Auth identity.

Target authentication model:

```text
University Identity
↓
Supabase Auth
↓
auth.uid()
↓
public.profiles.auth_user_id
↓
PostgreSQL RLS
```

Prefer institutional Google Workspace authentication using:

```text
@rayatbahrauniversity.edu.in
```

where supported by the actual Supabase configuration.

Do not trust:

* typed email
* typed roll number
* typed name
* department submitted by browser
* localStorage identity

as authentication.

The onboarding flow may collect profile information, but the authenticated user identity must originate from Supabase Auth.

# 4. HARDEN PROFILE PROVISIONING

Implement server/database-authoritative profile creation.

Preferred flow:

```text
Supabase Auth user created
↓
database trigger / trusted provisioning function
↓
profiles row
↓
default role = student
↓
student completes allowed profile fields
```

Users must NEVER be able to choose:

```text
role = admin
role = hod
role = dsw_admin
role = super_admin
```

during registration.

Role assignment must be performed only through a privileged administrative mechanism.

If possible, institution identity should be verified before granting access to university-private resources.

# 5. RE-DESIGN RBAC AS DATABASE-AUTHORITATIVE RBAC

Current roles:

* student
* event_organizer
* club_admin
* teacher
* hod
* dsw_admin
* super_admin

Retain these only by actual product requirements.

Create a central authorization model.

Avoid scattering role checks throughout React.

Bad:

```ts
if (user.role === "admin") {
...
}
```

This may control UI visibility, but it must never be the security boundary.

Correct:

```text
Browser
↓
Authenticated request
↓
Postgres RLS / trusted server function
↓
Role + ownership + scope evaluation
```

# 6. CREATE EXPLICIT AUTHORIZATION HELPERS

Create reusable PostgreSQL authorization functions , for example conceptually:

```sql
current_user_role()
is_super_admin()
is_dsw_admin()
is_hod()
is_event_organizer()
owns_profile(...)
can_manage_event(...)
can_view_application(...)
```

Use secure `SECURITY DEFINER` functions only when necessary.

Every `SECURITY DEFINER` function MUST:

* explicitly set a safe `search_path`;
* avoid dynamic SQL unless absolutely necessary;
* validate arguments;
* expose the minimum possible capability;
* be reviewed for privilege escalation;
* have EXECUTE permissions explicitly controlled.

Do not create giant "god functions" that bypass normal authorization.

# 7. REBUILD RLS POLICY MODEL

Audit EVERY table.

For each table document:

* SELECT policy
* INSERT policy
* UPDATE policy
* DELETE policy
* ownership relationship
* role relationship
* department scope
* whether anonymous access is intentional

Target principle:

```text
DEFAULT = DENY
EXPLICIT POLICY = ALLOW
```

Never use:

```sql
USING (true)
```

for protected university data.

Public access may remain for genuinely public resources such as:

* published events
* public club directory

but this must be intentional.

# 8. FIX PROFILE DATA EXPOSURE

The current profile table contains sensitive fields:

* auth_user_id
* email
* roll_number
* department
* role
* verification state

Do NOT expose the entire `profiles` table publicly merely because club lead information is displayed.

Introduce a public-safe representation.

For example:

```text
public_club_leads
```

or a secure view containing only approved fields.

Potential public fields:

* display name
* club role/title
* avatar

Do NOT expose unnecessarily:

* roll number
* auth UUID
* verification flags
* administrative role
* private contact information
* internal account configuration

Apply least privilege to profile access.

# 9. FIX EVENT/RSVP AUTHORIZATION

Review the entire event lifecycle.

Students:

* can view published events;
* can RSVP to themselves;
* can cancel their own RSVP.

Students cannot:

* RSVP on behalf of another student;
* manipulate `student_id`;
* manipulate `student_email`;
* manipulate RSVP ownership;
* modify `rsvp_count`;
* access unrelated attendee information.

Organizers:

* can manage only events they are actually authorized to manage;
* can view attendees only for their authorized events.

Do NOT authorize an organizer merely because the request body contains:

```text
club_id = X
```

Authorization must derive ownership/assignment from trusted database relationships.

# 10. FIX RSVP IDENTITY MODEL

Do not use:

```text
student_email
```

as the primary security identity.

Prefer:

```text
event_rsvps.student_id
↓
profiles.id
↓
profiles.auth_user_id
↓
auth.uid()
```

The authenticated user's identity must be derived from the session.

The client should not be trusted to select another student's ID.

Where practical, remove redundant identity fields such as copied email/name or make them derived/snapshot fields that cannot control authorization.

# 11. HARDEN EVENT CAPACITY

The current RSVP uniqueness constraint is useful but insufficient for full event-capacity correctness.

Implement transactional capacity enforcement.

Requirements:

* maximum capacity cannot be exceeded;
* concurrent RSVP requests cannot bypass capacity;
* duplicate RSVP remains impossible;
* cancelled RSVP frees capacity;
* counter remains consistent;
* race conditions are tested.

Prefer a transactional database function/RPC .

Do not rely on:

```text
frontend count check
```

or:

```text
SELECT count → INSERT
```

as separate unprotected operations.

# 12. HARDEN DOCUMENT APPLICATION WORKFLOW

Applications contain sensitive information such as:

* financial information
* CGPA
* reasons
* roll number
* department
* status

Treat them as high-sensitivity records.

* create their own application;
* view their own application;
* cannot modify approval status;
* cannot modify ownership;
* cannot modify another student's record.

HOD:

* sees only authorized department records;
* can perform only permitted workflow transitions.

DSW admin:

* university-wide authorized review.

Super admin:

* exceptional administrative authority only.

# 13. IMPLEMENT STATE-MACHINE VALIDATION

Do not allow arbitrary status changes.

Define legal transitions.

Example:

```text
Pending Review
↓
Approved
↓
Expired
```

and:

```text
Pending Review
↓
Rejected
```

Prevent invalid transitions such as:

```text
Rejected → Approved
Expired → Pending Review
Student → Approved
```

unless explicitly authorized by the business workflow.

Enforce important transition rules in the database/trusted backend, not only React.

# 14. SECURE FORM DATA / JSONB

`form_data` is sensitive.

Implement:

* strict schema validation;
* maximum payload size;
* allowed field validation;
* rejection of unknown dangerous fields ;
* no executable content;
* controlled serialization;
* safe rendering.

Do not blindly accept arbitrary JSONB from clients.

Validate both:

```text
shape
+
business constraints
```

# 15. SECURE ATTENDANCE TICKETS

Review `attendance_tickets`.

The ticket token must:

* be cryptographically random;
* be unguessable;
* not contain email/name/roll number;
* expire;
* be single-use ;
* prevent replay;
* be tied to the correct event and RSVP;
* be validated server-side.

Attendance redemption must be authorized.

A student must not be able to mark themselves as attended simply by modifying:

```text
is_redeemed
redeemed_by
redeemed_at
```

Attendance should preferably be performed through a trusted database function/API workflow.

# 16. AUDIT LOGGING MUST BE TRUSTWORTHY

Current `audit_logs` is append-only.

Strengthen it.

Audit sensitive events including:

* authentication-related administrative actions;
* role changes;
* application creation;
* application approval;
* application rejection;
* application status changes;
* RSVP creation/cancellation;
* event creation/modification/deletion;
* club changes;
* attendance redemption;
* administrative account changes;
* security-sensitive failures where useful.

Do not allow clients to impersonate:

```text
actor_id
actor_email
```

The authoritative actor identity should come from:

```text
auth.uid()
```

Audit metadata should not become a mechanism for spoofing the actor.

Evaluate whether client-side audit writes should be replaced by trusted server/database triggers/functions for the most sensitive events.

# 17. SECURITY LOG INTEGRITY

Audit whether an ordinary authenticated user can submit:

```text
actor_id = another_user
actor_email = admin@...
action = ROLE_GRANTED
```

If possible, prevent this entirely.

Sensitive audit records should be generated by trusted server/database operations.

Maintain append-only semantics.

# 18. REMOVE CLIENT-SIDE AUTHORIZATION ASSUMPTIONS

Search the frontend for:

```text
role
isAdmin
isHod
isOrganizer
isVerified
studentId
userId
email
```

being used as the sole authorization mechanism.

UI checks are allowed for:

* navigation
* usability
* hiding irrelevant controls

but security must still work if a malicious user:

* opens `/admin` manually;
* modifies Zustand state;
* modifies localStorage;
* modifies URL parameters;
* calls PostgREST directly;
* calls RPC endpoints directly;
* changes request payloads.

# 19. LOCAL STORAGE / PWA SECURITY REVIEW

Review:

```text
campusos_student_session
campusos_submitted_applications
```

and all other local persistence.

Do not store security credentials or authoritative permissions in localStorage.

If Supabase manages authentication sessions, use its supported session mechanism.

Treat offline cache as potentially compromised.

Never cache highly sensitive records offline unless there is a strong business requirement.

For sensitive data:

* minimize caching;
* avoid unnecessary persistence;
* consider encryption only where realistically manageable;
* invalidate stale records;
* prevent cross-account cache leakage;
* clear account-specific data on logout.

# 20. LOGOUT / ACCOUNT SWITCHING

Test:

```text
Student A logs in
↓
Student A logs out
↓
Student B logs in
```

Ensure Student B cannot see:

* Student A cached applications;
* Student A profile data;
* Student A drafts;
* Student A RSVP state;
* Student A private UI state.

Test hard reloads and PWA offline behavior.

# 21. SESSION SECURITY

Use Supabase Auth's actual authenticated session as the source of identity.

* secure session restoration;
* proper logout;
* session invalidation;
* expired-session handling;
* unauthorized response handling;
* account switching;
* protected route UX;
* no fake local authentication state.

Do not invent custom authentication tokens when Supabase Auth already provides the identity mechanism.

# 22. RATE LIMITING / ABUSE RESISTANCE

Identify all abuse-prone endpoints/actions:

* login attempts;
* RSVP creation;
* application submission;
* event creation;
* club creation;
* attendance redemption;
* audit logging;
* administrative actions.

Determine which controls belong in:

* Supabase configuration;
* database constraints;
* Edge Functions;
* Cloudflare;
* application logic.

Do NOT claim rate limiting exists unless actually implemented/configured.

Where repository-level implementation is possible, add appropriate protections.

# 23. INPUT VALIDATION

Continue using Zod, but recognize:

```text
client-side Zod ≠ security boundary
```

Critical validation must also exist at the trusted backend/database layer.

* strings
* lengths
* URLs
* UUIDs
* dates
* times
* numeric limits
* enum values
* JSONB
* file metadata
* status transitions

Prevent oversized inputs and abusive values.

# 24. XSS / INJECTION HARDENING

Perform a complete source audit for:

```text
dangerouslySetInnerHTML
innerHTML
outerHTML
eval
Function(...)
document.write
postMessage
iframe
URL construction
dynamic script loading
```

Also inspect:

* markdown rendering;
* rich text;
* imported SVG;
* uploaded images;
* external URLs;
* query parameters.

Do not only search for obvious dangerous functions.

Test malicious payloads through every user-controlled rendering path.

# 25. CONTENT SECURITY POLICY

Review the current Cloudflare `_headers`.

Do not weaken CSP merely to make a feature work.

Prefer removing unnecessary:

```text
unsafe-inline
```

```text
unsafe-eval
```

where technically possible.

Every external dependency must be explicitly justified.

* application loading;
* fonts;
* Supabase;
* WebSockets;
* PWA;
* images;
* required external resources.

Do not introduce arbitrary third-party scripts.

# 26. SECURITY HEADERS

Review and correctly configure:

* Content-Security-Policy
* X-Frame-Options / frame-ancestors
* X-Content-Type-Options
* Referrer-Policy
* Permissions-Policy

Consider additional modern browser protections where compatible.

Do not blindly add headers that break legitimate functionality.

# 27. DEPENDENCY SECURITY

Run:

```bash
pnpm audit
```

Inspect every vulnerability.

For each:

1. Determine whether it affects production.
2. Determine whether it is reachable.
3. Upgrade where safe.
4. Replace dependency if necessary.
5. Document accepted residual risk if unavoidable.

Do not label a dependency "safe" merely because it is a dev dependency without verifying the actual production attack surface.

# 28. SUPABASE SECURITY REVIEW

Inspect:

* RLS enabled status;
* policies;
* functions;
* triggers;
* SECURITY DEFINER functions;
* grants;
* exposed schemas;
* RPC functions;
* database roles;
* API exposure;
* storage policies;
* auth configuration.

Check for:

```text
anon
authenticated
service_role
```

privilege leakage.

The service-role key must NEVER exist in:

* frontend source;
* VITE variables;
* browser bundle;
* public files;
* Git history.

# 29. DATABASE GRANTS

RLS alone is not enough.

Audit PostgreSQL privileges.

Ensure roles do not have unnecessary:

* INSERT
* UPDATE
* DELETE
* EXECUTE
* schema access

permissions.

Review function EXECUTE privileges especially carefully.

# 30. FILE / STORAGE SECURITY

If CampusOS uses or will use Supabase Storage:

Implement storage policies before adding sensitive uploads.

Separate:

```text
public assets
```

from:

```text
private student documents
```

Private documents must be accessible only to authorized users.

Never expose permanent public URLs for private student documents.

# 31. ERROR HANDLING

Do not expose:

* database internals;
* SQL statements;
* stack traces;
* internal UUID relationships;
* authorization details;
* sensitive profile information.

Use safe user-facing messages.

Keep detailed diagnostics in controlled logs.

# 32. API ENUMERATION RESISTANCE

Test whether an attacker can enumerate:

* profile IDs;
* application IDs;
* event RSVP IDs;
* ticket tokens;
* tracking references;
* UUIDs;
* administrative records.

Even UUIDs must not be considered authorization.

Every object lookup must still pass authorization.

# 33. IDOR TEST MATRIX

Create automated tests for:

### Student A → Student B

* profile
* application
* RSVP
* attendance ticket

### Organizer A → Organizer B

* event
* club
* attendees

### HOD A → Department B

* applications
* students
* audit records

### Ordinary student → Admin

* admin endpoints
* admin tables
* admin RPCs
* role changes

Every unauthorized request must fail closed.

# 34. PRIVILEGE ESCALATION TEST MATRIX

Attempt:

```text
student → event_organizer
student → club_admin
student → teacher
student → hod
student → dsw_admin
student → super_admin
```

using:

* request payload manipulation;
* direct PostgREST;
* browser console;
* localStorage;
* Zustand;
* URL parameters;
* RPC arguments;
* race conditions.

All must fail.

# 35. BUSINESS LOGIC ATTACK TESTING

* duplicate RSVP;
* capacity race;
* application status manipulation;
* invalid status transitions;
* unauthorized event ownership;
* unauthorized club ownership;
* forged attendance;
* ticket replay;
* ticket reuse;
* application ownership modification;
* department manipulation;
* role manipulation;
* audit actor spoofing.

Do not stop after testing HTTP status codes.

Verify actual database state.

# 36. TRANSACTIONAL INTEGRITY

Identify operations that must be atomic.

Examples:

```text
RSVP + capacity
ticket redemption + redeemed state
application approval + audit record
role change + audit record
event deletion + dependent records
```

Use PostgreSQL transactions/functions .

Avoid multi-request workflows that can leave inconsistent state.

# 37. DATA INTEGRITY

Review every table for:

* foreign keys;
* unique constraints;
* check constraints;
* NOT NULL requirements;
* cascade behavior;
* indexes;
* timestamps;
* ownership relationships.

Database constraints should enforce invariants wherever possible.

# 38. MIGRATION SAFETY

Do not edit production schema destructively without a migration.

Create new migration files.

Migrations must be:

* deterministic;
* idempotent ;
* ordered;
* reviewable;
* reversible where realistically possible.

Do not delete historical security migrations simply to make the schema easier to understand.

# 39. OBSERVABILITY

Introduce production-safe observability.

Track:

* application errors;
* authorization failures;
* database errors;
* authentication failures;
* critical workflow events;
* unexpected mutation failures.

Do not log:

* passwords;
* tokens;
* private student documents;
* sensitive form data;
* full authorization headers.

# 40. FRONTEND ARCHITECTURE HARDENING

Keep the existing architecture unless there is a strong reason to change it.

Recommended separation:

```text
features/
services/
shared/
security/
```

Avoid putting business authorization logic into presentation components.

Components should request actions.

Services/database policies should enforce them.

# 41. ROUTE PROTECTION

Protect routes for UX:

```text
/admin
```

must require an authenticated user.

But remember:

```text
React Router protection ≠ security
```

Direct database/API access must remain secure even when route protection is bypassed.

# 42. ADMIN SECURITY

Admin functionality should receive special treatment.

For every admin operation:

* require authentication;
* verify server-side role;
* verify resource scope;
* validate input;
* audit action;
* prevent arbitrary object IDs;
* prevent arbitrary role assignment;
* prevent privilege escalation.

Super-admin functionality should be minimized.

# 43. LEAST PRIVILEGE

Review every role.

Ask:

> Does this role actually need this permission?

Remove permissions that are not required.

Especially review:

* teacher access;
* organizer access;
* HOD access;
* DSW admin access;
* super admin access.

Do not give "full access" simply because implementation is easier.

# 44. PRODUCTION / DEVELOPMENT ENVIRONMENT SEPARATION

Create a clear distinction between:

```text
development
staging
production
```

Never allow development authentication bypasses in production.

Never use production secrets in local development.

Document environment variables.

Ensure build output does not contain secrets.

# 45. CI SECURITY PIPELINE

Add automated checks to CI.

Minimum pipeline:

```text
install
↓
typecheck
↓
lint
↓
unit tests
↓
build
↓
dependency audit
↓
security/static checks
```

If feasible add:

* database migration validation;
* RLS tests;
* authorization integration tests;
* dependency lockfile checks.

A pull request should fail if critical security checks fail.

# 46. AUTOMATED RLS TEST SUITE

Create explicit database/security tests.

Do not rely solely on manual testing.

Test identities:

```text
anonymous
student A
student B
organizer A
organizer B
teacher
HOD department A
HOD department B
DSW admin
super admin
```

Test every important table/action combination.

Represent results clearly:

```text
PASS
FAIL
NOT APPLICABLE
```

# 47. SECURITY REGRESSION TESTS

Every vulnerability already fixed must become a permanent regression test.

At minimum:

1. Application IDOR.
2. Application status escalation.
3. Profile role escalation.
4. RSVP deletion by another student.
5. Duplicate RSVP.
6. Audit deletion.
7. Audit actor spoofing.
8. Attendance ticket replay.
9. Capacity race.
10. Department boundary violation.

# 48. THREAT MODEL

Create:

```text
docs/security/threat-model.md
```

Threat actors:

* anonymous attacker;
* malicious student;
* malicious organizer;
* compromised student account;
* compromised organizer account;
* malicious HOD;
* malicious administrator;
* automated bot;
* attacker with browser developer tools.

For each threat document:

```text
Asset
Threat
Attack path
Existing control
Residual risk
Mitigation
```

# 49. SECURITY ARCHITECTURE DOCUMENTATION

```text
docs/architecture.md
docs/security/security-architecture.md
docs/security/authorization-model.md
docs/security/database-security.md
docs/security/threat-model.md
docs/security/incident-response.md
```

Documentation must describe the ACTUAL implementation.

Never document intended behavior as if it already exists.

# 50. INCIDENT RESPONSE FOUNDATION

Create a basic incident response procedure covering:

* compromised account;
* leaked credential;
* suspicious admin activity;
* unauthorized data access;
* malicious event creation;
* forged attendance;
* database compromise.

Document:

```text
detect
contain
investigate
revoke
recover
review
```

# 51. PRIVACY / DATA MINIMIZATION

Identify every sensitive field.

For each field ask:

```text
Why do we store this?
Who needs it?
How long should it exist?
Does the frontend need it?
Does it need to be cached?
```

Minimize unnecessary storage.

Do not expose student financial information, academic information, or identity data to users who do not require it.

# 52. PRODUCTION READINESS CHECK

After implementation, run a full audit.

Check:

### Authentication

* [ ] Institutional authentication works.
* [ ] Anonymous protected mutations fail.
* [ ] Logout works.
* [ ] Session expiry works.
* [ ] Account switching works.

### Authorization

* [ ] RBAC is server authoritative.
* [ ] RLS protects every protected table.
* [ ] Resource ownership is enforced.
* [ ] Department boundaries work.
* [ ] Admin boundaries work.

### Database

* [ ] Constraints are correct.
* [ ] Transactions are correct.
* [ ] Functions are secured.
* [ ] SECURITY DEFINER functions are reviewed.
* [ ] Grants are least privilege.

### API

* [ ] Direct PostgREST attacks fail.
* [ ] RPC attacks fail.
* [ ] Enumeration attacks fail.
* [ ] Payload manipulation fails.

### PWA

* [ ] Offline cache cannot cross accounts.
* [ ] Sensitive data is minimized.
* [ ] Logout clears account-specific cached state.
* [ ] Offline unauthorized mutations fail on synchronization.

### Security

* [ ] XSS review passed.
* [ ] CSP reviewed.
* [ ] Secrets scan passed.
* [ ] Dependency audit reviewed.
* [ ] Security headers verified.

### Testing

* [ ] RLS tests pass.
* [ ] IDOR tests pass.
* [ ] privilege escalation tests pass.
* [ ] business logic tests pass.
* [ ] regression tests pass.
* [ ] production build passes.

# 53. IMPORTANT: DO NOT FAKE SECURITY RESULTS

Never report:

```text
secure
production ready
enterprise grade
fully secure
unhackable
```

unless the evidence genuinely supports the specific claim.

Instead report:

```text
IMPLEMENTED
VERIFIED
PARTIALLY VERIFIED
UNVERIFIED
RESIDUAL RISK
```

Every security claim must have evidence.

# 54. REQUIRED IMPLEMENTATION WORKFLOW

Follow this exact sequence.

## PHASE 1 — RECONNAISSANCE

* repository;
* source;
* package.json;
* environment variables;
* Supabase migrations;
* RLS policies;
* database functions;
* triggers;
* routes;
* Zustand stores;
* authentication flow;
* PWA configuration;
* Cloudflare configuration;
* tests.

Do NOT modify code during this phase.

Produce:

```text
docs/security/pre-production-audit.md
```

with findings.

## PHASE 2 — SECURITY MIGRATION PLAN

```text
docs/security/production-migration-plan.md
```

Prioritize:

```text
P0 = production blocker
P1 = high priority
P2 = hardening
P3 = improvement
```

Do not start random refactoring.

## PHASE 3 — IMPLEMENT P0

1. Remove anonymous protected mutations.
2. Establish real Supabase Auth identity.
3. Harden profile provisioning.
4. eliminate client-controlled identity.
5. harden all RLS policies.
6. secure administrative operations.

## PHASE 4 — IMPLEMENT P1

* secure RSVP architecture;
* transactional capacity;
* application state machine;
* attendance security;
* trusted audit events;
* profile privacy;
* storage policies if applicable;
* rate/abuse controls;
* session/account-switching hardening.

## PHASE 5 — TEST

```bash
pnpm install
pnpm audit
pnpm lint
pnpm test
pnpm build
```

Also run all database/RLS/security tests.

Fix failures.

# 55. DO NOT BREAK EXISTING FEATURES

Existing features include:

* Events
* Clubs
* Student onboarding
* Applications tracker
* Admin portal
* A4 document wizard
* PWA/offline functionality

Preserve their intended functionality while moving authorization/security to the trusted boundary.

If a feature fundamentally conflicts with production security, prioritize security and document the required product change.

# 56. FINAL DELIVERABLE

At completion produce:

```text
docs/security/production-readiness-report.md
```

Include:

## Executive Summary

## Architecture Before

## Architecture After

## Authentication Changes

## Authorization Changes

## RLS Changes

## Database Changes

## API Changes

## PWA Changes

## Audit Logging Changes

## Security Headers

## Dependency Findings

## Threat Model

## Security Tests

## IDOR Tests

## Privilege Escalation Tests

## Business Logic Tests

## Remaining Risks

## Unverified Items

## Production Deployment Checklist

## Exact Files Changed

## Exact Database Migrations Added

## Commands Used

## Test Results

# 57. FINAL ARCHITECTURE TARGET

The desired production architecture should approximately become:

```text
┌──────────────────────┐
│ University │
│ Users │
└──────────┬───────────┘
│
▼
┌──────────────────────┐
│ Institutional SSO │
│ / Supabase Auth │
└──────────┬───────────┘
│
auth.uid()
│
▼
┌────────────────────────────────────────────────────────────┐
│ CampusOS React SPA │
│ │
│ Router → UI → Feature Services → Validation → API Client │
│ │ │
│ Untrusted Client │
└────────────────────────┬───────────────────────────────────┘
│
HTTPS
│
▼
┌────────────────────────────────────────────────────────────┐
│ Supabase Platform │
│ │
│ Auth → PostgREST / Trusted Functions / RPC │
│ │ │
│ ▼ │
│ PostgreSQL Authorization │
│ │
│ RLS + RBAC + Ownership + Department Scope │
│ │ │
│ ▼ │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────────┐ │
│ │Profiles│ │ Events │ │ RSVPs │ │ Applications │ │
│ └────────┘ └────────┘ └────────┘ └──────────────────┘ │
│ │
│ ┌──────────────┐ ┌──────────────────┐ ┌──────────────┐ │
│ │Audit Logs │ │Attendance Tickets│ │Storage │ │
│ └──────────────┘ └──────────────────┘ └──────────────┘ │
└────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────┐
│ Observability / │
│ Security Monitoring │
└─────────────────────┘
```

The central security principle is:

```text
CLIENT REQUEST
↓
AUTHENTICATED IDENTITY
↓
SERVER/DATABASE AUTHORIZATION
↓
BUSINESS RULE VALIDATION
↓
TRANSACTION
↓
DATABASE STATE CHANGE
↓
AUDIT EVENT
```

Never:

```text
CLIENT CLAIM
↓
TRUST
↓
DATABASE
```

# 58. EXECUTION RULE

Start by inspecting the repository.

Do not ask me to manually explain architecture that can be discovered from the codebase.

Do not rewrite the whole project.

Do not introduce unnecessary frameworks.

Do not weaken security to make tests pass.

Do not create fake security controls.

Do not mark an issue fixed until it is actually tested.

When implementation is complete, provide:

1. concise summary of changes;
2. files changed;
3. migrations created;
4. security controls implemented;
5. tests executed;
6. test results;
7. remaining risks;
8. items requiring external Supabase/Cloudflare configuration;
9. exact production deployment steps.

The goal is not to make CampusOS "look secure".

Goal: make the **actual security boundary enforceable outside the browser**.
