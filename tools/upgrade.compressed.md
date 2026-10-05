# CAMPUSOS — FREE-TIER-FIRST PREMIUM UNIVERSITY OS

You are the principal software architect, senior full-stack engineer, database engineer, security engineer, DevSecOps engineer, product engineer, and performance engineer responsible for transforming the existing **CampusOS RBU** application into a production-quality university operating system.

Goal: implement the premium product vision described below while keeping the system **free-tier-first**.

This is an actual coding and architecture task.

Do not merely describe the solution.

Inspect the repository, modify the codebase, create migrations, implement features, create tests, update configuration, and document everything.

# 1. CORE OBJECTIVE

Transform CampusOS from:

```text
University CRUD / notice-board application
```

into:

```text
CampusOS
│
├── Trusted University Identity
├── Campus Social Graph
├── Events & Clubs
├── Student Applications
├── Campus Passport
├── Digital Student Profile
├── Team / Project Matching
├── Study Buddy Discovery
├── Club Recruitment
├── Campus Stories
├── Event Media & Recaps
├── Attendance
├── Notifications
└── University Administration
```

The application must remain:

* secure;
* maintainable;
* responsive;
* mobile-first;
* PWA-compatible;
* accessible;
* free-tier-first;
* scalable within reasonable university-MVP limits.

Do not build unnecessary enterprise infrastructure.

# 2. FREE-TIER-FIRST IS A HARD REQUIREMENT

Every infrastructure and third-party service must be evaluated against:

```text
FREE TIER AVAILABLE?
↓
WHAT ARE THE LIMITS?
↓
WHAT HAPPENS WHEN LIMIT IS EXCEEDED?
↓
IS THERE A LOCAL / SELF-HOSTED / EXISTING-STACK FALLBACK?
```

Do NOT introduce a paid dependency merely because it is convenient.

Before adding a new service, document:

```text
Provider
Purpose
Free-tier allowance
Expected CampusOS usage
Failure mode
Fallback
Potential future cost
```

Create:

```text
docs/infrastructure/free-tier-strategy.md
```

# 3. EXISTING STACK — PRESERVE

Current stack:

* React
* TypeScript
* Vite
* React Router
* Zustand
* Tailwind
* Zod
* Supabase Auth
* Supabase PostgreSQL
* Supabase PostgREST
* Supabase Realtime
* Cloudflare Pages
* PWA

Do not migrate frameworks simply for architectural fashion.

Reuse the current stack wherever possible.

# 4. TARGET FREE-TIER ARCHITECTURE

Preferred baseline:

```text
USERS
│
▼
Cloudflare Pages
Static React SPA
│
▼
Supabase Auth
│
auth.uid()
│
▼
Supabase API
│
┌─────────┴─────────┐
▼ ▼
PostgreSQL Realtime
│ │
▼ ▼
RLS + Functions Notifications
│
┌─────────┼──────────┐
▼ ▼ ▼
Profiles Events Applications
│ │ │
└────┬────┴────┬─────┘
▼ ▼
Social Graph Matching
│
▼
CampusOS UI
```

Optional infrastructure must only be introduced when justified.

# 5. FIRST PRIORITY — SECURITY FOUNDATION

Before implementing social features, complete the production security migration.

The current architecture has known remaining risks around local authentication and anonymous mutation fallback.

Eliminate:

```text
auth.uid() IS NULL
```

from protected production authorization paths.

No anonymous user may:

* create profiles;
* create RSVPs;
* create applications;
* modify applications;
* create events;
* modify clubs;
* redeem attendance;
* perform administrative operations.

Public access should exist only for deliberately public resources.

# 6. REAL UNIVERSITY IDENTITY

Implement:

```text
Institutional Identity
↓
Supabase Auth
↓
auth.uid()
↓
profiles.auth_user_id
```

The student must not authenticate merely by typing:

* name;
* email;
* roll number;
* department.

If institutional Google authentication is available, configure the application around it.

If configuration cannot be completed automatically because credentials/admin access are required:

1. implement the code-side architecture;
2. document the external configuration;
3. create a safe development fallback;
4. ensure the fallback cannot operate in production.

# 7. CAMPUS PASSPORT

Create a verified academic identity layer.

Concept:

```text
Campus Passport
────────────────────
Name
Department
Year
Verified status
Skills
Clubs
Events
Attendance
Achievements
Projects
Leadership
```

Implement database structures rather than storing everything in one profile JSON object.

Suggested conceptual tables:

```text
profiles
student_profiles
skills
student_skills
clubs
club_memberships
achievements
student_achievements
```

Use normalized relational data for important/queryable information.

Do not expose private identity information publicly.

# 8. PROFILE PRIVACY

Separate:

```text
public profile
```

from:

```text
private academic/account data
```

Public profile may contain:

* display name;
* avatar;
* department;
* year;
* approved skills;
* approved achievements;
* clubs;
* public projects.

Private data may contain:

* authentication identifiers;
* roll number;
* private email;
* verification state;
* sensitive academic information;
* application information.

Students must control what optional profile information is publicly discoverable.

# 9. CAMPUS SOCIAL GRAPH

Implement a secure `connections` system.

Potential states:

```text
pending
accepted
rejected
blocked
```

Relationships must be symmetric .

Enforce uniqueness at the database level.

Do not allow:

```text
student A creates connection as student B
```

Identity must come from `auth.uid()`.

Do not automatically create social connections merely because two students attended the same event.

Instead:

```text
Shared Event
↓
Suggested Connection
↓
Student chooses
↓
Connection Request
```

This is safer and more privacy-preserving.

# 10. SKILLS & ENDORSEMENTS

```text
skills
student_skills
skill_endorsements
```

Rules:

* students can add allowed skills;
* endorsements must originate from authenticated users;
* users cannot endorse themselves unless explicitly permitted;
* duplicate endorsements must be prevented;
* blocked users cannot interact;
* endorsement counts must be database-authoritative.

Do not allow users to fabricate:

```text
"500 endorsements"
```

through client state.

# 11. DIGITAL CAMPUS RESUME

```text
/profile
/profile/resume
```

The resume should derive information from real database records.

Potential sections:

```text
Identity
Education
Skills
Clubs
Leadership
Events
Attendance
Projects
Achievements
Endorsements
```

Do NOT use sensitive document applications as resume content unless explicitly designed and authorized.

The resume should be shareable through a public-safe URL.

Example:

```text
/campus/u/<public-profile-id>
```

Never expose database authorization through the public URL.

# 12. RESUME GENERATION

Prefer a browser-based print/PDF workflow before introducing a dedicated PDF-generation server.

Why:

```text
Browser PDF
=
zero additional backend infrastructure
```

```text
Print-friendly resume
+
download/print as PDF
```

If a server-generated PDF is later required, evaluate free-tier/serverless options first.

# 13. EVENT DATA MODEL REFACTOR

Fix poor date modeling.

Replace:

```text
event_date TEXT
event_time TEXT
```

with an appropriate temporal representation.

Prefer:

```text
starts_at TIMESTAMPTZ
ends_at TIMESTAMPTZ
```

Store canonical UTC timestamps.

Convert to campus/user timezone in the UI.

Add appropriate indexes.

Support:

* upcoming events;
* today's events;
* this week's events;
* expired events;
* event reminders.

Create a migration that safely converts existing data.

Do not destroy existing event records.

# 14. EVENT LIFECYCLE

Implement explicit event states where needed:

```text
draft
published
cancelled
completed
archived
```

Only authorized organizers/admins can change lifecycle state.

Students cannot publish events.

Database authorization must enforce ownership/scope.

# 15. EVENT CAPACITY

Implement transaction-safe RSVP logic.

Requirements:

* unique RSVP;
* capacity enforcement;
* concurrency safety;
* cancellation;
* waitlist if useful;
* authoritative count.

Do not use:

```text
frontend count
```

as the security boundary.

# 16. CAMPUS STORIES — FREE-TIER IMPLEMENTATION

Implement Stories as an optional premium feature.

Database:

```text
stories
```

Fields should include conceptually:

```text
id
author_id
media_reference
caption
created_at
expires_at
visibility
```

Stories automatically become unavailable after expiration.

Do not require a paid media-processing pipeline.

# 17. MEDIA STORAGE STRATEGY

Do NOT immediately introduce Cloudflare R2 merely because it was proposed.

First inspect whether the existing Supabase Storage allowance is sufficient.

Preferred priority:

```text
Existing Supabase Storage
↓
Cloudflare R2 free allowance if justified
↓
Other provider only if necessary
```

Private media must use controlled access.

Public event assets may use public URLs .

Sensitive student documents must NEVER be placed in public buckets.

# 18. MEDIA UPLOAD SECURITY

For every upload:

Validate:

* authenticated uploader;
* MIME type;
* file extension;
* maximum size;
* ownership;
* destination path;
* visibility.

Do not trust:

```text
filename
Content-Type
client extension
```

alone.

Prevent users from uploading executable content where inappropriate.

# 19. STORY EXPIRATION

Do not depend on a background paid server just to hide expired stories.

Query:

```text
expires_at > now()
```

and use periodic cleanup only if required.

The database timestamp is authoritative.

# 20. EVENT RECAPS

```text
event_media
event_recaps
```

Club organizers can upload approved event media.

Students can view public recap media according to event visibility.

Implement moderation controls.

Do not build expensive automated image processing unless it is genuinely required.

# 21. PHOTO TAGGING

DO NOT implement paid AI face recognition by default.

Start with:

```text
manual tagging
```

with explicit student controls.

Optional future architecture:

```text
AI face detection
```

only after evaluating:

* privacy;
* consent;
* computational cost;
* legal/policy implications;
* free-tier feasibility.

Do not automatically identify students from photographs without explicit product/security approval.

# 22. CAMPUS MAP

```text
Leaflet + OpenStreetMap
```

or another genuinely free/open solution where usage and licensing permit it.

Do not automatically introduce paid Mapbox usage.

Campus locations can be represented as:

```text
latitude
longitude
building
venue
```

Do not expose student live locations by default.

# 23. TRENDING EVENTS

Do not implement "trending" using expensive analytics infrastructure.

Derive a lightweight score from existing database data.

Example conceptual signal:

```text
RSVP velocity
+
recent engagement
+
time remaining
```

Keep calculations inexpensive.

Cache or materialize only if necessary.

Do not run expensive queries on every page load.

# 24. SQUAD SWIPE

Implement intent-based matching.

```text
project_intents
intent_skills
swipes
matches
```

Potential intent:

```text
project
looking_for
skills
description
deadline
status
```

Users can:

```text
create intent
discover compatible profiles
pass
like
invite
accept
reject
```

Do not copy Tinder/Bumble branding or proprietary implementation.

Use only the general interaction pattern.

# 25. MATCHING ALGORITHM

Start with deterministic SQL/application scoring.

Example signals:

```text
skill overlap
+
project compatibility
+
department
+
year
+
availability
```

Do not introduce machine learning merely for marketing.

A transparent scoring algorithm is sufficient for MVP.

Keep it cheap.

# 26. MATCH PRIVACY

Never expose a student's private profile information merely because they appear in matching.

Only show:

* public profile;
* selected skills;
* selected interests;
* project intent.

Do not expose:

* roll number;
* private email;
* sensitive applications;
* private academic information.

# 27. EPHEMERAL MATCH CHAT

Do not immediately deploy a separate chat backend.

Use Supabase Realtime where the free allowance is sufficient.

```text
chat_rooms
chat_members
messages
```

Secure every row with RLS.

Only matched/authorized users can read a room.

Only room members can send messages.

Do not trust `sender_id` from the client.

Derive sender identity from authenticated session.

# 28. MESSAGE RETENTION

Implement expiration conceptually:

```text
expires_at
```

for project-specific temporary rooms if the product requires ephemeral chat.

Do not claim deletion is instantaneous if no cleanup mechanism exists.

Document actual retention behavior.

# 29. STUDY BUDDY RADAR

This feature is privacy-sensitive.

DO NOT implement continuous GPS tracking.

Instead implement:

```text
Opt-in
+
Manual location/venue selection
+
Time-limited availability
+
Study tags
```

```text
Studying DBMS
Library
Until 6:00 PM
Visible to matching students
```

Do not expose exact coordinates.

Do not track users continuously.

# 30. CLUB RECRUITMENT

```text
club_recruitment_campaigns
club_applications
```

Allow clubs to create visual recruitment cards.

Students can:

```text
discover
view
express interest
apply
```

Do not create a separate paid application system.

Reuse existing CampusOS authorization architecture.

# 31. NOTIFICATIONS

Implement a notification abstraction.

Conceptually:

```text
notifications
notification_preferences
```

Channels:

```text
in-app
web push (optional)
email (optional)
```

Start with in-app notifications because they require the least external infrastructure.

# 32. WEB PUSH

Evaluate Web Push only if it can operate within the chosen free architecture.

Do not purchase a notification SaaS merely to implement push.

Use browser Push API + service worker where practical.

Store subscription records securely.

Never expose subscription secrets.

Allow users to disable categories of notifications.

# 33. REALTIME

Use Supabase Realtime selectively.

Good candidates:

* chat;
* notification updates;
* event attendance status;
* selected admin workflow updates.

Do NOT subscribe every client to every database table.

Avoid:

```text
global realtime subscriptions
```

that unnecessarily consume resources.

# 34. CACHING

Do NOT blindly cache authenticated/private responses at Cloudflare's public edge.

Public cache candidates:

```text
published events
public clubs
public profile pages
public event media
```

Private data must remain user-scoped.

Cache invalidation must be considered before introducing edge caching.

# 35. PERFORMANCE

* lazy route loading;
* code splitting;
* image optimization;
* pagination;
* database indexes;
* selective queries;
* skeleton loaders;
* optimistic UI where safe;
* request cancellation;
* debounce for search.

Do not load entire tables into the browser.

# 36. DATA PAGINATION

Every potentially growing dataset must support pagination.

Especially:

* events;
* clubs;
* RSVPs;
* applications;
* notifications;
* messages;
* stories;
* media;
* connections;
* endorsements.

Do not assume university data will remain small forever.

# 37. DATABASE INDEXING

Review query patterns and add indexes for:

* auth_user_id;
* event start time;
* event status;
* club ID;
* RSVP event ID;
* RSVP student ID;
* application student ID;
* application department;
* application status;
* notification recipient;
* story expiration;
* matching intent status.

Do not add indexes blindly.

Document important indexes.

# 38. NORMALIZE OFFICIAL APPLICATION DATA

The previous architecture used:

```text
form_data JSONB
```

for flexible document applications.

Do not blindly eliminate JSONB.

Instead determine which fields are:

```text
core/queryable fields
```

versus:

```text
document-specific variable fields
```

Normalize important/queryable fields.

Use document-specific tables where they materially improve reporting.

JSONB may remain for controlled auxiliary fields.

Never use arbitrary unvalidated JSON as a substitute for a schema.

# 39. DEPARTMENT MODEL

Do not hardcode university departments throughout SQL.

```text
departments
```

.

Relationships:

```text
profiles.department_id
hod.department_id
```

Use foreign keys.

Department creation should not require rewriting dozens of application constraints.

However, preserve compatibility with existing data through safe migrations.

# 40. ROLE / DEPARTMENT SCOPE

A HOD must only access the department(s) they are assigned to.

```text
request.department_id
```

as authorization.

Use the authenticated user's trusted profile/role/assignment.

# 41. ERROR BOUNDARIES

Implement React Error Boundaries.

At minimum:

```text
Application Error Boundary
Route Error Boundary
Feature-level fallback where useful
```

Provide:

```text
Something went wrong.
Retry
Return Home
```

Do not expose internal errors.

# 42. LOADING / OFFLINE STATES

Every important asynchronous feature should have:

```text
loading
success
empty
error
offline
retry
```

states.

Do not allow Supabase failures to produce a blank screen.

# 43. ROUTE PROTECTION

```text
RequireAuth
RequireRole
```

for UX and navigation.

Remember:

```text
Frontend route protection ≠ security.
```

RLS and trusted backend logic remain authoritative.

# 44. SEARCH

Implement campus-wide search incrementally.

Start with database-backed search over public records.

Potential targets:

```text
students (public fields only)
clubs
events
skills
projects
```

Do not expose private records through search.

# 45. SEO / SOCIAL SHARING

For public event/profile pages:

* title;
* description;
* canonical URL;
* OpenGraph metadata;
* Twitter/X card metadata where useful.

Because the application is a Vite SPA, determine whether true dynamic metadata requires:

* static metadata;
* route-level generated HTML;
* Cloudflare Worker;
* another free mechanism.

Do not introduce a paid SSR platform unnecessarily.

If full dynamic OG previews cannot be achieved purely through the existing SPA architecture, document the limitation and implement the best free solution.

# 46. ACCESSIBILITY

Premium UI does not mean visual effects everywhere.

* semantic HTML;
* keyboard navigation;
* visible focus states;
* ARIA only where needed;
* sufficient contrast;
* reduced-motion support;
* accessible dialogs;
* screen-reader labels.

Swipe interfaces MUST have non-swipe alternatives.

# 47. MOBILE-FIRST

CampusOS is primarily a student application.

Optimize for:

```text
mobile browser
PWA
low bandwidth
small screens
touch interaction
```

Do not make desktop-only assumptions.

# 48. OFFLINE ARCHITECTURE

Keep offline support only where safe.

Safe candidates:

* public events;
* clubs;
* public profile information;
* drafts.

Avoid offline persistence of:

* sensitive applications;
* admin records;
* private messages;
* authentication credentials;
* private student information.

All offline mutations must be re-authorized by the backend when synchronized.

# 49. SECURITY TESTING

Create automated tests for:

### Authentication

* anonymous mutation;
* expired session;
* logout;
* account switching.

### IDOR

* student A → student B;
* organizer A → organizer B;
* HOD A → department B.

### Privilege escalation

* student → admin;
* organizer → admin;
* HOD → super_admin.

### Matching

* unauthorized profile discovery;
* private data exposure;
* forged sender identity.

### Chat

* unauthorized room read;
* unauthorized message;
* forged sender;
* blocked user interaction.

### Stories

* unauthorized story deletion;
* expired story visibility;
* private media access.

### Attendance

* forged ticket;
* ticket replay;
* wrong event;
* wrong student.

# 50. FREE-TIER LOAD TESTING

Do not perform destructive stress testing against production services.

Build local/staging tests that simulate:

* many event reads;
* RSVP bursts;
* notification creation;
* matching queries;
* chat activity.

Estimate free-tier consumption.

```text
docs/infrastructure/capacity-model.md
```

with assumptions such as:

```text
100 students
500 students
1,000 students
5,000 students
10,000 students
```

Estimate:

* database reads;
* writes;
* storage;
* realtime connections;
* bandwidth;
* notification volume.

Do not invent provider quotas. Verify actual provider limits where available.

# 51. GRACEFUL DEGRADATION

Every optional premium service must have a failure mode.

```text
Realtime unavailable
↓
fallback to refresh/polling

Push unavailable
↓
in-app notifications

Map provider unavailable
↓
venue list

Media processing unavailable
↓
original media

AI matching unavailable
↓
deterministic matching
```

CampusOS must remain usable when optional infrastructure fails.

# 52. NO ARTIFICIAL AI DEPENDENCY

Do not add an LLM merely because CampusOS is an "AI-era" product.

Use deterministic systems for:

* permissions;
* matching baseline;
* event ranking;
* notifications;
* document workflow;
* attendance.

AI can later enhance:

* recommendation;
* summarization;
* semantic search;
* career assistance.

But AI must not become a security boundary.

# 53. OBSERVABILITY WITHOUT PAID SaaS

Implement lightweight application logging and error reporting using existing infrastructure .

Do not introduce a paid observability platform by default.

Avoid logging:

* access tokens;
* passwords;
* private documents;
* sensitive application data;
* full request bodies.

# 54. DATABASE COST/PERFORMANCE DISCIPLINE

```text
SELECT *
```

when only a few fields are required.

```text
N+1 queries
```

Avoid loading entire social graphs.

Avoid unbounded message queries.

Avoid expensive realtime subscriptions.

Use:

* pagination;
* indexes;
* selected columns;
* server-side filtering;
* aggregation.

# 55. MIGRATION STRATEGY

Do not destroy the current database.

Create sequential migrations.

Before changing existing fields:

1. inspect existing data;
2. create compatible columns;
3. migrate data;
4. verify;
5. update application code;
6. remove obsolete fields only after safe migration.

E.g. when moving:

```text
event_date/event_time
```

to:

```text
starts_at/ends_at
```

perform an explicit data migration.

# 56. BACKWARD COMPATIBILITY

Existing CampusOS functionality must continue working:

* events;
* clubs;
* onboarding;
* applications;
* admin portal;
* wizard;
* attendance;
* PWA.

Do not break existing users merely to introduce new UI.

# 57. FEATURE FLAGS

Premium features should be introduced behind feature flags where useful:

```text
campus_passport
social_graph
stories
matching
study_buddy
club_recruitment
chat
web_push
```

This allows gradual rollout.

Do not treat feature flags as security controls.

# 58. DOCUMENTATION

```text
docs/
├── architecture.md
├── product-architecture.md
├── infrastructure/
│ ├── free-tier-strategy.md
│ └── capacity-model.md
└── security/
├── security-architecture.md
├── authorization-model.md
├── threat-model.md
├── privacy-model.md
└── production-readiness.md
```

Documentation must reflect actual implementation.

# 59. DEVELOPMENT PHASES

Implement in this order.

## P0 — SECURITY

* real authentication;
* remove anonymous protected mutations;
* RLS;
* authorization;
* profile privacy;
* secure identity binding.

## P1 — DATA FOUNDATION

* timestamps;
* departments;
* normalized relationships;
* indexes;
* constraints;
* transactional workflows.

## P2 — PREMIUM IDENTITY

* Campus Passport;
* public profile;
* skills;
* endorsements;
* digital resume.

## P3 — SOCIAL CAMPUS

* connections;
* event suggestions;
* notifications.

## P4 — COLLABORATION

* project intents;
* Squad Swipe;
* matching;
* secure temporary chat.

## P5 — VISUAL CAMPUS

* stories;
* event media;
* recaps;
* manual tagging;
* campus map.

## P6 — ENGAGEMENT

* club recruitment;
* study buddy;
* trending events;
* push notifications.

## P7 — PERFORMANCE

* pagination;
* caching;
* code splitting;
* image optimization;
* query optimization.

# 60. PRODUCT QUALITY BAR

The UI should feel:

```text
Apple-level simplicity
+
LinkedIn-level identity
+
Instagram-level discovery
+
Bumble-like interaction mechanics
+
University-grade governance
```

But do NOT copy proprietary designs, branding, assets, or code.

Use the product mechanics as inspiration only.

# 61. IMPORTANT: AVOID "FEATURE BLOAT"

Before implementing any feature ask:

1. Does it improve the university experience?
2. Does it require another paid service?
3. Can it reuse existing infrastructure?
4. Does it introduce privacy/security risk?
5. Does it increase database/realtime usage significantly?
6. Can it degrade gracefully?
7. Can the MVP operate without it?

If a feature is expensive or risky, implement the free-tier-safe MVP first.

# 62. PRODUCTION READINESS REPORT

At the end create:

```text
docs/security/production-readiness.md
```

Include:

## Implemented

## Partially Implemented

## Not Implemented

## External Configuration Required

## Free-Tier Dependencies

## Free-Tier Limits

## Current Estimated Capacity

## Security Controls

## RLS Tests

## IDOR Tests

## Business Logic Tests

## Performance Tests

## Accessibility Tests

## Remaining Risks

## Future Paid Infrastructure Requirements

# 63. FREE-TIER COST AUDIT

Create a final table:

```text
Feature | Provider | Free-tier dependency | Expected usage | Risk of exceeding | Fallback
```

Every external service must appear here.

Do not say:

```text
"free forever"
```

because provider pricing and quotas can change.

```text
"currently compatible with free-tier usage under documented assumptions"
```

# 64. FINAL ENGINEERING PRINCIPLE

CampusOS must follow this architecture:

```text
USER
│
▼
AUTHENTICATED IDENTITY
│
▼
TRUST BOUNDARY
│
▼
SERVER / DATABASE RULES
│
┌─────────┴─────────┐
▼ ▼
BUSINESS VALIDATION RLS/RBAC
│ │
└─────────┬─────────┘
▼
TRANSACTION
│
▼
DATABASE STATE
│
▼
AUDIT EVENT
│
▼
UI UPDATE
```

The browser is never the authority.

The database is never allowed to accept an invalid business state merely because the UI allowed it.

Optional services must never become mandatory for core operation.

Paid infrastructure must never be introduced without justification.

# 65. EXECUTION INSTRUCTION

START NOW.

First:

1. inspect the repository;
2. inspect current database migrations;
3. inspect current RLS;
4. inspect authentication;
5. inspect package dependencies;
6. inspect PWA;
7. inspect current UI architecture;
8. inspect existing tests.

Then create the audit documents.

Then implement the P0 security foundation.

Then implement the data foundation.

Then implement premium features incrementally.

After EVERY major phase:

```text
typecheck
lint
tests
build
security tests
```

Do not continue blindly after failures.

At the end report:

```text
Files changed
Migrations added
Features implemented
Security controls
Tests executed
Tests passed
Tests failed
Free-tier services
Estimated capacity
External configuration required
Remaining risks
```

Do not claim CampusOS is:

* unhackable;
* fully secure;
* enterprise-grade;
* infinitely scalable;
* free forever.

Use evidence-based status labels:

```text
VERIFIED
IMPLEMENTED
PARTIALLY VERIFIED
UNVERIFIED
RESIDUAL RISK
REQUIRES EXTERNAL CONFIGURATION
```

The final objective is:

> Build the maximum practical CampusOS capability using the existing stack and currently available free-tier infrastructure, while keeping the architecture secure, modular, observable, privacy-conscious, performant, and capable of migrating to paid infrastructure later without a fundamental rewrite.
