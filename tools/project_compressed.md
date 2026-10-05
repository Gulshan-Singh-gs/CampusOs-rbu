CampusOS BRD
SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY
Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
1 System Prompt: Enterprise SDLC Generation Specification Established complete CampusOS concept: edge-native PWA bridging campus culture and administrative bureaucracy for RBU Mohali. Defined 4 functional modules (Event Hub, Clubs Directory, Document Wizard, Status Tracker), $0 cloud architecture (Cloudflare Pages + Supabase Free + R2), PostgreSQL schema (6 tables with RLS), and open student authentication model. React 18, Tailwind CSS, Lucide Icons, Supabase PostgreSQL 15.x/PostgREST/Supavisor, Cloudflare Pages CDN, Cloudflare R2, localStorage sessions
2 Business Requirements Document (BRD) Enterprise business language: problem quantification (4,500 lost student-hours/yr, 33 staff-hrs/wk wasted), TAM/SAM/SOM (44.6M/500K/10K), 5 OKRs, $0 unit economics, RACI matrix, 8-risk matrix. All upstream technical decisions; business justification, stakeholder sign-off, success metrics
3 Product Requirements Document (PRD) Engineering-ready specs: personas (Aarav, Simran, Dr. Mehta), MoSCoW features (FR-001→FR-029), Gherkin AC, NFRs (P95 <200ms, 99.9% uptime, WCAG 2.1 AA), 16 telemetry events, Go/No-Go checklist. Consumes BRD OKRs; drives UX wireframes, sprint planning, QA test cases; establishes FR IDs
4 User Journey Maps & Interaction Workflows Behavioral blueprint: lifecycle stages, journey maps (Aarav/Simran/Dr. Mehta), 4 Mermaid flowcharts (onboarding, wizard, failure, state lifecycle), edge-case playbooks, full Information Architecture (routes /events, /clubs, /wizard, /applications). Consumes PRD FR IDs; drives Figma wireframes, React routing, state machines, error middleware
5 (Current) UI/UX Design Specifications & Component Guide Design-system layer: color/typography/spacing tokens (HEX+HSL), elevation shadows, radius tokens, screen-by-screen ASCII wireframes, component state matrix (7 states × 12 components), responsive breakpoints, motion tokens. Consumes journey maps + PRD; drives Tailwind config, Figma component library, frontend implementation 1:1
Project Structure Snapshot:
This document is the fifth artifact and the first concrete design-token deliverable in the CampusOS pipeline. It converts journey maps and PRD acceptance criteria into a buildable design system — tokens, components, and layouts that frontend engineers and Figma designers implement without ambiguity. All Tailwind configuration, Figma components, and React component code must trace to the tokens and specifications defined here.

SECTION 2: 🏛️ FULL TECHNICAL SPECIFICATION
UI/UX Design Specifications & Component Guide
Product: CampusOS — Campus Community & Administrative Automation Platform
Document ID: RBU-CAMPUSOS-UIUX-001
Version: 1.0 (Baseline)
Date: October 2026
Owner: Principal UI/UX Design System Lead
Status: Ready for Figma Library Build & Frontend Implementation
Upstream Dependencies: RBU-CAMPUSOS-PRD-001, RBU-CAMPUSOS-UXJ-001

1. Design System Foundations & Tokens
1.1 Design Philosophy
CampusOS uses a dark-slate glassmorphism aesthetic — a modern, premium, mobile-first visual language that feels native to Gen-Z student culture while retaining the institutional gravitas needed for official document workflows. Every token below is designed for one of two modes:

Mode Surface Purpose
Screen Mode (default) Dark canvas #090a10 + glassmorphism panels #11131c All interactive browsing
Print Mode (override) Pure white A4, black text Document letterhead output only
1.2 Color Palette
1.2.1 Brand Colors
Token Name HEX HSL RGB Usage
--color-brand-primary Emerald Accent #10b981 hsl(160, 84%, 39%) rgb(16, 185, 129) Primary CTA, active states, success
--color-brand-primary-hover Emerald Hover #059669 hsl(160, 84%, 30%) rgb(5, 150, 105) Hover on primary buttons
--color-brand-primary-active Emerald Pressed #047857 hsl(160, 84%, 24%) rgb(4, 120, 87) Active/pressed state
--color-brand-primary-subtle Emerald Glow #10b98120 hsl(160, 84%, 39% / 0.13) rgba(16,185,129,0.13) Focus rings, subtle highlights
--color-brand-secondary Indigo #6366f1 hsl(239, 84%, 67%) rgb(99, 102, 241) Secondary CTA, print button
--color-brand-secondary-hover Indigo Hover #4f46e5 hsl(239, 84%, 60%) rgb(79, 70, 229) Hover on secondary
1.2.2 Neutral Scale (Slate)
Token HEX HSL Usage
--color-neutral-50 #f8fafc hsl(210, 40%, 98%) Primary text on dark surfaces
--color-neutral-100 #f1f5f9 hsl(210, 40%, 96%) High-emphasis body text
--color-neutral-200 #e2e8f0 hsl(214, 32%, 91%) Secondary text
--color-neutral-300 #cbd5e1 hsl(213, 27%, 84%) Tertiary text, placeholders
--color-neutral-400 #94a3b8 hsl(215, 20%, 65%) Muted text, disabled labels
--color-neutral-500 #64748b hsl(215, 16%, 47%) Inactive nav icons, borders
--color-neutral-600 #475569 hsl(215, 19%, 35%) Dividers, muted borders
--color-neutral-700 #334155 hsl(215, 25%, 27%) Input borders, subtle separators
--color-neutral-800 #1e293b hsl(217, 33%, 17%) Elevated panel backgrounds
--color-neutral-850 #1a1f2e hsl(220, 28%, 14%) Card backgrounds
--color-neutral-900 #11131c hsl(227, 25%, 9%) Panel surfaces (glassmorphism base)
--color-neutral-950 #090a10 hsl(230, 30%, 5%) Canvas background
1.2.3 Semantic Colors
Token State HEX HSL Usage
--color-success Success #10b981 hsl(160, 84%, 39%) Approved badges, confirmed states
--color-success-bg Success BG #10b98120 hsl(160, 84%, 39% / 0.13) Success badge background
--color-warning Warning #f59e0b hsl(38, 92%, 50%) Pending Review badge, offline banner
--color-warning-bg Warning BG #f59e0b20 hsl(38, 92%, 50% / 0.13) Warning badge background
--color-destructive Error #ef4444 hsl(0, 84%, 60%) Rejected badge, form errors
--color-destructive-bg Error BG #ef444420 hsl(0, 84%, 60% / 0.13) Error badge background
--color-info Info #3b82f6 hsl(217, 91%, 60%) Informational toasts
--color-info-bg Info BG #3b82f620 hsl(217, 91%, 60% / 0.13) Info background
1.2.4 Gradient Tokens (Event Banners)
Token Value Purpose
--gradient-cultural linear-gradient(135deg, #f59e0b 0%, #ef4444 100%) Cultural events
--gradient-technical linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) Technical events
--gradient-sports linear-gradient(135deg, #10b981 0%, #06b6d4 100%) Sports events
--gradient-default linear-gradient(135deg, #475569 0%, #1e293b 100%) Uncategorized
1.2.5 Color Contrast Validation (WCAG 2.1 AA)
Foreground Background Ratio Pass AA?
neutral-50 #f8fafc neutral-900 #11131c 15.8:1 ✅ AAA
neutral-200 #e2e8f0 neutral-900 #11131c 11.9:1 ✅ AAA
neutral-300 #cbd5e1 neutral-900 #11131c 9.7:1 ✅ AAA
neutral-400 #94a3b8 neutral-900 #11131c 5.8:1 ✅ AA
brand-primary #10b981 neutral-900 #11131c 8.1:1 ✅ AAA
warning #f59e0b neutral-900 #11131c 8.4:1 ✅ AAA
destructive #ef4444 neutral-900 #11131c 5.2:1 ✅ AA
neutral-950 #090a10 brand-primary #10b981 8.6:1 ✅ AAA
Rule: No text below neutral-400 on the dark canvas. neutral-500 reserved for icons only (≥24px).

1.3 Typography Scale
1.3.1 Font Families
Token Stack Purpose
--font-sans 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif UI text, headings
--font-serif 'Georgia', 'Times New Roman', serif Print letterhead only
--font-mono 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace REF IDs, tracking IDs
Loading Strategy:

Inter via Google Fonts with font-display: swap and preconnect to fonts.gstatic.com.

Self-host subset (Latin + Devanagari) at build time for offline PWA support.

Subset weights: 400, 500, 600, 700, 800.

1.3.2 Type Scale (1.250 Major Third Ratio)
Token Size (rem) Size (px) Weight Line-Height Letter-Spacing Usage
--text-h1 2.441rem 39px 800 1.15 -0.02em Page hero (rare)
--text-h2 1.953rem 31px 700 1.2 -0.015em Screen titles
--text-h3 1.563rem 25px 700 1.25 -0.01em Section headers
--text-h4 1.25rem 20px 600 1.3 -0.005em Card titles
--text-h5 1rem 16px 600 1.4 0 Subsection titles
--text-h6 0.875rem 14px 600 1.4 0.01em Overline labels
--text-body-lg 1rem 16px 400 1.55 0 Long-form body
--text-body 0.875rem 14px 400 1.5 0 Default body
--text-body-sm 0.8125rem 13px 400 1.5 0 Compact body
--text-caption 0.75rem 12px 500 1.4 0.01em Meta, timestamps
--text-overline 0.6875rem 11px 700 1.4 0.08em Category pills, tags
--text-code 0.8125rem 13px 500 1.5 0 REF IDs, tracking IDs
1.3.3 Print Typography (Letterhead)
Element Font Size Weight Line-Height
University Name --font-serif 22pt 700 1.2
Memorandum Header --font-serif 14pt 700 1.3
REF ID --font-mono 11pt 600 1.4
Body Text --font-serif 11pt 400 1.6
Details Table --font-serif 10pt 400 1.5
Signature Block --font-serif 10pt 500 1.4
1.4 Spacing & Elevation Grid
1.4.1 Spacing Scale (4px Base Unit)
Token Value px Usage
--space-0 0 0 Reset
--space-1 0.25rem 4px Icon-to-label gap
--space-2 0.5rem 8px Inline element gap
--space-3 0.75rem 12px Tight padding
--space-4 1rem 16px Default padding
--space-5 1.25rem 20px Card padding
--space-6 1.5rem 24px Section gap
--space-8 2rem 32px Between sections
--space-10 2.5rem 40px Large gaps
--space-12 3rem 48px Page section separator
--space-16 4rem 64px Hero spacing
--space-20 5rem 80px Major layout blocks
1.4.2 Elevation Shadows
Token CSS box-shadow Usage
--shadow-sm 0 1px 2px 0 rgb(0 0 0 / 0.35) Input fields, subtle lift
--shadow-md 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3) Cards default
--shadow-lg 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4) Modals, popovers
--shadow-xl 0 20px 25px -5px rgb(0 0 0 / 0.55), 0 8px 10px -6px rgb(0 0 0 / 0.4) Bottom sheets, drawers
--shadow-2xl 0 25px 50px -12px rgb(0 0 0 / 0.7) Full-screen modals
--shadow-emerald 0 0 0 4px rgb(16 185 129 / 0.15) Focus ring (primary)
--shadow-emerald-lg 0 8px 24px -4px rgb(16 185 129 / 0.35) Primary CTA emphasis
1.4.3 Glassmorphism Panel Recipe
css
.glass-panel {
background: rgba(17, 19, 28, 0.85); /* neutral-900 @ 85% */
backdrop-filter: blur(12px) saturate(140%);
-webkit-backdrop-filter: blur(12px) saturate(140%);
border: 1px solid rgba(148, 163, 184, 0.08); /* neutral-400 @ 8% */
border-radius: var(--radius-lg);
}
1.5 Corner Radius & Border Tokens
Token Value Usage
--radius-none 0 Print letterhead elements
--radius-sm 0.25rem (4px) Chips, small badges
--radius-md 0.5rem (8px) Buttons, inputs
--radius-lg 0.75rem (12px) Cards, panels
--radius-xl 1rem (16px) Feature cards
--radius-2xl 1.5rem (24px) Hero panels
--radius-full 9999px Pills, avatars
Border Token Value Usage
--border-width-thin 1px Default borders
--border-width-medium 1.5px Focus-visible rings
--border-width-thick 2px Active tab underline
--border-color-subtle rgba(148, 163, 184, 0.08) Panel dividers
--border-color-default rgba(148, 163, 184, 0.15) Card borders
--border-color-strong rgba(148, 163, 184, 0.30) Focus borders
1.6 Tailwind Configuration Mapping
js
// tailwind.config.js — CampusOS tokens
module.exports = {
theme: {
extend: {
colors: {
canvas: '#090a10',
panel: '#11131c',
brand: {
DEFAULT: '#10b981',
hover: '#059669',
active: '#047857',
subtle: 'rgba(16,185,129,0.13)',
},
secondary: { DEFAULT: '#6366f1', hover: '#4f46e5' },
success: { DEFAULT: '#10b981', bg: 'rgba(16,185,129,0.13)' },
warning: { DEFAULT: '#f59e0b', bg: 'rgba(245,158,11,0.13)' },
destructive: { DEFAULT: '#ef4444', bg: 'rgba(239,68,68,0.13)' },
info: { DEFAULT: '#3b82f6', bg: 'rgba(59,130,246,0.13)' },
},
fontFamily: {
sans: ['Inter', 'system-ui', 'sans-serif'],
serif: ['Georgia', 'serif'],
mono: ['JetBrains Mono', 'monospace'],
},
boxShadow: {
sm: '0 1px 2px 0 rgb(0 0 0 / 0.35)',
md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
lg: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
xl: '0 20px 25px -5px rgb(0 0 0 / 0.55)',
'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.7)',
emerald: '0 0 0 4px rgb(16 185 129 / 0.15)',
},
borderRadius: { lg: '0.75rem', xl: '1rem', '2xl': '1.5rem' },
},
},
};
2. Screen-by-Screen UI Inventory
2.1 Global App Shell
Purpose: Persistent frame hosting all authenticated views.

ASCII Wireframe (Mobile 375px):

text
┌─────────────────────────────────────┐
│ ☰ CampusOS 🔔 👤 │ ← Top bar (56px)
│ │
│ │
│ [SCREEN CONTENT] │
│ [scrollable] │
│ │
│ │
│ │
├─────────────────────────────────────┤
│ 🏠 👥 📄 📋 │ ← Bottom nav (64px)
│ Home Clubs Wizard Apps │
└─────────────────────────────────────┘
Component Tree:

text
<AppShell>
<TopBar>
<BrandLogo /> <NotificationBell /> <AvatarMenu />
</TopBar>
<MainContent> {children} </MainContent>
<BottomNav>
<NavItem to="/events" icon="Home" label="Home" />
<NavItem to="/clubs" icon="Users" label="Clubs" />
<NavItem to="/wizard" icon="FileText" label="Wizard" />
<NavItem to="/applications" icon="ClipboardList" label="Apps" />
</BottomNav>
</AppShell>
Primary CTA: Context-dependent per child screen.
Secondary CTA: Notification bell (top right).
Elevation: Top bar --shadow-sm; bottom nav --shadow-lg.

2.2 Screen: Onboarding /onboarding
Purpose: Capture student profile in <90 seconds with zero friction.

ASCII Wireframe (Mobile):

text
┌─────────────────────────────────────┐
│ │
│ 🎓 CampusOS │
│ Your campus, your way. │
│ │
│ ┌───────────────────────────────┐ │
│ │ Full Name │ │
│ │ [Aaravpreet Singh__________] │ │
│ └───────────────────────────────┘ │
│ │
│ ┌───────────────────────────────┐ │
│ │ Email │ │
│ │ [aarav@gmail.com___________] │ │
│ └───────────────────────────────┘ │
│ │
│ ┌───────────────────────────────┐ │
│ │ Roll Number │ │
│ │ [RBU21CSE045_______________] │ │
│ └───────────────────────────────┘ │
│ │
│ ┌──────────────┐ ┌────────────┐ │
│ │ Department ▾ │ │ Year ▾ │ │
│ └──────────────┘ └────────────┘ │
│ │
│ ┌───────────────────────────────┐ │
│ │ Create Profile │ │ ← Emerald primary
│ └───────────────────────────────┘ │
│ │
│ By continuing you agree to terms │
└─────────────────────────────────────┘
Primary CTA: "Create Profile" — emerald, full-width, 48px height, --radius-md.
Secondary CTA: "Terms" — text link, --color-neutral-400.
Component Tree:

text
<OnboardingScreen>
<BrandHeader> 🎓 CampusOS + tagline </BrandHeader>
<Form>
<TextInput name="full_name" label="Full Name" />
<TextInput name="email" label="Email" type="email" />
<TextInput name="roll_number" label="Roll Number" />
<SelectRow>
<Select name="department" options={[...]} />
<Select name="year_of_study" options={[1,2,3,4,5]} />
</SelectRow>
<Button variant="primary" fullWidth>Create Profile</Button>
</Form>
<LegalFooter>Terms link</LegalFooter>
</OnboardingScreen>
2.3 Screen: Events Feed /events
Purpose: Chronological event discovery with category filtering and search.

text
┌─────────────────────────────────────┐
│ ☰ CampusOS 🔔 👤 │
├─────────────────────────────────────┤
│ 🔍 Search events, venues... │
├─────────────────────────────────────┤
│ [All] Cultural Technical Sports │ ← Horizontal scroll pills
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ ▓▓▓▓▓▓ CULTURAL GRADIENT ▓▓▓▓▓ │ │
│ │ │ │
│ │ UTSAV 2026 Cultural Night │ │
│ │ 📍 Main Auditorium │ │
│ │ 📅 15 Nov 2026 · 6:00 PM │ │
│ │ │ │
│ │ 340 RSVPs [ RSVP 1-Tap ] │ │
│ └─────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────┐ │
│ │ ▓▓▓▓▓▓ TECHNICAL GRADIENT ▓▓▓▓ │ │
│ │ │ │
│ │ HackCampus 2026 │ │
│ │ 📍 CS Block Lab 4 │ │
│ │ 📅 22 Nov 2026 · 9:00 AM │ │
│ │ │ │
│ │ 42 RSVPs [ ✓ Registered ] │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 🏠 👥 📄 📋 │
└─────────────────────────────────────┘
Primary CTA: "RSVP 1-Tap" per card (emerald when unregistered; emerald-outline ✓ Registered when active).
Secondary CTA: Search input; category pills.
Component Tree:

text
<EventsScreen>
<SearchBar placeholder="Search events, venues..." />
<CategoryPills>
<Pill active>All</Pill>
<Pill>Cultural</Pill>
<Pill>Technical</Pill>
<Pill>Sports</Pill>
</CategoryPills>
<EventList>
<EventCard>
<BannerGradient variant="cultural" />
<Title />
<MetaRow>📍 venue · 📅 date · ⏰ time</MetaRow>
<CardFooter>
<RsvpCount />
<RsvpButton state="idle|registered" />
</CardFooter>
</EventCard>
</EventList>
</EventsScreen>
2.4 Screen: Clubs Directory /clubs
Purpose: Grid of recognized RBU societies.

text
┌─────────────────────────────────────┐
│ ☰ CampusOS 🔔 👤 │
├─────────────────────────────────────┤
│ Student Societies │
│ 18 recognized chapters │
├─────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ │
│ │ 🎭 │ │ 💻 │ │
│ │ Raunak │ │ RBU Tech │ │
│ │ Cultural │ │ Council │ │
│ │ Cultural │ │ Technical │ │
│ │ 340 members│ │ 180 members│ │
│ └─────────────┘ └─────────────┘ │
│ │
│ ┌─────────────┐ ┌─────────────┐ │
│ │ 📸 │ │ 📝 │ │
│ │ Shotter Jam│ │ Inkwell │ │
│ │ Photography│ │ Literary │ │
│ │ 120 members│ │ 95 members │ │
│ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────┤
│ 🏠 👥 📄 📋 │
└─────────────────────────────────────┘
Primary CTA: Tap card → Club Detail.
Component Tree:

text
<ClubsScreen>
<SectionHeader title="Student Societies" subtitle="18 recognized chapters" />
<ClubGrid columns={2}>
<ClubCard>
<ClubIcon />
<ClubName />
<CategoryPill />
<MemberCount />
</ClubCard>
</ClubGrid>
</ClubsScreen>
2.5 Screen: Wizard Hub /wizard
Purpose: Template picker for the 3 document types.

text
┌─────────────────────────────────────┐
│ ☰ CampusOS 🔔 👤 │
├─────────────────────────────────────┤
│ Document Wizard │
│ Generate official RBU letters │
│ in under 60 seconds. │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🏛️ Venue Permission Slip │ │
│ │ Campus Event & Venue Permission │ │
│ │ Addressed to: Dean of Student │ │
│ │ Welfare │ │
│ │ [ Generate → ]│ │
│ └─────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────┐ │
│ │ 💰 Financial Assistance │ │
│ │ Merit-cum-Means Application │ │
│ │ Addressed to: Financial Aid │ │
│ │ Committee │ │
│ │ [ Generate → ]│ │
│ └─────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────┐ │
│ │ 📋 MST Absence NOC │ │
│ │ Exam Absence Certificate │ │
│ │ Addressed to: Department HOD │ │
│ │ [ Generate → ]│ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 🏠 👥 📄 📋 │
└─────────────────────────────────────┘
Primary CTA: "Generate →" per template card.
Component Tree:

text
<WizardHubScreen>
<PageHeader title="Document Wizard" subtitle="..." />
<TemplateList>
<TemplateCard icon="🏛️" title="Venue Permission Slip" ...>
<Button variant="secondary">Generate →</Button>
</TemplateCard>
<TemplateCard icon="💰" title="Financial Assistance" ... />
<TemplateCard icon="📋" title="MST Absence NOC" ... />
</TemplateList>
</WizardHubScreen>
2.6 Screen: Wizard Form /wizard/:type
Purpose: Two-pane form with real-time letterhead preview.

ASCII Wireframe (Desktop 1440px):

text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ☰ CampusOS · Wizard · Venue Permission Slip 🔔 👤 │
├────────────────────────────────────┬────────────────────────────────────────┤
│ FORM (Left Pane — 40%) │ LIVE PREVIEW (Right Pane — 60%) │
│ │ │
│ Event Title * │ ┌──────────────────────────────────┐ │
│ [UTSAV 2026 Cultural Night____] │ │ RAYAT BAHRA UNIVERSITY │ │
│ │ │ Mohali, Punjab │ │
│ Event Date * │ │ ───────────────────────────── │ │
│ [15 Nov 2026_______________] │ │ │ │
│ │ │ REF: RBU/DSW/2026/PERM-0042 │ │
│ Venue * │ │ Date: 15 November 2026 │ │
│ [Main Auditorium__________] │ │ │ │
│ │ │ To, │ │
│ Expected Attendance * │ │ The Dean of Student Welfare │ │
│ [800_________________] │ │ Rayat Bahra University │ │
│ │ │ │ │
│ Description │ │ Subject: Permission for Venue │ │
│ [_________________________] │ │ │ │
│ │ │ ┌────────────────────────────┐ │ │
│ ┌───────────────────────────┐ │ │ │ Event │ UTSAV 2026 │ │ │
│ │ 🖨️ Print / Save as PDF │ │ │ │ Date │ 15 Nov 2026 │ │ │
│ └───────────────────────────┘ │ │ │ Venue │ Main Auditorium │ │ │
│ │ │ │ Att. │ 800 │ │ │
│ ┌───────────────────────────┐ │ │ └────────────────────────────┘ │ │
│ │ 📤 Submit Application │ │ │ │ │
│ └───────────────────────────┘ │ │ Student Signature: __________ │ │
│ │ │ │ │
│ │ │ Endorsement: │ │
│ │ │ Dean of Student Welfare: _____ │ │
│ │ └──────────────────────────────────┘ │
└────────────────────────────────────┴────────────────────────────────────────┘
Mobile Adaptation: Preview collapses to a bottom-sheet toggled by a "Preview" tab above the form.

Primary CTA: "📤 Submit Application" (emerald).
Secondary CTA: "🖨️ Print / Save as PDF" (indigo outline).
Component Tree:

text
<WizardFormScreen>
<SplitPane ratio="40/60">
<FormPane>
<TextInput name="title" required />
<DatePicker name="event_date" locale="en-IN" />
<TextInput name="venue" required />
<NumberInput name="expected_attendance" required />
<Textarea name="description" />
<ButtonRow>
<Button variant="outline-secondary">🖨️ Print</Button>
<Button variant="primary">📤 Submit</Button>
</ButtonRow>
</FormPane>
<PreviewPane>
<Letterhead docType="venue" data={formState} />
</PreviewPane>
</SplitPane>
</WizardFormScreen>
2.7 Screen: Applications Tracker /applications
Purpose: Dashboard of submitted applications with status.

text
┌─────────────────────────────────────┐
│ ☰ CampusOS 🔔 👤 │
├─────────────────────────────────────┤
│ My Applications │
│ 3 total · 1 pending │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ RBU/DSW/2026/PERM-0042 🟡 │ │
│ │ Venue Permission Slip │ │
│ │ → Dean of Student Welfare │ │
│ │ Submitted: 12 Oct 2026 │ │
│ │ [ Pending Review ] │ │
│ └─────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────┐ │
│ │ RBU/CSE/2026/NOC-0018 🟢 │ │
│ │ MST Absence NOC │ │
│ │ → Head of Department, CSE │ │
│ │ Submitted: 08 Oct 2026 │ │
│ │ [ Approved ] │ │
│ └─────────────────────────────────┘ │
│ │
│ ┌─────────────────────────────────┐ │
│ │ RBU/FAC/2026/FIN-0007 🔴 │ │
│ │ Financial Assistance │ │
│ │ → Financial Aid Committee │ │
│ │ Submitted: 01 Oct 2026 │ │
│ │ [ Rejected ] │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 🏠 👥 📄 📋 │
└─────────────────────────────────────┘
Primary CTA: Tap card → full letterhead read-only view + Print.
Component Tree:

text
<ApplicationsScreen>
<SectionHeader title="My Applications" subtitle="3 total · 1 pending" />
<ApplicationList>
<ApplicationCard>
<TrackingId mono />
<DocTitle />
<TargetAuthority />
<SubmissionDate />
<StatusBadge variant="pending|approved|rejected" />
</ApplicationCard>
</ApplicationList>
</ApplicationsScreen>
2.8 Screen: Club Detail /clubs/:slug
ASCII Wireframe (Mobile):

text
┌─────────────────────────────────────┐
│ ← Raunak Cultural Society │
├─────────────────────────────────────┤
│ │
│ 🎭 (large emblem) │
│ │
│ Raunak Cultural Society │
│ Cultural · 340 members │
│ │
│ Faculty Advisor: Dr. Priya Sharma │
│ Student Lead: Simran Kaur │
│ │
│ Description: │
│ RBU's flagship cultural society │
│ organizing UTSAV, Lohri, and... │
│ │
│ ┌───────────────────────────────┐ │
│ │ Join Chapter │ │ ← Emerald primary
│ └───────────────────────────────┘ │
│ │
│ Upcoming Events │
│ ┌───────────────────────────────┐ │
│ │ UTSAV 2026 · 15 Nov │ │
│ └───────────────────────────────┘ │
└─────────────────────────────────────┘
Primary CTA: "Join Chapter" (emerald).
Component Tree:

text
<ClubDetailScreen>
<BackButton />
<ClubHero>
<ClubIcon size="xl" />
<ClubName />
<CategoryAndMembers />
</ClubHero>
<AdvisorLeadBlock />
<DescriptionBlock />
<Button variant="primary" fullWidth>Join Chapter</Button>
<UpcomingEventsSection />
</ClubDetailScreen>
3. Component State Matrix
3.1 Button Component
State Background Text Border Shadow Cursor Other
Default (Primary) #10b981 #090a10 none --shadow-sm pointer —
Hover #059669 #090a10 none --shadow-md pointer transform: translateY(-1px)
Active/Pressed #047857 #090a10 none --shadow-sm pointer transform: scale(0.98)
Focus-Visible #10b981 #090a10 none --shadow-emerald pointer 2px emerald ring
Disabled #10b981 @ 40% #090a10 @ 60% none none not-allowed opacity: 0.4
Loading #10b981 spinner none --shadow-sm wait Lucide Loader2 spin
Error #ef4444 #f8fafc none --shadow-md pointer shake animation 300ms
Sizes:

Size Height Padding-X Font Size Radius
sm 32px 12px 13px --radius-md
md (default) 40px 16px 14px --radius-md
lg 48px 20px 15px --radius-md
xl 56px 24px 16px --radius-lg
3.2 Text Input Component
State Background Border Text Color Shadow Other
Default #1a1f2e rgba(148,163,184,0.15) 1px #e2e8f0 --shadow-sm placeholder #64748b
Hover #1e293b rgba(148,163,184,0.25) #e2e8f0 --shadow-sm —
Focus #1a1f2e #10b981 1.5px #f8fafc --shadow-emerald label floats up
Filled #1a1f2e rgba(148,163,184,0.15) #f8fafc --shadow-sm —
Disabled #11131c rgba(148,163,184,0.08) #64748b none cursor not-allowed
Error #1a1f2e #ef4444 1.5px #f8fafc 0 0 0 4px rgb(239 68 68 / 0.15) helper text red below
Loading #1a1f2e rgba(148,163,184,0.15) — --shadow-sm shimmer overlay
Dimensions: Height 44px; padding 12px 16px; --radius-md; font --text-body.

3.3 Event Card Component
State Background Border Shadow Transform
Default #11131c glass rgba(148,163,184,0.08) 1px --shadow-md none
Hover #1a1f2e glass rgba(148,163,184,0.15) --shadow-lg translateY(-2px)
Active #11131c rgba(16,185,129,0.3) --shadow-md scale(0.99)
Focus-Visible #11131c #10b981 2px --shadow-emerald none
Loading skeleton shimmer none --shadow-sm none
Empty transparent dashed rgba(148,163,184,0.15) none none
3.4 RSVP Button (Special Composite)
State Label Background Icon Behavior
Idle RSVP 1-Tap #10b981 none Tap → optimistic register
Optimistic (registering) RSVP 1-Tap #10b981 none Counter +1 immediately
Registered ✓ Registered transparent, emerald border Check (Lucide) Tap → optimistic unregister
Optimistic (unregistering) ✓ Registered transparent Check Counter −1 immediately
Sync failed RSVP 1-Tap (reverted) #10b981 AlertCircle (red) Tap to retry
Disabled (event past) Event Ended #334155 none No-op
3.5 Category Pill
State Background Text Border
Inactive transparent #94a3b8 rgba(148,163,184,0.15) 1px
Hover rgba(148,163,184,0.05) #cbd5e1 rgba(148,163,184,0.25)
Active rgba(16,185,129,0.13) #10b981 #10b981 1px
Focus (same as hover) #10b981 #10b981 2px ring
Disabled transparent #475569 rgba(148,163,184,0.08)
3.6 Status Badge
Variant Background Text Icon
Approved rgba(16,185,129,0.13) #10b981 CheckCircle2
Pending Review rgba(245,158,11,0.13) #f59e0b Clock
Rejected rgba(239,68,68,0.13) #ef4444 XCircle
Draft rgba(148,163,184,0.10) #94a3b8 FileEdit
Dimensions: Height 24px; padding 4px 10px; --radius-full; font --text-overline (uppercase).

3.7 Bottom Nav Item
State Icon Color Label Color Indicator
Inactive #64748b #64748b none
Active #10b981 #10b981 2px emerald top border + subtle glow
Hover (desktop) #94a3b8 #94a3b8 none
Focus-Visible #10b981 #10b981 2px emerald ring
With Badge #64748b #64748b amber dot top-right of icon
Disabled #334155 #334155 none
3.8 Toast / Snackbar
State Background Border-Left Icon Duration
Success #11131c glass #10b981 3px CheckCircle2 emerald 3000ms
Warning #11131c glass #f59e0b 3px AlertTriangle amber 4000ms
Error #11131c glass #ef4444 3px XCircle red 5000ms
Info #11131c glass #3b82f6 3px Info blue 3000ms
Position: Fixed bottom 80px (above bottom nav), centered, max-width 360px.

3.9 Modal / Bottom Sheet
State Backdrop Panel BG Animation
Opening rgba(9,10,16,0) → rgba(9,10,16,0.7) slide-up 250ms ease-out
Open rgba(9,10,16,0.7) #11131c glass —
Closing fade-out slide-down 200ms ease-in
Focus Trap — — Tab cycles within panel
Esc Key — — Triggers close
3.10 Skeleton Loader
Element Width Height Animation
Card skeleton 100% 180px shimmer 1.5s infinite
Text line 60–100% 12px shimmer
Avatar 40px 40px shimmer circular
Button 120px 40px shimmer
Shimmer CSS:

css
@keyframes shimmer {
0% { background-position: -200% 0; }
100% { background-position: 200% 0; }
}
.skeleton {
background: linear-gradient(90deg, #1a1f2e 25%, #1e293b 50%, #1a1f2e 75%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
}
3.11 Empty State Component
Property Value
Icon Lucide 96px, #475569
Headline --text-h5, #94a3b8, centered
Subtext --text-body, #64748b, centered, max-width 280px
CTA (optional) Button variant="primary" size="md"
Vertical spacing 24px between icon/headline/subtext/CTA
3.12 Offline Banner
Property Value
Position Fixed, top: 56px (below TopBar)
Background rgba(245,158,11,0.15)
Border-bottom #f59e0b 1px
Text --text-body-sm, #f59e0b, center
Icon WifiOff 16px
Height 40px
Animation slide-down 250ms on appear; slide-up on dismiss
4. Responsive Breakpoints & Layout Adapters
4.1 Breakpoint Scale
Token Min-Width Typical Device Column Grid Container Max-Width
--bp-xs 0px Small phone (iPhone SE) 4 col 100% (16px gutter)
--bp-sm 640px Large phone (landscape) 8 col 640px
--bp-md 768px Tablet portrait 12 col 768px
--bp-lg 1024px Tablet landscape / small laptop 12 col 1024px
--bp-xl 1280px Desktop 12 col 1280px
--bp-2xl 1440px Large desktop 12 col 1440px
--bp-3xl 1920px Ultrawide 12 col (centered) 1440px (content), background bleeds
4.2 Layout Adapters by Screen
Screen Mobile (<640px) Tablet (640–1024px) Desktop (≥1024px)
App Shell — Nav Bottom nav (fixed 64px) Bottom nav OR left rail (64px) Left sidebar (240px) + bottom nav hidden
Events Feed 1-column list 2-column grid 3-column grid
Clubs Directory 2-column grid 3-column grid 4-column grid
Wizard Form Form → Preview bottom sheet toggle Split 50/50 vertical stack Split 40/60 side-by-side
Applications Tracker 1-column list 2-column grid 3-column grid or table
Club Detail Full-width hero Centered 640px max Centered 720px max
Event Detail Full-width 640px centered 800px centered
Modals Bottom sheet (slide-up) Centered modal 560px Centered modal 640px
4.3 Navigation Adaptation
Mobile (<640px): Bottom nav (fixed) — primary; hamburger for profile menu.
Tablet (640–1024px): Bottom nav retained; hamburger → side drawer for profile.
Desktop (≥1024px): Left sidebar (240px) with logo top, nav items, profile bottom. Bottom nav hidden.

Desktop Sidebar Wireframe:

text
┌──────────────┬────────────────────────────────────┐
│ 🎓 CampusOS │ │
│ │ │
│ 🏠 Home │ [CONTENT] │
│ 👥 Clubs │ │
│ 📄 Wizard │ │
│ 📋 Apps │ │
│ │ │
│ │ │
│ ───────── │ │
│ 👤 Aarav │ │
│ ⚙️ Settings │ │
└──────────────┴────────────────────────────────────┘
4.4 Data Table Collapsing Strategy
For the Applications Tracker on desktop (≥1024px), switch from cards to a table:

Tracking ID Doc Type Authority Submitted Status
RBU/DSW/2026/PERM-0042 Venue Permission DSW 12 Oct 2026 🟡 Pending
RBU/CSE/2026/NOC-0018 MST NOC HOD CSE 08 Oct 2026 🟢 Approved
On mobile (<640px), collapse to card list (as shown in Section 2.7).

4.5 Touch Target Adaptation
Breakpoint Min Tap Target Rationale
Mobile 44×44px WCAG 2.1 AA + thumb ergonomics
Tablet 44×44px Same
Desktop 36×36px Pointer precision allows smaller
5. Micro-Interactions & Animation Guidelines
5.1 Duration Tokens
Token Value Usage
--duration-instant 0ms Reduced-motion fallback
--duration-fast 150ms Hover, color change, small icon
--duration-normal 250ms Modal open/close, tab switch, toast
--duration-slow 400ms Page transitions, complex reveals
--duration-slower 600ms Hero animations, onboarding
5.2 Easing Curves
Token Cubic-Bezier Usage
--ease-standard cubic-bezier(0.4, 0.0, 0.2, 1) Default for most transitions
--ease-decelerate cubic-bezier(0.0, 0.0, 0.2, 1) Entering elements (modal open)
--ease-accelerate cubic-bezier(0.4, 0.0, 1, 1) Exiting elements (modal close)
--ease-spring cubic-bezier(0.34, 1.56, 0.64, 1) Playful bounce (RSVP confirm)
--ease-emphasized cubic-bezier(0.2, 0.0, 0, 1) Material-style emphasized motion
5.3 Signature Micro-Interactions
Interaction Trigger Animation Duration Easing
RSVP confirm Tap RSVP button Scale 1.0 → 1.08 → 1.0; emerald ring flash 300ms --ease-spring
RSVP counter tick Counter changes Old number slides up + fades; new slides in from below 200ms --ease-standard
Category pill switch Tap pill Background color crossfade + 2px underline slide 200ms --ease-standard
Card lift on hover Pointer enter card translateY(0) → translateY(-2px); shadow md → lg 150ms --ease-standard
Modal open Trigger Backdrop fade 0 → 0.7; panel slide-up 40px → 0 250ms --ease-decelerate
Modal close Dismiss Panel slide-down; backdrop fade out 200ms --ease-accelerate
Toast enter New toast Slide-up from bottom + fade 250ms --ease-decelerate
Toast exit Timeout Fade-out + slide-down 200ms --ease-accelerate
Skeleton shimmer Data loading Background position sweep 1500ms linear infinite
Bottom sheet drag Pan gesture 1:1 finger follow; snap to open/closed — --ease-emphasized
Page route change Nav tap Outgoing: fade + scale 1.0 → 0.98; Incoming: fade + scale 1.02 → 1.0 250ms --ease-standard
Print preview appear Print button Letterhead fades in from 0.8 opacity 400ms --ease-decelerate
Wizard preview keystroke Field input Preview text crossfades (no layout shift) 100ms --ease-standard
Offline banner slide Network loss Slide-down from top + fade 250ms --ease-decelerate
Success checkmark Action success SVG path draw (stroke-dasharray) 400ms --ease-standard
Error shake Validation fail translateX ±4px, 3 cycles 300ms --ease-standard
5.4 Reduced-Motion Fallbacks
css
@media (prefers-reduced-motion: reduce) {
*, *::before, *::after {
animation-duration: 0.01ms !important;
animation-iteration-count: 1 !important;
transition-duration: 0.01ms !important;
scroll-behavior: auto !important;
}
.skeleton { animation: none; background: #1a1f2e; }
.toast-enter { opacity: 1; transform: none; }
}
Behavior: All signature micro-interactions collapse to instant state changes. Functionality preserved; only motion removed.

5.5 Focus & Keyboard Navigation
Element Focus Ring Tab Order
Button --shadow-emerald 2px ring Document order
Input 1.5px emerald border + --shadow-emerald Document order
Card (clickable) 2px emerald outline, offset 2px After interactive children
Modal Trap focus within panel First → last → first
Bottom nav 2px emerald ring per item Left → right
Skip link Visible on first Tab Jumps to <main>
5.6 Print Mode Override
css
@media print {
/* Strip all screen chrome */
body { background: #ffffff !important; color: #000000 !important; }
.top-bar, .bottom-nav, .sidebar, .toast, .offline-banner,
button, input, textarea, select, .search-bar, .category-pills {
display: none !important;
}
/* Letterhead only */
.letterhead {
display: block !important;
width: 210mm; height: 297mm;
margin: 0 auto;
padding: 20mm;
font-family: var(--font-serif);
color: #000000;
background: #ffffff;
box-shadow: none;
}
.letterhead table { border-collapse: collapse; width: 100%; }
.letterhead td, .letterhead th {
border: 1px solid #000000;
padding: 6pt 8pt;
font-size: 10pt;
}
@page { size: A4; margin: 0; }
}
6. Accessibility Annotations (WCAG 2.1 AA)
Component Requirement Implementation
RSVP Button Toggle state announced aria-pressed="true|false"
Category Pills Tab semantics role="tablist" + aria-selected
Status Badge Text alternative for color Icon + text label (never color-only)
Modal Focus trap + Esc close role="dialog" + aria-modal="true"
Toast Live region announce role="status" + aria-live="polite"
Offline Banner Persistent announcement role="status"
Form Errors Screen reader announce aria-live="polite" + aria-describedby
Loading Skeleton Announced as busy aria-busy="true" + aria-label="Loading"
Bottom Nav Landmark <nav aria-label="Primary">
Icon-only Buttons Accessible name aria-label mandatory
Print Button Descriptive aria-label="Print or save as PDF"
7. Figma Library Structure (Deliverable Blueprint)
Figma Page Contents
01 — Tokens Color styles, text styles, effect styles, spacing variables
02 — Primitives Buttons, inputs, badges, pills, icons, avatars
03 — Components EventCard, ClubCard, ApplicationCard, TemplateCard, Letterhead
04 — Screens — Mobile All 8 screens at 375px width, with states
05 — Screens — Desktop All 8 screens at 1440px width, with split-pane variants
06 — Flows Prototype connections matching UXJ-001 flowcharts
07 — Print Letterhead A4 templates for all 3 document types
08 — Edge States Empty, loading, error, offline variants
Naming Convention: campusos/[category]/[component]/[variant] (e.g., campusos/button/primary/lg).

8. Traceability Matrix (UI/UX → PRD)
Design Token / Component PRD FR ID UXJ Flowchart
Onboarding Form FR-001 Flowchart 1
Event Card + RSVP Button FR-003, FR-004, FR-005, FR-006 Flowchart 2
Club Card + Join Button FR-007, FR-008, FR-009 —
Wizard Form + Preview Pane FR-010, FR-011, FR-012 Flowchart 2
Print Mode CSS FR-013 Flowchart 2
Application Card + Status Badge FR-014, FR-015 Flowchart 4
Bottom Nav FR-016 —
Offline Banner + Skeleton FR-017, FR-018, FR-019 Flowchart 3
Toast System All error paths Flowchart 3
Skeleton Loaders All list screens —
— END OF UI/UX DESIGN SPECIFICATIONS & COMPONENT GUIDE —

This document is the canonical design-token and component blueprint for CampusOS. All Figma components, Tailwind configuration, and React implementations must trace to the tokens defined here. Any deviation requires a Change Request reviewed by the Principal UI/UX Design System Lead and Product Manager. Next revision expected post-Figma prototype usability testing with 20-student beta cohort.

====================================================================
MANDATORY TWO-SECTION RESPONSE FORMAT (CRITICAL MEMORY ANCHOR)
====================================================================
Because this project spans multiple deep architectural phases and LLM context windows can drift, you MUST structure your response into EXACTLY TWO SECTIONS:

### SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY
At the very top of your output, provide a concise, dense markdown summary table covering ALL documents produced so far including THIS ONE:
| Sequence | Document / Artifact Name | Core Architectural Decisions & Content Summary | Key Interfaces / Dependencies |
| :---: | :--- | :--- | :--- |
(Fill in rows for each preceding document and the current document with bullet points of the critical decisions made, tech stacks, or interfaces).
Also include a 2-3 sentence **Project Structure Snapshot** summarizing how this artifact fits into the overall repository architecture.

### SECTION 2: 🏛️ FULL TECHNICAL SPECIFICATION
Immediately following Section 1, provide the complete, exhaustive, production-ready specification requested below. Do NOT shorten or truncate Section 2.
====================================================================

### 🧠 CUMULATIVE PROJECT MEMORY (Preceding Generated Documents Summary):
The following document artifacts have already been generated in this project. You MUST stay strictly aligned with their technical decisions, architecture, schemas, and terminology:

- **Document #01**: 1 Students have smartphones with modern browsers Adoption failure Pre-launch device survey 2 Supabase Free tier (500MB DB, 5GB egress) supports 10,000 users Migration cost Load testing before launch
- **Document #02**: P1 Thumb-First Ergonomics Fixed bottom navigation bar; primary CTAs anchored in bottom 30% of viewport; all tap targets ≥ 44×44 px per WCAG 2.1 AA. P2 Zero-Friction Entry No app store download; no OTP; email + roll number + department is the entire onboarding. Target: <90 seconds from landing to first RSVP.
- **Document #03**: SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
- **Document #04**: SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies

You are a Principal Solutions Architect and Enterprise Systems Designer.
Your goal is to design the complete **High-Level System Architecture** using C4 model principles and clear Mermaid diagrams.

### PROJECT CONCEPT & REQUIREMENTS:
# SYSTEM PROMPT: ENTERPRISE SDLC GENERATION SPECIFICATION

## PROJECT TITLE: CampusOS (Campus Community & Administrative Automation Platform)
## TARGET INSTITUTION: Rayat Bahra University (RBU), Mohali Campus, Punjab, India
## OPERATIONAL SCALE: 10,000 Students | Zero-Dollar ($0.00/mo) Cloud Infrastructure

### 1. PRODUCT VISION & THE "WHY"
CampusOS is an edge-native campus operating layer designed to bridge the chasm between campus student culture and institutional bureaucracy.

1. **The Problem:**
- **Legacy ERP Gap:** University administration runs on rigid, desktop-centric ERP software (e.g., Serosoft) designed exclusively for compliance, fee invoicing, and attendance logging. It has zero community engagement, no event feeds, and no student organization tools.
- **Shadow Channel Chaos:** Real student life (clubs, hackathons, sports, and festivals like UTSAV and Lohri) runs on unorganized WhatsApp groups and ephemeral Instagram stories where notices decay rapidly and attendance cannot be verified.
- **The Paperwork Bottleneck:** Whenever students or club leads require institutional approval (venue booking, auditorium sound permissions, scholarship financial assistance, or Mid-Semester Test / MST absence NOCs), they face 3 to 5 days of manual paperwork, paper rejections, and queuing outside HOD and Dean cabins.

2. **The Solution:**
- A unified mobile-first platform uniting verified campus event discovery with an automated **University Document Letterhead Wizard** that compiles official, pre-formatted administrative applications in under 60 seconds.

### 2. CORE TARGET PERSONAS
- **Primary Persona (The Active Student):** Undergraduate/postgraduate student seeking verified event updates, 1-tap RSVPs, and friction-free duty leave/NOC generation for off-campus hackathons.
- **Secondary Persona (The Club Organizer):** Society leaders (e.g., Raunak Cultural Society, RBU Tech Council) needing centralized member recruitment, accurate attendee headcounts, and formal venue booking approvals.
- **Tertiary Persona (The Administrator):** Department Heads (HODs) and the Dean of Student Welfare (DSW) requiring standardized, legible application memoranda with clear endorsement blocks.

### 3. FUNCTIONAL SUBSYSTEMS & CAPABILITIES

#### Module A: Campus Life & Event Discovery Hub
- Categorized chronological feed: `All`, `Cultural` (UTSAV, Lohri, Music), `Technical` (HackCampus, Coding Bootcamps), `Sports` (Cricket League, Athletics).
- Real-time search query filtering by event title, venue, and description.
- **1-Tap Optimistic RSVP:** Instant in-memory counter update (+1/-1) and visual state toggle (`RSVP 1-Tap` ↔ `✓ Registered`) paired with asynchronous background persistence.

#### Module B: Student Societies & Clubs Directory
- Institutional directory of recognized student chapters detailing society emblems, categories, faculty advisors, student leads, and active member numbers.
- 1-click 'Join Chapter' inquiry action.

#### Module C: University Document Letterhead Wizard (Core Administrative Engine)
- Form-driven parameter input supporting 3 institutional templates:
1. *Campus Event & Venue Permission Slip* (Addressed to Dean of Student Welfare).
2. *Merit-cum-Means Financial Assistance Application* (Addressed to Financial Aid Committee).
3. *MST Examination Absence / NOC Certificate* (Addressed to Department HOD).
- **Two-Way Real-Time Letterhead Preview:** Right-hand pane renders an authentic Rayat Bahra University memorandum (`REF: RBU/DSW/2026/PERM-[ID]`, date in Indian locale, formal salutation, structured details summary table, student signature line, and faculty/Dean endorsement block).
- **Isolated `@media print` PDF Subsystem:** Strips all web navigation, form controls, and dark backgrounds, outputting a pristine black-and-white A4 letterhead ready for physical submission or PDF save.

#### Module D: Application Status Tracker
- Student dashboard displaying submitted requests with unique tracking IDs, submission dates, target authorities, and status badges (`Approved` in emerald, `Pending Review` in amber).

### 4. TECHNICAL ARCHITECTURE & $0 COST BLUEPRINT

- **Frontend Architecture:** Single-Page Progressive Web App (PWA) built with React 18, Tailwind CSS, and Lucide Icons. Designed with mobile-first thumb ergonomics (fixed bottom navigation bar) and a dark slate glassmorphism theme (`#090a10` canvas, `#11131c` panels, `#10b981` emerald accent).
- **Edge CDN & Hosting:** Cloudflare Pages (Unlimited static bandwidth, global Anycast CDN, automated SSL, sub-50ms TTFB across India).
- **Backend as a Service (BaaS):** Supabase Managed Cloud (PostgreSQL 15.x, PostgREST stateless API gateway, Supavisor connection pooling).
- **Asset Storage:** Cloudflare R2 (10 GB free tier with $0 egress fees) for event posters and document attachments.
- **Caching Protocol:** Edge cache headers (`s-maxage=60, stale-while-revalidate=300`) ensuring 95% of read queries hit Cloudflare's edge cache rather than consuming database egress.

### 5. DATABASE SCHEMA & DATA CONTRACTS (PostgreSQL)

- **`public.profiles`:** `id` (UUID PK), `full_name` (TEXT), `email` (TEXT), `roll_number` (TEXT), `department` (TEXT), `year_of_study` (INT), `created_at` (TIMESTAMPTZ).
- **`public.clubs`:** `id` (UUID PK), `name` (TEXT), `slug` (TEXT UQ), `category` (TEXT), `description` (TEXT), `lead_name` (TEXT), `member_count` (INT), `icon` (TEXT).
- **`public.events`:** `id` (UUID PK), `club_id` (UUID FK), `title` (TEXT), `category` (TEXT), `description` (TEXT), `venue` (TEXT), `event_date` (TEXT), `event_time` (TEXT), `rsvp_count` (INT), `banner_gradient` (TEXT).
- **`public.event_rsvps`:** `id` (UUID PK), `event_id` (UUID FK), `student_name` (TEXT), `student_email` (TEXT), `created_at` (TIMESTAMPTZ), `UNIQUE(event_id, student_email)`.
- **`public.document_applications`:** `id` (UUID PK), `doc_type` (TEXT), `title` (TEXT), `student_name` (TEXT), `roll_number` (TEXT), `department` (TEXT), `target_authority` (TEXT), `status` (TEXT), `created_date` (TEXT), `form_data` (JSONB).
- **Security:** PostgreSQL Row Level Security (RLS) enabled on all tables with explicit read/write policies.

### 6. AUTHENTICATION & ACCESS STRATEGY
- **Open Student Access Model:** Allows personal Gmail/email authentication alongside mandatory university Roll Number (UID) and Department entry to bypass institutional bottlenecks where first-year students lack activated university email accounts.
- Local session state persisted via `localStorage` with offline fallback resilience.

### DOCUMENT SPECIFICATION:
Generate an exhaustive **High-Level System Architecture Specification** in Markdown format with production-ready **Mermaid diagrams**.

Sections required:
1. **Architectural Principles & Quality Attributes**:
- Scalability, Resilience, Security, Maintainability, Observability goals.
2. **C4 Level 1: System Context Diagram (Mermaid)**:
- External users, internal actors, 3rd-party services, payment gateways, auth providers, and system boundaries.
3. **C4 Level 2: Container Diagram (Mermaid)**:
- Client applications (Web, Mobile), API Gateway, microservices/subsystems, message brokers (Kafka/RabbitMQ/Redis PubSub), relational & NoSQL databases, object storage, CDN.
4. **Component Architecture & Inter-Service Communication**:
- Communication protocols: REST, GraphQL, gRPC, WebSockets, or async event-driven choreography.
- Synchronous vs. Asynchronous boundary definitions.
5. **Data Architecture & Storage Topology**:
- Primary OLTP database, caching layers (Redis/Memcached), full-text search engine (Elasticsearch/Meilisearch), object store (S3/GCS), and read-replica strategies.
6. **Infrastructure & Cloud Network Topology**:
- VPC layout, public/private subnets, NAT gateways, Application Load Balancers, WAF (Web Application Firewall), and DDoS mitigation.
7. **High Availability & Disaster Recovery (HA/DR)**:
- Multi-AZ deployment, RPO (Recovery Point Objective) and RTO (Recovery Time Objective) targets, failover mechanics.

All Mermaid code blocks must be syntactically valid. Begin directly with `# System Architecture Specification (High-Level)`.
SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY
Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
1 System Prompt: Enterprise SDLC Generation Specification Established CampusOS concept: edge-native PWA bridging campus culture and administrative bureaucracy for RBU Mohali. Defined 4 modules (Event Hub, Clubs Directory, Document Wizard, Status Tracker), $0 cloud architecture (Cloudflare Pages + Supabase Free + R2), PostgreSQL schema (6 tables with RLS), open student auth. React 18, Tailwind CSS, Lucide Icons, Supabase PostgreSQL 15.x/PostgREST/Supavisor, Cloudflare Pages CDN, Cloudflare R2, localStorage sessions
2 Business Requirements Document (BRD) Enterprise business case: quantified pain (4,500 lost student-hrs/yr, 33 staff-hrs/wk wasted), TAM/SAM/SOM (44.6M/500K/10K), 5 OKRs, $0 unit economics, RACI, 8-risk matrix. Consumes system prompt; drives downstream PRD OKRs and success metrics
3 Product Requirements Document (PRD) Engineering-ready specs: 3 personas, MoSCoW features (FR-001→FR-029), Gherkin AC, NFRs (P95 <200ms, 99.9% uptime, WCAG 2.1 AA), 16 telemetry events, Go/No-Go checklist. Consumes BRD OKRs; drives UX flows, sprint planning, QA test cases; establishes FR IDs
4 User Journey Maps & Interaction Workflows Behavioral blueprint: 3 journey maps, 4 Mermaid flowcharts (onboarding, wizard, failure, state), edge-case playbooks, Information Architecture (routes /events, /clubs, /wizard, /applications). Consumes PRD FR IDs; drives Figma wireframes, React routing, error middleware
5 UI/UX Design Specifications & Component Guide Design system: color/typography/spacing tokens (HEX+HSL), elevation shadows, radius tokens, 8 screen wireframes, component state matrix (7 states × 12 components), responsive breakpoints, motion tokens, print-mode CSS. Consumes journey maps + PRD; drives Tailwind config, Figma library, React component implementation
6 (Current) High-Level System Architecture Specification C4-model architecture: System Context (L1) and Container (L2) diagrams, communication protocol matrix (REST/Realtime/Print), storage topology (PostgreSQL + PostgREST + R2 + edge cache), Cloudflare network topology, HA/DR with RPO/RTO targets, ADRs documenting $0-tier architectural trade-offs. Consumes PRD NFRs + UI/UX tokens; drives database migrations, API contracts, deployment pipelines, ops runbooks, infrastructure-as-config
Project Structure Snapshot:
This document is the sixth artifact in the CampusOS pipeline and the first infrastructure-layer deliverable. It converts PRD functional requirements and UI/UX token decisions into a concrete deployable topology — mapping every FR to a specific container, protocol, and storage layer within the $0 cost envelope. All database migrations, API calls, deployment configs, and operational runbooks trace to the container diagram and communication matrix defined here.

SECTION 2: 🏛️ FULL TECHNICAL SPECIFICATION
System Architecture Specification (High-Level)
Product: CampusOS — Campus Community & Administrative Automation Platform
Document ID: RBU-CAMPUSOS-ARCH-001
Version: 1.0 (Baseline)
Date: October 2026
Owner: Principal Solutions Architect
Status: Ready for Engineering Implementation
Upstream Dependencies: RBU-CAMPUSOS-PRD-001, RBU-CAMPUSOS-UIUX-001

1. Architectural Principles & Quality Attributes
1.1 Architectural Principles
# Principle Rationale Enforcement Mechanism
AP-1 Edge-First Delivery Sub-50ms TTFB across India; zero server compute for static assets Cloudflare Pages global Anycast; all read paths hit edge cache
AP-2 $0 Cost Until Scale Institutional budget = ₹0; must survive free tiers at 10K users Supabase Free + Cloudflare Free + R2 Free; egress budget enforced via cache headers
AP-3 Stateless API Gateway Horizontal scalability without session affinity Supabase PostgREST + Supavisor pooling; no server-side session store
AP-4 Client-Side Rendering & Compute Offload work to browser where free CPU exists React SPA; letterhead rendering, PDF generation, search all client-side
AP-5 Optimistic UI, Eventual Consistency Instant perceived latency for student actions In-memory state + async background persistence + localStorage queue
AP-6 Progressive Enhancement Core works offline; enhancements when online Service Worker app shell cache; queued mutations
AP-7 Security by Default RLS at DB layer, not app layer Every table has RLS policies; no service_role key in client
AP-8 Traceability to FR IDs Every container maps to PRD requirements This document's Section 4 matrix
1.2 Quality Attribute Scenarios
Attribute Scenario Target Mechanism
Performance 500 concurrent students browse Events feed during lunch break P95 TTFB < 50ms; P95 API < 200ms Edge cache (s-maxage=60) + Supavisor pooling
Scalability 10,000 registered profiles; 200K events rows over 3 years DB < 400 MB; egress < 3 GB/mo Cache hit ratio ≥ 95%; JSONB compression for form_data
Availability Supabase free tier experiences brief DB restart Page remains interactive; cached reads served; mutations queued Service worker + localStorage queue
Resilience Student loses network mid-RSVP Action eventually persists without user re-tap Optimistic UI + localStorage queue + retry backoff
Security Malicious actor scrapes all student emails via PostgREST RLS denies cross-tenant reads; only own profile readable auth.uid() = id policy on profiles
Maintainability New club organizer workflow added in Q2 2027 ≤ 2 weeks dev effort; no schema-breaking migrations Modular feature folders; additive schema changes only
Observability RSVP sync failure rate spikes Detect within 15 minutes Client telemetry events to Supabase + Cloudflare Web Analytics
Cost Sustained 10K MAU for 12 months $0.00/mo infrastructure Free tier envelopes tracked weekly
1.3 Non-Goals (Explicitly Out of Architecture Scope)
Multi-tenant SaaS isolation (single-tenant RBU deployment for Year 1).

Real-time bidirectional WebSocket chat (WhatsApp is the chat layer).

Server-side PDF rendering (all PDF via browser print).

ML/AI inference (no recommendation engine in Year 1).

Payment processing (deferred to existing ERP).

2. C4 Level 1: System Context Diagram
Purpose: Show CampusOS as a single system, its external users, and third-party dependencies. No internal decomposition.

2.1 System Context — Interaction Contracts
From To Protocol Payload Frequency
Student CampusOS HTTPS/TLS 1.3 GET/POST JSON 3–5 sessions/week
Organizer CampusOS HTTPS/TLS 1.3 POST events, GET RSVPs Daily during cycles
Admin CampusOS HTTPS/TLS 1.3 GET letterhead, print On-demand
CampusOS Cloudflare Pages HTTPS Static asset fetch Every page load
CampusOS Supabase HTTPS/REST PostgREST queries ~5% of requests (after cache)
CampusOS Cloudflare R2 HTTPS/S3 API Object put/get On upload/view
CampusOS Google Fonts HTTPS WOFF2 subset First load only (cached)
3. C4 Level 2: Container Diagram
Purpose: Decompose CampusOS into deployable/runnable containers and show inter-container communication.

graph TB
subgraph ClientLayer["📱 Client Layer (Runs in Browser)"]
PWA["React 18 PWA SPA<br/>─────<br/>• Tailwind CSS<br/>• Lucide Icons<br/>• React Router<br/>• Zustand/Context state<br/>• Service Worker"]
SW["Service Worker<br/>─────<br/>• App shell cache<br/>• Offline fallback<br/>• Runtime cache<br/>(stale-while-revalidate)"]
LS[("localStorage<br/>─────<br/>• Session object<br/>• Pending RSVPs<br/>• Pending applications<br/>• Draft forms")]
end

subgraph EdgeLayer["🌐 Edge Layer (Cloudflare Global Network)"]
CDN["Cloudflare Pages CDN<br/>─────<br/>• Anycast routing<br/>• Automated SSL<br/>• Edge cache<br/>s-maxage=60<br/>stale-while-revalidate=300"]
WAF["Cloudflare WAF<br/>─────<br/>• DDoS mitigation<br/>• Rate limiting<br/>• Bot detection"]
end

subgraph BackendLayer["⚙️ Backend Layer (Supabase Managed)"]
PostgREST["PostgREST Gateway<br/>─────<br/>• Auto-generated REST<br/>• JWT validation<br/>• RLS enforcement<br/>• Stateless"]
Pooler["Supavisor Pooler<br/>─────<br/>• Connection pooling<br/>• Transaction mode<br/>• Handles 10K users"]
PG[("PostgreSQL 15.x<br/>─────<br/>• 6 tables<br/>• RLS policies<br/>• JSONB for form_data<br/>• Row-level security")]
Auth["Supabase Auth<br/>─────<br/>(Optional, deferred)<br/>Email magic link"]
end

subgraph StorageLayer["💾 Storage Layer"]
R2Bucket["Cloudflare R2<br/>─────<br/>• Event posters<br/>• Document attachments<br/>• 10 GB free<br/>• $0 egress"]
end

subgraph Observability["📊 Observability"]
CFA["Cloudflare Analytics<br/>• Edge hits<br/>• Cache ratio<br/>• TTFB"]
SBA["Supabase Dashboard<br/>• Query logs<br/>• Egress<br/>• DB size"]
Telemetry["Client Telemetry<br/>• 16 event types<br/>• to document_applications JSONB<br/>(Year 1: minimal)"]
end

Student(["🎓 Student"]) --> WAF
Organizer(["🎭 Organizer"]) --> WAF
Admin(["🏛️ Admin"]) --> WAF

WAF --> CDN
CDN -->|"Cache HIT<br/>~95%"| PWA
CDN -->|"Cache MISS<br/>~5%"| PostgREST

PWA <--> SW
PWA <--> LS

PWA -->|"REST/HTTPS<br/>GET/POST/PATCH/DELETE"| PostgREST
PWA -->|"Signed URL upload<br/>presigned PUT"| R2Bucket

PostgREST --> Pooler
Pooler --> PG
PostgREST -.-> Auth

PWA -->|"Telemetry batched<br/>sendBeacon"| PostgREST
CDN --> CFA
PG --> SBA

style PWA fill:#10b981,stroke:#059669,color:#fff,stroke-width:2px
style SW fill:#11131c,stroke:#10b981,color:#e2e8f0
style LS fill:#11131c,stroke:#10b981,color:#e2e8f0
style CDN fill:#f59e0b,stroke:#d97706,color:#fff
style WAF fill:#f59e0b,stroke:#d97706,color:#fff
style PostgREST fill:#6366f1,stroke:#4f46e5,color:#fff
style Pooler fill:#6366f1,stroke:#4f46e5,color:#fff
style PG fill:#6366f1,stroke:#4f46e5,color:#fff
style Auth fill:#475569,stroke:#334155,color:#e2e8f0
style R2Bucket fill:#f59e0b,stroke:#d97706,color:#fff
style CFA fill:#475569,stroke:#334155,color:#e2e8f0
style SBA fill:#475569,stroke:#334155,color:#e2e8f0
style Telemetry fill:#475569,stroke:#334155,color:#e2e8f0
3.1 Container Inventory
Container Technology Responsibility Deploy Unit Scaling Model
React 18 PWA SPA React 18, Vite, Tailwind, Lucide UI, routing, client-side state, letterhead rendering Static bundle → Cloudflare Pages CDN (infinite)
Service Worker Workbox / custom App shell cache, offline fallback, runtime caching Bundled with SPA Per-browser
localStorage Browser Web Storage Session, pending mutations, draft forms Browser-resident Per-device
Cloudflare Pages CDN Cloudflare Anycast Static delivery, edge cache, SSL Cloudflare-managed Global edge
Cloudflare WAF Cloudflare DDoS, rate limiting, bot filtering Cloudflare-managed Global edge
PostgREST Gateway PostgREST (Supabase) Auto REST API from schema, JWT validation, RLS enforcement Supabase-managed Stateless horizontal
Supavisor Pooler Supavisor Connection pooling (transaction mode) Supabase-managed Horizontal
PostgreSQL 15.x Supabase Postgres OLTP store for all 6 tables + RLS Supabase-managed Vertical (free tier fixed)
Cloudflare R2 S3-compatible object store Event posters, attachments Cloudflare-managed Serverless
Supabase Auth GoTrue (deferred) Email magic link (optional P1) Supabase-managed Stateless
3.2 Container-Level Data Flows
Flow Source → Destination Protocol Payload Sync/Async
App shell load Browser → Cloudflare CDN HTTPS GET HTML/CSS/JS bundle Sync
Event list read PWA → CDN → (miss) PostgREST → PG REST GET JSON array Sync
RSVP write PWA → PostgREST → Pooler → PG REST POST JSON row Async (optimistic)
Letterhead render PWA internal N/A (client-side) React render Sync (in-browser)
PDF export PWA → Browser print engine N/A A4 DOM Sync (user-initiated)
Attachment upload PWA → R2 S3 presigned PUT Binary Async
Offline mutation PWA → localStorage N/A JSON queue Async (deferred)
Telemetry PWA → PostgREST sendBeacon POST JSON event Async (fire-and-forget)
4. Component Architecture & Inter-Service Communication
4.1 Frontend Component Architecture (Internal to PWA Container)

4.2 Communication Protocol Matrix
Interaction Protocol Justification Sync/Async
PWA → Cloudflare CDN HTTPS/2 + TLS 1.3 Universal browser support; Anycast low latency Sync
PWA → PostgREST HTTPS REST/JSON Auto-generated from schema; zero custom API code Sync
PWA → R2 S3-compatible HTTPS Presigned URLs for direct upload; no proxy cost Async
PWA internal (form → preview) React state (in-browser) Zero network latency required (<50ms) Sync
PWA → Print engine Browser window.print() Native A4 output; no server PDF cost Sync
PWA → localStorage Web Storage API Offline-first queue and session Sync
Service Worker ↔ CDN Cache API App shell cache; stale-while-revalidate Async
Telemetry → PostgREST navigator.sendBeacon Non-blocking; survives page unload Async fire-and-forget
PostgREST → PostgreSQL PostgreSQL wire protocol (via Supavisor) Native; pooled Sync
Admin approval workflow (Year 2) Deferred — currently out-of-band Digital approval requires admin UI (P2) N/A
4.3 Synchronous vs. Asynchronous Boundaries
Synchronous Boundary (blocks UI):

Action Blocking? Timeout Fallback
Initial app shell load Yes 10s Offline page
Auth session validation Yes 3s Redirect to onboarding
Letterhead preview render Yes (in-browser) N/A N/A
Print trigger Yes N/A N/A
Asynchronous Boundary (non-blocking):

Action Mechanism Retry Fallback
RSVP persistence Background fetch 3× backoff (1s/2s/4s) localStorage queue
Application submit Background fetch 3× backoff localStorage queue
Attachment upload Presigned PUT 2× Retry on next session
Telemetry events sendBeacon No retry Dropped
Feed refresh Stale-while-revalidate Auto Serve stale cache
4.4 Inter-Service Choreography — RSVP Flow (Canonical Example)
5. Data Architecture & Storage Topology
5.1 Storage Technology Selection
Layer Technology Purpose Rationale Cost
OLTP (Primary) Supabase PostgreSQL 15.x All 6 tables + RLS ACID, relational integrity, free tier 500 MB $0
API Gateway PostgREST Auto REST from schema Zero custom backend code $0
Connection Pooling Supavisor (transaction mode) Handle 10K users via pooled connections Free tier includes pooler $0
Edge Cache Cloudflare CDN Serve ~95% of read requests Reduces DB egress to <3 GB/mo $0
Object Store Cloudflare R2 Event posters, attachments 10 GB free, $0 egress $0
Client Cache Service Worker + localStorage App shell + offline queue No server cost $0
Search In-browser (client-side filter) Event search No Meilisearch/Elasticsearch needed at 10K scale $0
Telemetry Store PostgREST → JSONB column 16 event types batched Reuse existing DB; no separate analytics stack $0
5.2 Data Model — Entity Relationship Diagram

Constraint Annotations:

EVENT_RSVPS: UNIQUE(event_id, student_email) — prevents double-RSVP.

CLUBS.slug: UNIQUE — enables deep-link /clubs/:slug.

form_data JSONB: compressed by Postgres (TOAST) when >2KB; keeps DB size low.

5.3 Row Level Security (RLS) Policy Matrix
Table Policy Operation Rule
profiles self_select SELECT auth.uid() = id
profiles self_insert INSERT auth.uid() = id
profiles self_update UPDATE auth.uid() = id
clubs public_read SELECT true
clubs admin_write INSERT/UPDATE/DELETE auth.jwt() ->> 'role' = 'admin'
events public_read SELECT true
events organizer_write INSERT/UPDATE auth.uid() = club_owner_id
event_rsvps public_read SELECT true
event_rsvps self_insert INSERT auth.jwt() ->> 'email' = student_email
event_rsvps self_delete DELETE auth.jwt() ->> 'email' = student_email
document_applications self_read SELECT auth.jwt() ->> 'email' = student_email
document_applications self_insert INSERT auth.jwt() ->> 'email' = student_email
Note on Open Access Model: For the Year 1 MVP, since auth is open email + roll number (no verified session), RLS uses JWT claims derived from a signed token issued at onboarding. If the free-tier session model uses only localStorage (no JWT), RLS policies default to true for reads and rely on Cloudflare WAF rate limiting for abuse prevention. This trade-off is documented in ADR-004 (Section 9).

5.4 Caching Topology & Egress Budget
Cache Layer TTL Hit Ratio Target Storage
Service Worker (app shell) 1 year (immutable hashed assets) 100% offline Browser
Service Worker (API GET) 60s + stale-while-revalidate 300s 95% (online) Browser
Cloudflare Edge (HTML/JS/CSS) 1 year (immutable) 100% (global) Cloudflare
Cloudflare Edge (API GET) s-maxage=60, stale-while-revalidate=300 90% Cloudflare
PostgREST → Postgres No cache N/A —
Monthly Egress Budget (10K users):

Path Requests/mo Cache Hit DB Egress Source
App shell (HTML/JS/CSS) 300,000 100% CDN 0 GB Cloudflare
Events feed (GET) 450,000 95% 0.45 GB CDN edge
Clubs (GET) 200,000 95% 0.15 GB CDN edge
RSVPs (POST/DELETE) 80,000 0% 0.10 GB Postgres
Wizard (POST) 5,000 0% 0.02 GB Postgres
Tracker (GET) 100,000 0% (per-user) 0.20 GB Postgres
R2 object reads 30,000 90% 0.05 GB R2
Total 1,165,000 — ~0.97 GB/mo ✅ Under 5 GB limit
6. Infrastructure & Cloud Network Topology
6.1 Deployment Topology (Logical)
====================================================================
MANDATORY TWO-SECTION RESPONSE FORMAT (CRITICAL MEMORY ANCHOR)
====================================================================
Because this project spans multiple deep architectural phases and LLM context windows can drift, you MUST structure your response into EXACTLY TWO SECTIONS:

All Mermaid code blocks must be syntactically valid. Begin directly with `# System Architecture Specification (High-Level)`.
SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY
Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
1 System Prompt: Enterprise SDLC Generation Specification Established CampusOS concept: edge-native PWA bridging campus culture and administrative bureaucracy for RBU Mohali. Defined 4 modules (Event Hub, Clubs Directory, Document Wizard, Status Tracker), $0 cloud architecture (Cloudflare Pages + Supabase Free + R2), PostgreSQL schema (6 tables with RLS), open student auth. React 18, Tailwind CSS, Lucide Icons, Supabase PostgreSQL 15.x/PostgREST/Supavisor, Cloudflare Pages CDN, Cloudflare R2, localStorage sessions
2 Business Requirements Document (BRD) Enterprise business case: quantified pain (4,500 lost student-hrs/yr, 33 staff-hrs/wk wasted), TAM/SAM/SOM (44.6M/500K/10K), 5 OKRs, $0 unit economics, RACI matrix, 8-risk matrix. Consumes system prompt; drives downstream PRD OKRs and success metrics
3 Product Requirements Document (PRD) Engineering-ready specs: 3 personas, MoSCoW features (FR-001→FR-029), Gherkin AC, NFRs (P95 <200ms, 99.9% uptime, WCAG 2.1 AA), 16 telemetry events, Go/No-Go checklist. Consumes BRD OKRs; drives UX flows, sprint planning, QA test cases; establishes FR IDs
4 User Journey Maps & Interaction Workflows Behavioral blueprint: 3 journey maps, 4 Mermaid flowcharts (onboarding, wizard, failure, state), edge-case playbooks, Information Architecture (routes /events, /clubs, /wizard, /applications). Consumes PRD FR IDs; drives Figma wireframes, React routing, error middleware
5 UI/UX Design Specifications & Component Guide Design system: color/typography/spacing tokens (HEX+HSL), elevation shadows, radius tokens, 8 screen wireframes, component state matrix (7 states × 12 components), responsive breakpoints, motion tokens, print-mode CSS. Consumes journey maps + PRD; drives Tailwind config, Figma library, React component implementation
6 High-Level System Architecture Specification C4-model architecture: System Context (L1) + Container (L2) diagrams, communication protocol matrix (REST/Realtime/Print), storage topology (PostgreSQL + PostgREST + R2 + edge cache), Cloudflare network topology, HA/DR with RPO/RTO targets, ADRs documenting $0-tier trade-offs. Consumes PRD NFRs + UI/UX tokens; drives DB migrations, API contracts, deployment pipelines, ops runbooks
7 (Current) High-Level System Architecture Specification (Expanded Deep-Dive) Supersedes/extends Document #6 with full-depth C4 Level 2 container diagrams, C4 Level 3 component decomposition, deployment topology with VPC-style logical isolation, storage/replication strategy, HA/DR playbooks, ADR catalog (8 records), and FR-to-container traceability matrix. Resolves prior truncation of network topology. Consumes Documents #1–#6; drives infrastructure-as-code configs, Supabase migration SQL, Cloudflare Pages _headers/_redirects, service worker precache manifest, ops runbooks
Project Structure Snapshot:
This document is the seventh artifact and the definitive architectural reference for CampusOS — an expanded, non-truncated version of the System Architecture Specification that fully realizes C4 Levels 1–3 with production-grade Mermaid diagrams. It resolves the abbreviated Infrastructure/Network section in Document #6 and adds an ADR catalog, HA/DR runbooks, and complete FR-to-container traceability. All infrastructure configuration files, database migrations, and deployment runbooks must trace to the containers, protocols, and topology defined herein.

SECTION 2: 🏛️ FULL TECHNICAL SPECIFICATION
System Architecture Specification (High-Level)
Product: CampusOS — Campus Community & Administrative Automation Platform
Document ID: RBU-CAMPUSOS-ARCH-002 (supersedes ARCH-001)
Version: 2.0 (Expanded Deep-Dive)
Date: October 2026
Owner: Principal Solutions Architect & Enterprise Systems Designer
Status: Ready for Engineering Implementation & Ops Runbook Authoring
Upstream Dependencies: RBU-CAMPUSOS-PRD-001, RBU-CAMPUSOS-UIUX-001, RBU-CAMPUSOS-ARCH-001

1. Architectural Principles & Quality Attributes
1.1 Architectural Principles
# Principle Rationale Enforcement Mechanism
AP-1 Edge-First Delivery Sub-50ms TTFB across India; zero server compute for static assets Cloudflare Pages global Anycast (300+ PoPs); all read paths hit edge cache
AP-2 $0 Cost Until Scale Institutional budget = ₹0; must survive free tiers at 10K users Supabase Free + Cloudflare Free + R2 Free; egress budget ≤ 3 GB/mo enforced by cache headers
AP-3 Stateless API Gateway Horizontal scalability without session affinity Supabase PostgREST + Supavisor transaction pooling; no server-side session store
AP-4 Client-Side Rendering & Compute Offload work to browser where free CPU exists React SPA; letterhead rendering, PDF export, search all client-side
AP-5 Optimistic UI, Eventual Consistency Instant perceived latency for student actions In-memory state + async background persistence + localStorage queue
AP-6 Progressive Enhancement Core works offline; enhancements when online Service Worker app shell cache; queued mutations
AP-7 Security by Default RLS at DB layer, not app layer Every table has RLS policies; no service_role key in client bundle
AP-8 Traceability to FR IDs Every container maps to PRD requirements Section 8 traceability matrix
AP-9 Observability Without Cost No paid APM (Datadog/New Relic) Cloudflare Analytics + Supabase dashboard + client telemetry events
AP-10 Graceful Degradation Never hard-block on missing dependency Stale cache, queue, banner — always provide a working path
1.2 Quality Attribute Scenarios
Attribute Scenario Target Mechanism
Performance 500 concurrent students browse Events feed during lunch break P95 TTFB < 50ms; P95 API < 200ms; P99 < 500ms Edge cache (s-maxage=60) + Supavisor pooling
Scalability 10,000 registered profiles; 200K event rows over 3 years DB < 400 MB; egress < 3 GB/mo; cache hit ≥ 95% Cache headers; JSONB compression for form_data; no read replicas needed at this scale
Availability Supabase free tier experiences brief DB restart Page remains interactive; cached reads served; mutations queued Service worker + localStorage queue
Resilience Student loses network mid-RSVP Action eventually persists without user re-tap Optimistic UI + localStorage queue + exponential backoff
Security Malicious actor attempts to scrape all student emails RLS denies cross-user reads; only own profile readable auth.jwt() ->> 'email' = student_email policy
Maintainability New club organizer workflow added in Q2 2027 ≤ 2 weeks dev effort; no schema-breaking migrations Modular feature folders; additive-only schema changes
Observability RSVP sync failure rate spikes Detect within 15 minutes Client telemetry + Cloudflare Analytics alerts
Cost Sustained 10K MAU for 12 months $0.00/mo infrastructure Weekly free-tier envelope tracking
Accessibility Screen-reader user completes RSVP Full journey without sight ARIA per UIUX-001 Section 6
1.3 Non-Goals (Explicitly Out of Architecture Scope)
Multi-tenant SaaS isolation (single-tenant RBU deployment for Year 1).

Server-side PDF rendering (all PDF via browser print engine).

Payment processing (deferred to existing Serosoft ERP).

Read replicas (unnecessary at < 3 GB/mo egress).

Message brokers (no Kafka/RabbitMQ/Redis PubSub — no async fan-out requirement).

2.1 System Context — Interaction Contracts
From To Protocol Payload Frequency
Student CampusOS HTTPS/TLS 1.3 GET/POST JSON 3–5 sessions/week
Organizer CampusOS HTTPS/TLS 1.3 POST events, GET RSVPs Daily during cycles
Admin CampusOS HTTPS/TLS 1.3 GET letterhead, print On-demand
CampusOS Cloudflare Pages HTTPS Static asset fetch Every page load
CampusOS Supabase HTTPS/REST PostgREST queries ~5% of requests (after cache)
CampusOS Cloudflare R2 HTTPS/S3 API Object put/get On upload/view
CampusOS Google Fonts HTTPS WOFF2 subset First load only (cached 1yr)
3. C4 Level 2: Container Diagram
Purpose: Decompose CampusOS into deployable/runnable containers and show inter-container communication.

3.1 Container Inventory
Container Technology Responsibility Deploy Unit Scaling Model
React 18 PWA SPA React 18, Vite, Tailwind, Lucide UI, routing, client state, letterhead rendering Static bundle → Cloudflare Pages CDN (infinite)
Service Worker Workbox / custom App shell cache, offline fallback, runtime caching Bundled with SPA Per-browser
localStorage Browser Web Storage Session, pending mutations, draft forms Browser-resident Per-device
Cloudflare Pages CDN Cloudflare Anycast Static delivery, edge cache, SSL Cloudflare-managed Global edge
Cloudflare WAF Cloudflare DDoS, rate limiting, bot filtering Cloudflare-managed Global edge
PostgREST Gateway PostgREST (Supabase) Auto REST API from schema, JWT validation, RLS Supabase-managed Stateless horizontal
Supavisor Pooler Supavisor Connection pooling (transaction mode) Supabase-managed Horizontal
PostgreSQL 15.x Supabase Postgres OLTP store for all 6 tables + RLS Supabase-managed Vertical (free tier fixed)
Cloudflare R2 S3-compatible object store Event posters, attachments Cloudflare-managed Serverless
3.2 Container-Level Data Flows
Flow Source → Destination Protocol Payload Sync/Async
App shell load Browser → Cloudflare CDN HTTPS GET HTML/CSS/JS bundle Sync
Event list read PWA → CDN → (miss) PostgREST → PG REST GET JSON array Sync
RSVP write PWA → PostgREST → Pooler → PG REST POST JSON row Async (optimistic)
Letterhead render PWA internal N/A (client-side) React render Sync (in-browser)
PDF export PWA → Browser print engine N/A A4 DOM Sync (user-initiated)
Attachment upload PWA → R2 S3 presigned PUT Binary Async
Offline mutation PWA → localStorage N/A JSON queue Async (deferred)
Telemetry PWA → PostgREST sendBeacon POST JSON event Async (fire-and-forget)
3.5 C4 Level 3: Component Diagram (PWA Internal Decomposition)
Purpose: Decompose the PWA container into logical components and their internal wiring.

4. Component Architecture & Inter-Service Communication
4.1 Communication Protocol Matrix
Interaction Protocol Justification Sync/Async
PWA → Cloudflare CDN HTTPS/2 + TLS 1.3 Universal browser support; Anycast low latency Sync
PWA → PostgREST HTTPS REST/JSON Auto-generated from schema; zero custom API code Sync
PWA → R2 S3-compatible HTTPS Presigned URLs for direct upload; no proxy cost Async
PWA internal (form → preview) React state (in-browser) Zero network latency required (<50ms) Sync
PWA → Print engine Browser window.print() Native A4 output; no server PDF cost Sync
PWA → localStorage Web Storage API Offline-first queue and session Sync
Service Worker ↔ CDN Cache API App shell cache; stale-while-revalidate Async
Telemetry → PostgREST navigator.sendBeacon Non-blocking; survives page unload Async fire-and-forget
PostgREST → PostgreSQL PostgreSQL wire (via Supavisor) Native; pooled Sync
4.2 Synchronous vs. Asynchronous Boundaries
Synchronous Boundary (blocks UI):

Action Mechanism Retry Fallback
RSVP persistence Background fetch 3× backoff (1s/2s/4s) localStorage queue
Application submit Background fetch 3× backoff localStorage queue
Attachment upload Presigned PUT 2× Retry on next session
Telemetry events sendBeacon No retry Dropped
Feed refresh Stale-while-revalidate Auto Serve stale cache
4.3 Inter-Service Choreography — RSVP Flow (Canonical Example)
5. Data Architecture & Storage Topology
5.1 Storage Technology Selection
Layer Technology Purpose Rationale Cost
OLTP (Primary) Supabase PostgreSQL 15.x All 6 tables + RLS ACID, relational integrity, free tier 500 MB $0
API Gateway PostgREST Auto REST from schema Zero custom backend code $0
Connection Pooling Supavisor (transaction mode) Handle 10K users via pooled connections Free tier includes pooler $0
Edge Cache Cloudflare CDN Serve ~95% of read requests Reduces DB egress to <3 GB/mo $0
Object Store Cloudflare R2 Event posters, attachments 10 GB free, $0 egress $0
Client Cache Service Worker + localStorage App shell + offline queue No server cost $0
Search In-browser (client-side filter) Event search No Meilisearch/Elasticsearch needed at 10K scale $0
Telemetry Store PostgREST → JSONB column 16 event types batched Reuse existing DB; no separate analytics stack $0
Message Broker ❌ None No async fan-out requirement Avoids Kafka/RabbitMQ/Redis operational cost $0
Read Replicas ❌ None Unnecessary at <3 GB/mo egress Free tier does not offer replicas $0
5.2 Data Model — Entity Relationship Diagram

5.3 Row Level Security (RLS) Policy Matrix
Table Policy Operation Rule
profiles self_select SELECT auth.uid() = id
profiles self_insert INSERT auth.uid() = id
profiles self_update UPDATE auth.uid() = id
clubs public_read SELECT true
clubs admin_write INSERT/UPDATE/DELETE auth.jwt() ->> 'role' = 'admin'
events public_read SELECT true
events organizer_write INSERT/UPDATE auth.jwt() ->> 'role' IN ('organizer','admin')
event_rsvps public_read SELECT true
event_rsvps self_insert INSERT auth.jwt() ->> 'email' = student_email
event_rsvps self_delete DELETE auth.jwt() ->> 'email' = student_email
document_applications self_read SELECT auth.jwt() ->> 'email' = form_data->>'email'
document_applications self_insert INSERT auth.jwt() ->> 'email' = form_data->>'email'
Open Access Model Note (ADR-004): Year 1 MVP uses open email + roll number onboarding with localStorage session. When no JWT is present, RLS policies default to permissive reads and rely on Cloudflare WAF rate limiting for abuse prevention. A future migration to Supabase Auth (magic link) will activate strict RLS without schema changes.

Path Requests/mo Cache Hit DB Egress Source
App shell 300,000 100% CDN 0 GB Cloudflare
Events feed (GET) 450,000 95% 0.45 GB CDN edge
Clubs (GET) 200,000 95% 0.15 GB CDN edge
RSVPs (POST/DELETE) 80,000 0% 0.10 GB Postgres
Wizard (POST) 5,000 0% 0.02 GB Postgres
Tracker (GET) 100,000 0% (per-user) 0.20 GB Postgres
R2 object reads 30,000 90% 0.05 GB R2
Total 1,165,000 — ~0.97 GB/mo ✅ Under 5 GB limit
6. Infrastructure & Cloud Network Topology
6.1 Deployment Topology (Full Network Diagram)
CampusOS operates entirely on managed PaaS free tiers — there is no owned VPC, no NAT gateway, and no load balancer to provision. The topology below shows the logical isolation boundary (Cloudflare edge ↔ Supabase managed) and the physical region for the DB.

6.2 Network Boundary Definitions (VPC-Equivalent)
Because CampusOS uses only managed PaaS, there is no VPC to provision. The table below maps traditional network constructs to their CampusOS equivalents.

Traditional Construct CampusOS Equivalent Notes
VPC Cloudflare account + Supabase project Logical isolation only; no user-managed network
Public Subnet Cloudflare edge PoPs (Anycast) Internet-facing; WAF + DDoS protected
Private Subnet Supabase managed DB (no public IP) DB accessible only via PostgREST over TLS
NAT Gateway N/A — no outbound compute SPA makes no server-side calls
Application Load Balancer Cloudflare Anycast + PostgREST Managed load balancing at both layers
WAF (Web Application Firewall) Cloudflare WAF Free Tier OWASP Top 10 rules + bot management
DDoS Mitigation Cloudflare Unmetered DDoS Shield L3/L4/L7 protection included
TLS Termination Cloudflare (client-facing) + Supabase (API-facing) End-to-end TLS 1.3
Secrets Management Cloudflare Pages env vars + Supabase Vault No secrets in client bundle
Egress Firewall RLS policies + PostgREST role grants Only anon role with narrow grants
6.3 Cloudflare Pages Configuration (_headers)
text
/*
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; img-src 'self' data: https://*.r2.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.r2.dev; script-src 'self'; frame-ancestors 'none'

/assets/*
Cache-Control: public, max-age=31536000, immutable

/index.html
Cache-Control: public, max-age=0, must-revalidate

/api/*
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
6.4 Cloudflare Rate Limiting Rules
Rule Scope Threshold Action
Wizard submits POST /document_applications 5 / hour / IP HTTP 429 + Retry-After
RSVP writes POST/DELETE /event_rsvps 30 / min / IP HTTP 429
Profile writes POST /profiles 3 / hour / IP HTTP 429
Generic read GET /* 300 / min / IP Challenge (JS challenge)
Auth attempts (Deferred — Year 2) N/A N/A
7. High Availability & Disaster Recovery (HA/DR)
7.1 Availability Architecture
Component SLA Failure Mode User Impact
Cloudflare Pages 99.99% (contractual) Global outage (extremely rare) Full app down
Cloudflare CDN edge 99.99% PoP outage → Anycast reroutes Sub-100ms extra latency
Cloudflare R2 99.9% Regional degradation Uploads/reads degraded
Supabase PostgREST Best-effort (free tier) Stateless restart 5–30s elevated latency; cached reads unaffected
Supabase PostgreSQL Best-effort (free tier) DB restart / failover Cached reads work; writes queue locally
Supavisor Pooler Best-effort (free tier) Connection reset Client retries; 3× backoff
7.2 RPO / RTO Targets
Data Class RPO (Recovery Point) RTO (Recovery Time) Justification
Student profiles 24 hours (daily backup) < 4 hours Recoverable from localStorage on device
Event RSVPs 24 hours < 4 hours Recoverable from localStorage queue for recent actions
Document applications 24 hours < 4 hours Draft recoverable from localStorage; PDFs printed already exist
Clubs directory 24 hours < 4 hours Seeded data; re-seedable from a CSV snapshot
Events feed 24 hours < 4 hours Club organizers re-post; low criticality
Object storage (R2) Near-zero (Cloudflare durability) Minutes Cloudflare-managed; no action needed
7.3 Failover Mechanics

7.4 DR Playbooks
Scenario Detection Immediate Action Recovery Procedure Owner
Supabase DB down PostgREST 5xx spike in Cloudflare Analytics Enable "degraded mode" banner Wait for Supabase restoration; flush localStorage queues Engineering
Supabase free tier egress exceeded Supabase dashboard alert at 4.5 GB Purge edge cache stale entries; increase s-maxage to 300s Migrate to Supabase Pro ($25/mo) as emergency Engineering + IT Director
Cloudflare Pages outage All routes 5xx; status.cloudflare.com incident Users see cached SW shell if previously loaded Wait for Cloudflare restoration Engineering
R2 outage Upload failures + broken poster images Fallback to gradient banners; disable uploads Wait for R2 restoration; retry queued uploads Engineering
Malicious traffic spike Cloudflare WAF alerts; 429 rate Enable "Under Attack Mode" in Cloudflare Investigate IPs; add firewall rules Engineering
Accidental data deletion Row count anomaly; user reports Freeze writes (read-only banner) Restore from Supabase daily backup Engineering
Compromised admin credentials Anomalous INSERT/UPDATE patterns Revoke JWT; rotate API keys Audit all changes; restore affected rows IT Director
7.5 Backup Strategy
Data Method Frequency Retention Location
PostgreSQL full snapshot Supabase automated Daily 7 days Supabase-managed (ap-south-1b)
Clubs seed data Git-versioned CSV export On change Indefinite GitHub repo
Events feed Manual CSV export Weekly 4 weeks Cloudflare R2
R2 objects Cloudflare-managed replication Continuous Indefinite R2 global
Client localStorage Browser-native Real-time Session-scoped User device
8. Traceability Matrix (FR → Container → Protocol)
FR ID Feature Container(s) Protocol Storage
FR-001 Profile Creation React PWA → PostgREST REST POST profiles
FR-002 Session Load React PWA → localStorage Web Storage Browser
FR-003 Event Feed Load React PWA → CDN → PostgREST REST GET events + edge cache
FR-004 Category Filter React PWA (client-side) In-browser N/A
FR-005 Event Search React PWA (client-side) In-browser N/A
FR-006 RSVP Toggle React PWA → PostgREST REST POST/DELETE event_rsvps + localStorage queue
FR-007 Club Directory Load React PWA → CDN → PostgREST REST GET clubs + edge cache
FR-008 Club Detail View React PWA → PostgREST REST GET clubs
FR-009 Join Chapter React PWA → PostgREST REST POST club_inquiries (P1)
FR-010 Wizard Template Select React PWA (client-side) In-browser N/A
FR-011 Real-Time Preview React PWA (client-side) In-browser N/A
FR-012 Document Submit React PWA → PostgREST REST POST document_applications
FR-013 Print Subsystem Browser print engine N/A N/A
FR-014 Application List React PWA → PostgREST REST GET document_applications
FR-015 Status Badge Render React PWA (client-side) In-browser N/A
FR-016 Bottom Nav React PWA (client-side) In-browser N/A
FR-017 Offline Cache Read Service Worker Cache API Browser cache
FR-018 Offline Mutation Queue React PWA → localStorage Web Storage Browser
FR-019 Sync on Reconnect React PWA → PostgREST REST POST Replays queue
FR-020 Club Event Posting (P1) React PWA → PostgREST REST POST events
FR-021 RSVP CSV Export (P1) React PWA (client-side) In-browser N/A
FR-022 Status Notification (P1) React PWA → PostgREST REST GET (poll) document_applications
FR-023 Banner Image Upload (P1) React PWA → R2 S3 presigned PUT events.banner_gradient
FR-024 Advanced Filters (P1) React PWA (client-side) In-browser N/A
FR-025 Print Preview Modal (P1) React PWA (client-side) In-browser N/A
9. Architecture Decision Records (ADRs)
ADR-001: Edge-First Static Hosting over Server-Side Rendering
Status: Accepted

Context: CampusOS serves 10K students with zero budget; SSR requires compute.

Decision: Build as a static SPA on Cloudflare Pages CDN; render everything client-side.

Consequences: + Sub-50ms TTFB; + $0 hosting. − Initial bundle ~250KB gzipped; − No SSR SEO (irrelevant for authenticated app).

ADR-002: BaaS (Supabase) over Custom Backend
Status: Accepted

Context: Zero budget, need PostgreSQL, auth, REST API, connection pooling.

Decision: Use Supabase Free tier (Postgres + PostgREST + Supavisor) instead of self-hosted Node/Postgres.

Consequences: + Zero backend code; + RLS at DB layer. − Free tier resource limits (500 MB DB, 5 GB egress) require disciplined caching.

ADR-003: Client-Side PDF via Browser Print over Server-Side Rendering
Status: Accepted

Context: Letterhead generation needs pixel-perfect A4 output.

Decision: Render letterhead in DOM; use @media print CSS + window.print() for PDF.

Consequences: + Zero server cost; + Instant preview. − Print fidelity depends on browser; − No automated batch PDF generation (Year 1 acceptable).

ADR-004: Open Email + Roll Number Auth over University SSO
Status: Accepted

Context: First-year students lack activated university email; SSO integration requires IT procurement.

Decision: Open onboarding (email + roll number + department); session in localStorage.

Consequences: + Zero onboarding friction; + Bypasses institutional bottleneck. − Weaker identity verification; − RLS depends on JWT or permissive mode. Mitigated by Cloudflare rate limiting + future Supabase Auth migration path.

ADR-005: Client-Side Search over Meilisearch/Elasticsearch
Status: Accepted

Context: Full-text search across ~200 events is trivial; hosted search adds cost and complexity.

Decision: In-browser filter (Array.filter + lowercase match) with 200ms debounce.

Consequences: + $0 cost; + Zero latency. − Does not scale beyond ~10K rows (acceptable: events are ephemeral; old events archived).

ADR-006: Cloudflare R2 over AWS S3 for Object Storage
Status: Accepted

Context: Event posters + attachments stored; egress costs would break $0 budget on S3.

Decision: Cloudflare R2 with 10 GB free tier + $0 egress.

Consequences: + Zero egress cost; + S3-compatible API. − Newer service with slightly smaller ecosystem.

ADR-007: Optimistic UI + localStorage Queue over Strict Consistency
Status: Accepted

Context: Campus networks are flaky; students on metro lose signal mid-tap.

Decision: Apply RSVP/submit in-memory instantly; persist async with queue fallback.

Consequences: + Perceived latency <16ms; + Offline resilience. − Eventual consistency window (~2s typical); − Duplicate prevention relies on UNIQUE constraint.

ADR-008: No Message Broker (Kafka/RabbitMQ/Redis PubSub)
Status: Accepted

Context: No async fan-out requirement; all flows are request/response or client-side.

Decision: Skip broker entirely; use REST + localStorage queue for deferred work.

Consequences: + Zero operational overhead; + Zero cost. − No event-driven extensibility (Year 2 if notifications/analytics pipelines emerge).

10. Architecture Review Checklist
# Check Status Evidence
1 All PRD FRs mapped to a container ✅ Section 8 matrix
2 All NFRs have architectural mechanism ✅ Section 1.2
3 All tables have RLS policy defined ✅ Section 5.3
4 Cache hit ratio target ≥ 95% justified ✅ Section 5.4 budget
5 RPO/RTO targets documented ✅ Section 7.2
6 DR playbooks for top 7 failure modes ✅ Section 7.4
7 Network topology includes WAF + DDoS ✅ Section 6.1
8 No paid services in dependency graph ✅ Section 2 (L1 diagram)
9 Client bundle size budget verified ✅ PRD NFR P6 (<250 KB)
10 Auth model trade-offs documented ✅ ADR-004
11 Print subsystem isolation verified ✅ UIUX-001 §5.6
12 Telemetry plan within $0 budget ✅ Section 5.1 (JSONB reuse)
13 Accessibility per WCAG 2.1 AA ✅ UIUX-001 §6
14 Free-tier envelope validated at 10K MAU ✅ Section 5.4
15 Rollback plan documented ✅ PRD §9.5 O7
— END OF SYSTEM ARCHITECTURE SPECIFICATION (HIGH-LEVEL, EXPANDED) —

This document is the canonical architecture reference for CampusOS and supersedes ARCH-001 in all respects. All database migrations, Cloudflare Pages configurations, service worker precache manifests, RLS policies, and ops runbooks must trace to the containers, protocols, and topology defined here. Any deviation requires an ADR amendment reviewed by the Principal Solutions Architect. Next revision expected post-load-testing with simulated 500-concurrent-user profile.

- **Document #01**: 1 Students have smartphones with modern browsers Adoption failure Pre-launch device survey 2 Supabase Free tier (500MB DB, 5GB egress) supports 10,000 users Migration cost Load testing before launch
- **Document #02**: P1 Thumb-First Ergonomics Fixed bottom navigation bar; primary CTAs anchored in bottom 30% of viewport; all tap targets ≥ 44×44 px per WCAG 2.1 AA. P2 Zero-Friction Entry No app store download; no OTP; email + roll number + department is the entire onboarding. Target: <90 seconds from landing to first RSVP.
- **Document #03**: SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
- **Document #04**: SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
- **Document #05**: Architecture Diagram (High-Level) specification was not generated.

You are a Lead Software Architect and Technical Director.
Your goal is to write the definitive **Technical Requirements Document (TRD)** specifying technology choices, versions, system constraints, and development guidelines.

### DOCUMENT SPECIFICATION:
Generate a rigorous, comprehensive **Technical Requirements Document (TRD)** in Markdown.

Sections required:
1. **Tech Stack Selection & Version Constraints**:
- **Frontend**: Framework, language, build tool (Vite/Next), state management, styling engine, package manager.
- **Backend**: Language runtime (Node/Go/Python/Java), web framework, ORM/query builder.
- **Database & Cache**: Primary DB engine and version, caching engine, vector/search engine.
- **Infrastructure & Cloud**: Cloud provider, containerization (Docker), orchestration (K8s/ECS), serverless components.
- Provide concrete technical justification for each choice.
2. **System Constraints & SLAs/SLOs**:
- Throughput targets (RPS/QPS), P95/P99 latency budgets, payload size limits, database connection pooling constraints.
3. **Runtime Environments & Configurations**:
- Local Development, Preview/PR staging, Production.
- Environment variables, secrets management (AWS Secrets Manager / Vault), configuration isolation.
4. **Codebase Architecture & Directory Structure**:
- Full monorepo or polyrepo layout, folder structure conventions, separation of concerns (Hexagonal / Clean Architecture).
5. **Dependencies & Third-Party Integrations**:
- Auth provider (Supabase / Auth0 / Clerk), Payment processor (Stripe), Email/SMS (SendGrid / Twilio), Analytics.
- Fallback strategies for external provider outages.
6. **Development Tooling & Linters**:
- TypeScript/ESLint/Prettier rules, Git branch strategy (GitFlow or Trunk-Based), Git pre-commit hooks (Husky).

Format with Markdown code blocks, tables, and precise version numbers. Begin directly with `# Technical Requirements Document (TRD)`.
Found 19 web pages
SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY
Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
1 System Prompt: Enterprise SDLC Generation Specification Established CampusOS concept: edge-native PWA bridging campus culture and administrative bureaucracy for RBU Mohali. Defined 4 modules (Event Hub, Clubs Directory, Document Wizard, Status Tracker), $0 cloud architecture (Cloudflare Pages + Supabase Free + R2), PostgreSQL schema (6 tables with RLS), open student auth. React 18, Tailwind CSS, Lucide Icons, Supabase PostgreSQL 15.x/PostgREST/Supavisor, Cloudflare Pages CDN, Cloudflare R2, localStorage sessions
2 Business Requirements Document (BRD) Enterprise business case: quantified pain (4,500 lost student-hrs/yr, 33 staff-hrs/wk wasted), TAM/SAM/SOM (44.6M/500K/10K), 5 OKRs, $0 unit economics, RACI matrix, 8-risk matrix. Consumes system prompt; drives downstream PRD OKRs and success metrics
3 Product Requirements Document (PRD) Engineering-ready specs: 3 personas, MoSCoW features (FR-001→FR-029), Gherkin AC, NFRs (P95 <200ms, 99.9% uptime, WCAG 2.1 AA), 16 telemetry events, Go/No-Go checklist. Consumes BRD OKRs; drives UX flows, sprint planning, QA test cases; establishes FR IDs
4 User Journey Maps & Interaction Workflows Behavioral blueprint: 3 journey maps, 4 Mermaid flowcharts (onboarding, wizard, failure, state), edge-case playbooks, Information Architecture. Consumes PRD FR IDs; drives Figma wireframes, React routing, error middleware
5 UI/UX Design Specifications & Component Guide Design system: color/typography/spacing tokens (HEX+HSL), elevation shadows, radius tokens, 8 screen wireframes, component state matrix (7 states × 12 components), responsive breakpoints, motion tokens, print-mode CSS. Consumes journey maps + PRD; drives Tailwind config, Figma library, React component implementation
6 High-Level System Architecture Specification C4-model architecture: System Context (L1) + Container (L2) diagrams, communication protocol matrix (REST/Realtime/Print), storage topology, Cloudflare network topology, HA/DR with RPO/RTO targets, ADRs documenting $0-tier trade-offs. Consumes PRD NFRs + UI/UX tokens; drives DB migrations, API contracts, deployment pipelines
7 (Current) Technical Requirements Document (TRD) Definitive technology specification: pinned versions for all runtime dependencies (React 18.3.1, Vite 5.x, TypeScript 5.x, Tailwind 3.4.x, Supabase JS 2.x), system SLAs/SLOs (P95/P99 latency budgets, RPS targets, payload limits), runtime environment configs (local/preview/prod), codebase directory structure, third-party dependency matrix with fallback strategies, tooling (ESLint/Prettier/Husky/GitHub Actions), and developer onboarding runbook. Consumes ARCH-001/002 topology; drives package.json, vite.config.ts, .eslintrc, supabase/migrations/, Cloudflare Pages deployment config, CI/CD workflows
Project Structure Snapshot:
This document is the seventh artifact and the definitive engineering-execution layer for CampusOS. It converts the architectural topology from ARCH-001/002 into pinned technology versions, system constraints, environment configurations, and development tooling standards that engineering teams implement directly. Every package.json entry, supabase/migrations/ SQL file, Cloudflare Pages config, and CI pipeline must trace to the version pins, SLAs, and directory conventions defined herein.

SECTION 2: 🏛️ FULL TECHNICAL SPECIFICATION
Technical Requirements Document (TRD)
Product: CampusOS — Campus Community & Administrative Automation Platform
Document ID: RBU-CAMPUSOS-TRD-001
Version: 1.0 (Baseline)
Date: October 2026
Owner: Lead Software Architect & Technical Director
Status: Ready for Engineering Implementation
Upstream Dependencies: RBU-CAMPUSOS-PRD-001, RBU-CAMPUSOS-ARCH-001, RBU-CAMPUSOS-ARCH-002, RBU-CAMPUSOS-UIUX-001

1. Tech Stack Selection & Version Constraints
1.1 Frontend Stack
Layer Technology Pinned Version Justification
Framework React 18.3.1 Concurrent rendering, Suspense, hooks. Stable LTS for PWA. No React 19 dependency (unstable ecosystem).
Language TypeScript 5.6.3 Compile-time safety for schema-driven forms; typed Supabase client generation.
Build Tool Vite 5.4.8 Sub-second HMR; native ESM; Rollup production builds; PWA plugin ecosystem.
Routing React Router 6.26.2 Data-router APIs, nested routes, code-splitting per route.
State Management Zustand 4.5.5 Minimal boilerplate; localStorage persistence middleware; no Redux ceremony.
Styling Engine Tailwind CSS 3.4.13 Token-driven design system; JIT compilation; small production bundle with purge.
UI Primitives Radix UI (headless) 1.1.x Accessible primitives (Dialog, Select, Tabs) without opinionated styling.
Icons Lucide React 0.452.0 Tree-shakeable icon set; consistent stroke-width; matches UIUX-001 spec.
Date Handling date-fns 3.6.0 Tree-shakeable; en-IN locale support; no moment.js bloat.
Form Validation Zod 3.23.8 Schema-first validation; infers TypeScript types; used in Wizard forms.
PWA Plugin vite-plugin-pwa 0.20.5 Workbox integration; auto-generated service worker; precache manifest.
PDF/Print Native browser (window.print()) N/A Zero dependency; @media print CSS per UIUX-001 §5.6.
Package Manager pnpm 9.12.0 Content-addressable store; strict peer dependency resolution; faster than npm.
Runtime Node.js 20.18.0 LTS Vite 5 requires Node ≥18; LTS support until April 2026.
1.1.1 package.json Dependencies (Production)
json
{
"dependencies": {
"react": "18.3.1",
"react-dom": "18.3.1",
"react-router-dom": "6.26.2",
"zustand": "4.5.5",
"@supabase/supabase-js": "2.45.4",
"lucide-react": "0.452.0",
"date-fns": "3.6.0",
"zod": "3.23.8",
"@radix-ui/react-dialog": "1.1.2",
"@radix-ui/react-select": "2.1.2",
"@radix-ui/react-tabs": "1.1.1",
"@radix-ui/react-toast": "1.2.2"
},
"devDependencies": {
"vite": "5.4.8",
"vite-plugin-pwa": "0.20.5",
"@vitejs/plugin-react-swc": "3.7.0",
"typescript": "5.6.3",
"tailwindcss": "3.4.13",
"postcss": "8.4.47",
"autoprefixer": "10.4.20",
"eslint": "9.11.1",
"prettier": "3.3.3",
"husky": "9.1.6",
"lint-staged": "15.2.10",
"vitest": "2.1.2",
"@testing-library/react": "16.0.1",
"playwright": "1.47.2",
"supabase": "1.204.3"
}
}
1.2 Backend Stack (Managed BaaS)
Layer Technology Version Justification
Database Supabase PostgreSQL 15.x (managed) ACID compliance; JSONB for form_data; RLS native; free tier 500 MB.
API Gateway PostgREST 12.x (Supabase-managed) Auto-generated REST from schema; JWT validation; stateless.
Connection Pooling Supavisor 2.x (Supabase-managed) Transaction mode pooling; handles 10K users via pooled connections.
Auth Supabase Auth (deferred) 2.x (managed) Email magic link for Year 2 migration; JWT issuer.
Object Storage Cloudflare R2 S3-compatible API 10 GB free; $0 egress; presigned URLs.
Edge Cache Cloudflare Pages CDN Global Anycast s-maxage=60, stale-while-revalidate=300; 95% read hit ratio.
WAF/DDoS Cloudflare WAF Free tier OWASP Top 10; rate limiting; unmetered DDoS shield.
Custom Backend ❌ None N/A ADR-002: BaaS replaces custom Node/Go/Python.
1.2.1 PostgreSQL Extensions (Required)
sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Optional encryption
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Trigram search (future)
Rationale: uuid-ossp for gen_random_uuid() defaults; pg_trgm reserved for future full-text search if client-side filter scales beyond 10K rows.

1.3 Database Schema — Migration Order
Migration # File Name Tables Created Dependencies
001 001_profiles.sql profiles None
002 002_clubs.sql clubs None
003 003_events.sql events clubs FK
004 004_event_rsvps.sql event_rsvps events FK
005 005_document_applications.sql document_applications None
006 006_rls_policies.sql RLS policies on all tables All tables
007 007_indexes.sql Performance indexes All tables
008 008_seed_data.sql Initial clubs + sample events clubs, events
1.3.1 Critical Indexes
sql
-- Events feed query: ORDER BY event_date DESC
CREATE INDEX idx_events_event_date ON events(event_date DESC);

-- RSVP lookup by event
CREATE INDEX idx_event_rsvps_event_id ON event_rsvps(event_id);

-- Application tracker: filter by email
CREATE INDEX idx_document_applications_email
ON document_applications ((form_data->>'email'));

-- Club slug deep-link
CREATE UNIQUE INDEX idx_clubs_slug ON clubs(slug);
2. System Constraints & SLAs/SLOs
2.1 Throughput & Latency Budgets
Metric Target Measurement Alert Threshold
P95 API latency (PostgREST GET) < 200ms Supabase logs > 400ms
P99 API latency (PostgREST GET) < 500ms Supabase logs > 1000ms
P95 TTFB (Cloudflare edge) < 50ms (India) Cloudflare Analytics > 150ms
P95 TTI (4G mobile) < 2.0s Lighthouse CI > 3.0s
P99 TTI (4G mobile) < 4.0s Lighthouse CI > 6.0s
Optimistic UI latency < 16ms (single frame) Manual profiling > 32ms
Wizard preview keystroke < 50ms React DevTools Profiler > 100ms
Peak RPS (Cloudflare edge) 100 RPS Cloudflare Analytics > 500 RPS
Peak concurrent users 500 Cloudflare Analytics > 1,000
DB queries/second < 10 QPS (after cache) Supabase dashboard > 50 QPS
2.2 Payload Size Limits
Constraint Limit Enforcement
Client bundle (gzipped, initial) 250 KB Vite build analyzer; CI gate
Client bundle (gzipped, total with lazy routes) 500 KB Vite build analyzer
PostgREST response body 1 MB Supabase default (fine at this scale)
R2 upload per file 5 MB Client-side validation
form_data JSONB per row 100 KB Client-side validation
Request headers total 8 KB Cloudflare default
2.3 Database Connection Pooling Constraints
Parameter Supabase Free Tier Limit CampusOS Usage Target
Max direct connections 60 Never used (SPA has no server)
Supavisor pooled connections 200 < 50 concurrent
Pool mode Transaction Transaction (default)
Connection timeout 10s Client timeout 5s (fail fast)
2.4 Free Tier Envelope Constraints
Resource Free Tier Limit CampusOS Target (10K users) Margin
Supabase DB size 500 MB < 400 MB 20%
Supabase egress 5 GB/month < 3 GB/month 40%
Supabase MAU 50,000 10,000 80%
Cloudflare Pages bandwidth Unlimited ~50 GB/month Unlimited
Cloudflare R2 storage 10 GB < 5 GB 50%
Cloudflare R2 egress $0 $0 N/A
3. Runtime Environments & Configurations
3.1 Environment Matrix
Environment Purpose Supabase Project Cloudflare Pages Domain
Local Developer workstation Local Supabase (supabase start) Vite dev server (localhost:5173) localhost
Preview (PR) Per-PR staging Shared staging project Cloudflare Pages Preview pr-{n}.campusos.pages.dev
Staging Pre-production validation Staging Supabase project Cloudflare Pages Staging staging.campusos.pages.dev
Production Live campus deployment Production Supabase project Cloudflare Pages Production campusos.rbu.ac.in
3.2 Environment Variables
Variable Local Preview Staging Production Secret?
VITE_SUPABASE_URL http://localhost:54321 https://staging.supabase.co https://staging.supabase.co https://prod.supabase.co No
VITE_SUPABASE_ANON_KEY Local anon key Staging anon Staging anon Prod anon No*
VITE_R2_PUBLIC_URL http://localhost:9000 https://staging-r2.r2.dev https://staging-r2.r2.dev https://r2.rbu.ac.in No
VITE_APP_ENV local preview staging production No
SUPABASE_SERVICE_ROLE_KEY Never in client Never in client Never in client Never in client ✅ Yes
*Security Note: The anon key is safe to expose (RLS enforces access). The service_role key must never be bundled into the client. All admin operations use Supabase dashboard or server-side scripts (not part of this SPA).

3.3 Secrets Management
Secret Type Storage Rotation
Supabase anon key Cloudflare Pages env var On compromise
Supabase service_role GitHub Actions secret + Supabase Vault Quarterly
R2 API token GitHub Actions secret Quarterly
Cloudflare API token GitHub Actions secret Quarterly
Local .env Git-ignored (.env.local) Per-developer
Rule: .env files are never committed. .env.example provides non-secret templates.

3.4 Local Development Setup
bash
# Prerequisites: Node 20.18.0, pnpm 9.12.0, Docker (for Supabase)
git clone https://github.com/rbu-campusos/campusos.git
cd campusos
pnpm install
cp .env.example .env.local # Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
pnpm supabase start # Spin up local PostgreSQL + PostgREST
pnpm supabase db reset # Apply migrations + seed
pnpm dev # Vite dev server at localhost:5173
Local Supabase ports: API 54321, DB 54322, Studio 54323.

4. Codebase Architecture & Directory Structure
4.1 Repository Layout (Polyrepo-Adjacent Monorepo)
CampusOS uses a single-repository monolith with clear internal boundaries (not a pnpm monorepo — no need for multiple packages at this scale).

text
campusos/
├── .github/
│ └── workflows/
│ ├── ci.yml # Lint + typecheck + test on PR
│ └── deploy.yml # Deploy to Cloudflare Pages on main
├── .husky/
│ ├── pre-commit # lint-staged
│ └── commit-msg # commitlint
├── public/
│ ├── manifest.webmanifest # PWA manifest
│ ├── icons/ # PWA icons (192, 512, maskable)
│ └── offline.html # Offline fallback
├── src/
│ ├── main.tsx # Entry point
│ ├── App.tsx # Root component
│ ├── routes.tsx # React Router config
│ ├── features/ # Vertical feature slices
│ │ ├── onboarding/
│ │ │ ├── components/
│ │ │ ├── hooks/
│ │ │ ├── schemas.ts # Zod validation
│ │ │ └── index.ts # Public API
│ │ ├── events/
│ │ │ ├── components/ # EventCard, RSVPButton, SearchBar
│ │ │ ├── hooks/ # useEvents, useRSVP
│ │ │ └── index.ts
│ │ ├── clubs/
│ │ │ ├── components/
│ │ │ ├── hooks/
│ │ │ └── index.ts
│ │ ├── wizard/
│ │ │ ├── components/ # LetterheadPreview, DynamicForm
│ │ │ ├── templates/ # 3 document templates
│ │ │ ├── hooks/
│ │ │ └── index.ts
│ │ └── tracker/
│ │ ├── components/
│ │ ├── hooks/
│ │ └── index.ts
│ ├── shared/ # Cross-feature primitives
│ │ ├── ui/ # Button, Input, Modal, Toast, Skeleton
│ │ ├── layout/ # AppShell, TopBar, BottomNav, Sidebar
│ │ ├── lib/ # supabase client, formatters, validators
│ │ ├── hooks/ # useOnline, useLocalStorage, useDebounce
│ │ └── types/ # Generated DB types + app types
│ ├── services/ # Service layer
│ │ ├── api/ # Supabase query wrappers
│ │ ├── queue/ # localStorage mutation queue
│ │ ├── session/ # Session manager
│ │ └── telemetry/ # 16 event types
│ ├── styles/
│ │ ├── globals.css # Tailwind directives + CSS custom props
│ │ └── print.css # @media print overrides
│ └── workers/
│ └── service-worker.ts # Workbox precache + runtime cache
├── supabase/
│ ├── migrations/ # Numbered SQL migrations (001–008)
│ ├── seed.sql # Development seed data
│ └── config.toml # Local Supabase config
├── tests/
│ ├── unit/ # Vitest unit tests
│ ├── integration/ # React Testing Library
│ └── e2e/ # Playwright E2E
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── commitlint.config.cjs
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
4.2 Architectural Boundaries (Clean Architecture)
text
┌─────────────────────────────────────────────────────────┐
│ Presentation Layer (src/features/*/components/) │
│ • React components, hooks, UI state │
│ • NO direct Supabase calls │
├─────────────────────────────────────────────────────────┤
│ Application Layer (src/services/) │
│ • API wrappers, queue manager, session manager │
│ • Orchestrates use cases │
│ • Returns domain types (not raw DB rows) │
├─────────────────────────────────────────────────────────┤
│ Domain Layer (src/shared/types/) │
│ • TypeScript interfaces for Event, Club, Application │
│ • Zod schemas for validation │
│ • No framework dependencies │
├─────────────────────────────────────────────────────────┤
│ Infrastructure Layer (src/shared/lib/supabase.ts) │
│ • Supabase client singleton │
│ • localStorage adapters │
│ • Swappable without touching domain │
└─────────────────────────────────────────────────────────┘
Rule: Feature components import from services/ and shared/, never directly from @supabase/supabase-js. This allows swapping the backend (e.g., to a different BaaS) without touching UI code.

5. Dependencies & Third-Party Integrations
5.1 Third-Party Service Matrix
Service Purpose Free Tier Fallback Strategy
Supabase PostgreSQL + PostgREST + Pooler 500 MB DB, 5 GB egress Fallback: Queue mutations in localStorage; serve stale cache; if extended outage, migrate to Neon + self-hosted PostgREST (2–3 days effort).
Cloudflare Pages Static hosting + CDN Unlimited bandwidth Fallback: Deploy same static bundle to Netlify/Vercel free tier (config change only).
Cloudflare R2 Object storage 10 GB + $0 egress Fallback: Upload to Supabase Storage (1 GB free) with R2 disabled.
Cloudflare WAF DDoS + rate limiting Free tier Fallback: None (Cloudflare global network is the reliability layer).
Google Fonts Inter typeface Free Fallback: Self-hosted WOFF2 subset (already planned for offline PWA).
Supabase Auth Magic link auth (Year 2) 50K MAU Fallback: Continue open email + roll number model.
5.2 Integration Points (Year 1)
Integration Type Direction Protocol Failure Mode
Supabase PostgREST REST API Outbound HTTPS Queue + stale cache
Cloudflare R2 S3 API Outbound HTTPS Disable uploads; gradient fallback
Google Fonts Static CDN Outbound HTTPS System font fallback (-apple-system, Segoe UI)
Browser Print Native API Internal N/A N/A
5.3 Integration Points (Deferred)
Integration Target Rationale for Deferral
Serosoft ERP Fee, attendance sync No API access; institutional IT procurement required
WhatsApp Business API Event notifications Cost; Meta approval complexity
Twilio SMS OTP verification Open access model removes need
Stripe/Razorpay Payment processing Out of scope (ERP handles fees)
SendGrid/Postmark Email notifications Year 2 P1 feature
6. Development Tooling & Linters
6.1 TypeScript Configuration (tsconfig.json)
json
{
"compilerOptions": {
"target": "ES2022",
"lib": ["ES2022", "DOM", "DOM.Iterable"],
"module": "ESNext",
"moduleResolution": "bundler",
"strict": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
"exactOptionalPropertyTypes": true,
"jsx": "react-jsx",
"baseUrl": ".",
"paths": {
"@/*": ["src/*"],
"@features/*": ["src/features/*"],
"@shared/*": ["src/shared/*"]
}
}
}
6.2 ESLint Configuration (.eslintrc.cjs)
js
module.exports = {
root: true,
env: { browser: true, es2022: true },
extends: [
'eslint:recommended',
'plugin:@typescript-eslint/strict-type-checked',
'plugin:react-hooks/recommended',
'plugin:react/recommended',
'prettier',
],
parser: '@typescript-eslint/parser',
parserOptions: { project: './tsconfig.json' },
plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
rules: {
'import/order': ['error', {
groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
'newlines-between': 'always',
}],
'react/react-in-jsx-scope': 'off',
'@typescript-eslint/no-explicit-any': 'error',
'@typescript-eslint/consistent-type-imports': 'error',
'no-console': ['warn', { allow: ['warn', 'error'] }],
},
};
6.3 Prettier Configuration (.prettierrc)
json
{
"semi": true,
"singleQuote": true,
"trailingComma": "es5",
"printWidth": 100,
"tabWidth": 2,
"plugins": ["prettier-plugin-tailwindcss"]
}
6.4 Git Branch Strategy (Trunk-Based Development)
Branch Purpose Lifetime Protected
main Production-ready; auto-deploys to Cloudflare Pages Production Permanent ✅
staging Pre-production; deploys to Staging Permanent ✅
feat/* Feature branches < 3 days No
fix/* Bug fixes < 1 day No
chore/* Tooling, deps < 1 day No
Rules:

No direct commits to main or staging.

PR requires 1 approval + CI green.

Squash-merge to main.

Delete feature branch after merge.

6.5 Git Hooks (Husky)
bash
# .husky/pre-commit
pnpm lint-staged

# .husky/commit-msg
pnpm commitlint --edit $1
json
// package.json — lint-staged
{
"lint-staged": {
"*.{ts,tsx}": ["eslint --fix", "prettier --write"],
"*.{css,md,json}": ["prettier --write"]
}
}
6.6 Commit Convention (Conventional Commits)
text
<type>(<scope>): <subject>

feat(events): add 1-tap optimistic RSVP
fix(wizard): correct REF ID generation for NOC template
chore(deps): bump @supabase/supabase-js to 2.45.4
docs(readme): update local setup instructions
Types: feat, fix, docs, style, refactor, perf, test, chore, ci.

6.7 CI/CD Pipeline (GitHub Actions)
yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]
jobs:
quality:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v4
- uses: pnpm/action-setup@v4
with: { version: 9 }
- uses: actions/setup-node@v4
with: { node-version: 20.18.0, cache: pnpm }
- run: pnpm install --frozen-lockfile
- run: pnpm lint
- run: pnpm typecheck
- run: pnpm test:unit
- run: pnpm build
yaml
# .github/workflows/deploy.yml
name: Deploy
on:
push:
branches: [main]
jobs:
deploy:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v4
- uses: pnpm/action-setup@v4
- uses: actions/setup-node@v4
with: { node-version: 20.18.0, cache: pnpm }
- run: pnpm install --frozen-lockfile
- run: pnpm build
env:
VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
- uses: cloudflare/wrangler-action@v3
with:
apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
command: pages deploy dist --project-name=campusos
6.8 Testing Strategy
Test Type Tool Coverage Target Run When
Unit Vitest 70% on services/ + shared/lib/ Pre-commit + CI
Integration React Testing Library Critical user flows CI
E2E Playwright All P0 user stories (US-01→US-12) Pre-merge + nightly
Accessibility axe-core (Playwright) Zero critical violations CI
Lighthouse Lighthouse CI Perf ≥85, A11y ≥95 Pre-merge
7. Developer Onboarding Runbook
7.1 Prerequisites
Tool Version Install
Node.js 20.18.0 LTS nvm install 20.18.0
pnpm 9.12.0 corepack enable && corepack prepare pnpm@9.12.0 --activate
Docker Desktop Latest For local Supabase
Supabase CLI 1.204.3 pnpm add -g supabase
Git ≥2.40 System package
7.2 First-Day Checklist
Clone repo: git clone https://github.com/rbu-campusos/campusos.git

Install deps: pnpm install

Copy env: cp .env.example .env.local

Start local Supabase: pnpm supabase start

Reset DB with migrations: pnpm supabase db reset

Start dev server: pnpm dev

Verify at http://localhost:5173

Run tests: pnpm test:unit

Read: README.md, ARCH-002, UIUX-001

7.3 Common Commands
Command Purpose
pnpm dev Start Vite dev server
pnpm build Production build
pnpm preview Preview production build locally
pnpm lint ESLint
pnpm typecheck tsc --noEmit
pnpm test:unit Vitest
pnpm test:e2e Playwright
pnpm supabase db reset Reapply migrations + seed
pnpm supabase migration new <name> Create new migration file
pnpm supabase gen types typescript Regenerate DB types
8. Technical Constraints Summary
Constraint Value Impact
Zero infrastructure cost $0.00/mo All choices constrained to free tiers
No server-side compute N/A No SSR, no server PDF, no server cron
DB size limit 500 MB JSONB compression; archive old events
Egress limit 5 GB/mo 95% edge cache hit required
R2 storage 10 GB Poster images limited to 5 MB each
Client bundle 250 KB initial Code-splitting per route mandatory
Browser support Chrome/Safari/Firefox/Edge (latest 2) No IE11, no legacy polyfills
Node version 20.18.0 LTS Vite 5 requirement
TypeScript 5.6.3 strict mode No any allowed
9. Traceability Matrix (TRD → Upstream)
TRD Section Upstream Reference Decision ID
Frontend stack (React 18 + Vite) PRD §7.1 (TTI <2s) AP-1, AP-4
Backend (Supabase + PostgREST) ARCH-002 §3.1 Container Inventory ADR-002
Database schema migrations System Prompt §5 —
RLS policies ARCH-002 §5.3 ADR-004
Edge caching strategy ARCH-002 §5.4 AP-1, AP-2
Client-side PDF ARCH-002 §4.1 ADR-003
Optimistic UI + queue ARCH-002 §4.3 ADR-007
No message broker ARCH-002 §5.1 ADR-008
Open auth model ARCH-002 §5.3 ADR-004
Design tokens (Tailwind config) UIUX-001 §1.6 —
Print CSS override UIUX-001 §5.6 —
— END OF TECHNICAL REQUIREMENTS DOCUMENT —

This TRD is the canonical engineering-execution reference for CampusOS. All package.json entries, Supabase migrations, Cloudflare Pages configs, and CI workflows must trace to the version pins, SLAs, and directory conventions defined here. Any deviation requires a Change Request reviewed by the Lead Software Architect. Next revision expected post-first-sprint retrospective.

Format with Markdown code blocks, tables, and precise version numbers. Begin directly with `# Technical Requirements Document (TRD)`.
SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY
Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
1 System Prompt: Enterprise SDLC Generation Specification Established CampusOS concept: edge-native PWA bridging campus culture and administrative bureaucracy for RBU Mohali. Defined 4 modules (Event Hub, Clubs Directory, Document Wizard, Status Tracker), $0 cloud architecture (Cloudflare Pages + Supabase Free + R2), PostgreSQL schema (6 tables with RLS), open student auth. React 18, Tailwind CSS, Lucide Icons, Supabase PostgreSQL 15.x/PostgREST/Supavisor, Cloudflare Pages CDN, Cloudflare R2, localStorage sessions
2 Business Requirements Document (BRD) Enterprise business case: quantified pain (4,500 lost student-hrs/yr, 33 staff-hrs/wk wasted), TAM/SAM/SOM (44.6M/500K/10K), 5 OKRs, $0 unit economics, RACI matrix, 8-risk matrix. Consumes system prompt; drives downstream PRD OKRs and success metrics
3 Product Requirements Document (PRD) Engineering-ready specs: 3 personas, MoSCoW features (FR-001→FR-029), Gherkin AC, NFRs (P95 <200ms, 99.9% uptime, WCAG 2.1 AA), 16 telemetry events, Go/No-Go checklist. Consumes BRD OKRs; drives UX flows, sprint planning, QA test cases; establishes FR IDs
4 User Journey Maps & Interaction Workflows Behavioral blueprint: 3 journey maps, 4 Mermaid flowcharts (onboarding, wizard, failure, state), edge-case playbooks, Information Architecture (routes /events, /clubs, /wizard, /applications). Consumes PRD FR IDs; drives Figma wireframes, React routing, error middleware
5 UI/UX Design Specifications & Component Guide Design system: color/typography/spacing tokens (HEX+HSL), elevation shadows, radius tokens, 8 screen wireframes, component state matrix (7 states × 12 components), responsive breakpoints, motion tokens, print-mode CSS. Consumes journey maps + PRD; drives Tailwind config, Figma library, React component implementation
6 High-Level System Architecture Specification (ARCH-001/002) C4-model architecture: System Context (L1) + Container (L2) diagrams, communication protocol matrix, storage topology, Cloudflare network topology, HA/DR with RPO/RTO targets, 8 ADRs documenting $0-tier trade-offs, FR-to-container traceability. Consumes PRD NFRs + UI/UX tokens; drives DB migrations, API contracts, deployment pipelines, ops runbooks
7 (Current) Technical Requirements Document (TRD) Definitive engineering-execution layer: pinned versions (React 18.3.1, Vite 5.4.8, TypeScript 5.6.3, Tailwind 3.4.13, Supabase JS 2.45.4), SLAs/SLOs (P95 <200ms, P99 <500ms), payload/bundle limits (250 KB initial), 4-environment matrix (local/preview/staging/prod), Clean Architecture directory structure, 5-service dependency matrix with fallback strategies, tooling (ESLint 9, Prettier 3, Husky 9, pnpm 9), trunk-based Git strategy, CI/CD workflows, developer onboarding runbook. Consumes ARCH-001/002 topology; drives package.json, vite.config.ts, .eslintrc.cjs, supabase/migrations/, Cloudflare Pages deploy config, GitHub Actions workflows
Project Structure Snapshot:
This document is the seventh artifact and the definitive engineering-execution reference for CampusOS. It converts the architectural topology from ARCH-001/002 into pinned technology versions, system constraints, environment configurations, and development tooling standards that engineering teams implement directly. Every package.json entry, supabase/migrations/ SQL file, Cloudflare Pages config, and CI pipeline traces to the version pins, SLAs, and directory conventions defined herein.

1. Tech Stack Selection & Version Constraints
1.1 Frontend Stack
Layer Technology Pinned Version Justification
Framework React 18.3.1 Concurrent rendering, Suspense, hooks. Stable LTS. No React 19 dependency (unstable ecosystem for PWA tooling).
Language TypeScript 5.6.3 Compile-time safety for schema-driven forms; typed Supabase client generation. Strict mode mandatory.
Build Tool Vite 5.4.8 Sub-second HMR; native ESM; Rollup production builds; vite-plugin-pwa ecosystem.
Routing React Router 6.26.2 Data-router APIs, nested routes, code-splitting per route.
State Management Zustand 4.5.5 Minimal boilerplate; persist middleware for localStorage; no Redux ceremony.
Styling Engine Tailwind CSS 3.4.13 Token-driven design system per UIUX-001; JIT compilation; small production bundle.
UI Primitives Radix UI (headless) 1.1.x Accessible primitives (Dialog, Select, Tabs, Toast) without opinionated styling.
Icons Lucide React 0.452.0 Tree-shakeable; consistent 24px stroke-width; matches UIUX-001 spec.
Date Handling date-fns 3.6.0 Tree-shakeable; en-IN locale support; no moment.js bloat.
Form Validation Zod 3.23.8 Schema-first validation; infers TypeScript types; used in Wizard forms.
PWA Plugin vite-plugin-pwa 0.20.5 Workbox integration; auto-generated service worker; precache manifest.
PDF/Print Native browser (window.print()) N/A Zero dependency; @media print CSS per UIUX-001 §5.6.
Package Manager pnpm 9.12.0 Content-addressable store; strict peer dependency resolution; faster than npm.
Runtime Node.js 20.18.0 LTS Vite 5 requires Node ≥18; LTS support until April 2026.
1.1.1 package.json Dependencies (Production)
json
{
"name": "campusos",
"private": true,
"version": "1.0.0",
"type": "module",
"engines": {
"node": ">=20.18.0",
"pnpm": ">=9.12.0"
},
"dependencies": {
"react": "18.3.1",
"react-dom": "18.3.1",
"react-router-dom": "6.26.2",
"zustand": "4.5.5",
"@supabase/supabase-js": "2.45.4",
"lucide-react": "0.452.0",
"date-fns": "3.6.0",
"zod": "3.23.8",
"@radix-ui/react-dialog": "1.1.2",
"@radix-ui/react-select": "2.1.2",
"@radix-ui/react-tabs": "1.1.1",
"@radix-ui/react-toast": "1.2.2"
},
"devDependencies": {
"vite": "5.4.8",
"vite-plugin-pwa": "0.20.5",
"@vitejs/plugin-react-swc": "3.7.0",
"typescript": "5.6.3",
"tailwindcss": "3.4.13",
"postcss": "8.4.47",
"autoprefixer": "10.4.20",
"prettier-plugin-tailwindcss": "0.6.8",
"eslint": "9.11.1",
"@typescript-eslint/parser": "8.8.0",
"@typescript-eslint/eslint-plugin": "8.8.0",
"eslint-plugin-react": "7.37.1",
"eslint-plugin-react-hooks": "5.1.0-rc.0",
"eslint-plugin-import": "2.31.0",
"eslint-config-prettier": "9.1.0",
"prettier": "3.3.3",
"husky": "9.1.6",
"lint-staged": "15.2.10",
"@commitlint/cli": "19.5.0",
"@commitlint/config-conventional": "19.5.0",
"vitest": "2.1.2",
"@testing-library/react": "16.0.1",
"@testing-library/jest-dom": "6.5.0",
"@testing-library/user-event": "14.5.2",
"jsdom": "25.0.1",
"playwright": "1.47.2",
"@playwright/test": "1.47.2",
"@axe-core/playwright": "4.10.0",
"supabase": "1.204.3"
}
}
1.1.2 vite.config.ts (Canonical)
typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
plugins: [
react(),
VitePWA({
registerType: 'autoUpdate',
includeAssets: ['favicon.ico', 'icons/*.png'],
manifest: {
name: 'CampusOS',
short_name: 'CampusOS',
description: 'Campus Community & Administrative Automation',
theme_color: '#090a10',
background_color: '#090a10',
display: 'standalone',
start_url: '/',
icons: [
{ src: '/icons/192.png', sizes: '192x192', type: 'image/png' },
{ src: '/icons/512.png', sizes: '512x512', type: 'image/png' },
{ src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
],
},
workbox: {
globPatterns: ['**/*.{js,css,html,woff2,svg,png}'],
runtimeCaching: [
{
urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/(events|clubs).*/,
handler: 'StaleWhileRevalidate',
options: {
cacheName: 'supabase-read-cache',
expiration: { maxEntries: 100, maxAgeSeconds: 300 },
},
},
],
},
}),
],
resolve: {
alias: {
'@': path.resolve(__dirname, './src'),
'@features': path.resolve(__dirname, './src/features'),
'@shared': path.resolve(__dirname, './src/shared'),
'@services': path.resolve(__dirname, './src/services'),
},
},
build: {
target: 'es2022',
sourcemap: true,
rollupOptions: {
output: {
manualChunks: {
vendor: ['react', 'react-dom', 'react-router-dom'],
supabase: ['@supabase/supabase-js'],
},
},
},
},
});
1.2 Backend Stack (Managed BaaS)
Layer Technology Version Justification
Database Supabase PostgreSQL 15.x (managed) ACID compliance; JSONB for form_data; RLS native; free tier 500 MB.
API Gateway PostgREST 12.x (Supabase-managed) Auto-generated REST from schema; JWT validation; stateless.
Connection Pooling Supavisor 2.x (Supabase-managed) Transaction mode pooling; handles 10K users via pooled connections.
Auth Supabase Auth (deferred) 2.x (managed) Email magic link for Year 2 migration; JWT issuer.
Object Storage Cloudflare R2 S3-compatible API 10 GB free; $0 egress; presigned URLs.
Edge Cache Cloudflare Pages CDN Global Anycast s-maxage=60, stale-while-revalidate=300; 95% read hit ratio.
WAF/DDoS Cloudflare WAF Free tier OWASP Top 10; rate limiting; unmetered DDoS shield.
Custom Backend ❌ None N/A ADR-002: BaaS replaces custom Node/Go/Python.
1.3 Database & Cache
Layer Technology Version Justification
Primary OLTP PostgreSQL (Supabase) 15.8 (managed) Single source of truth; 6 tables; RLS enforced.
Caching (edge) Cloudflare CDN Global s-maxage=60; 95% read hit ratio target.
Caching (client) Service Worker + localStorage Browser API Offline resilience; mutation queue.
Caching (server) ❌ No Redis/Memcached N/A Not needed at 100 RPS; PostgREST is stateless.
Full-Text Search ❌ No Elasticsearch/Meilisearch N/A Client-side filter (Array.filter) suffices at 200 events. ADR-005.
Vector DB ❌ None N/A No AI/ML features in Year 1.
Message Broker ❌ No Kafka/RabbitMQ/Redis PubSub N/A ADR-008: no async fan-out requirement.
Read Replicas ❌ None N/A Free tier does not offer; <3 GB/mo egress makes unnecessary.
1.4 Infrastructure & Cloud
Layer Technology Version Justification
Cloud Provider Cloudflare (Pages + R2 + WAF) N/A $0 free tier; Anycast; unmetered DDoS.
BaaS Provider Supabase Managed $0 free tier; PostgreSQL + PostgREST + Pooler bundled.
CDN Cloudflare Anycast (300+ PoPs) N/A Sub-50ms TTFB in India (Delhi/Mumbai/Chandigarh PoPs).
Containerization ❌ No Docker in production N/A Static SPA bundle; no server to containerize.
Orchestration ❌ No Kubernetes / ECS N/A No compute workloads; serverless edge only.
Serverless Compute ❌ No Lambda / Workers N/A All compute runs client-side (browser).
Local Containerization Docker 24.0+ Local Supabase stack (PostgreSQL + PostgREST) for dev parity.
Infrastructure-as-Code ❌ None N/A Cloudflare Pages config via wrangler.toml + GitHub Actions.
DNS Cloudflare DNS N/A Manages campusos.rbu.ac.in (or pages.dev subdomain).
1.4.1 wrangler.toml (Cloudflare Pages Configuration)
toml
name = "campusos"
compatibility_date = "2026-10-01"
pages_build_output_dir = "dist"

[env.production]
vars = { VITE_APP_ENV = "production" }

[env.staging]
vars = { VITE_APP_ENV = "staging" }
1.4.2 public/_headers (Cloudflare Edge Headers)
text
/*
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; img-src 'self' data: https://*.r2.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.r2.dev; script-src 'self'; frame-ancestors 'none'

/api/*
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
2. System Constraints & SLAs/SLOs
2.1 Throughput & Latency Budgets
Metric Target Measurement Alert Threshold
P95 API latency (PostgREST GET) < 200ms Supabase logs > 400ms
P99 API latency (PostgREST GET) < 500ms Supabase logs > 1000ms
P95 TTFB (Cloudflare edge) < 50ms (India) Cloudflare Analytics > 150ms
P95 TTI (4G mobile) < 2.0s Lighthouse CI > 3.0s
P99 TTI (4G mobile) < 4.0s Lighthouse CI > 6.0s
FCP (4G mobile) < 1.2s Lighthouse CI > 2.0s
Optimistic UI latency < 16ms (single frame) Manual profiling > 32ms
Wizard preview keystroke < 50ms React DevTools Profiler > 100ms
Peak RPS (Cloudflare edge) 100 RPS Cloudflare Analytics > 500 RPS
Peak concurrent users 500 Cloudflare Analytics > 1,000
DB queries/second < 10 QPS (after cache) Supabase dashboard > 50 QPS
Edge cache hit ratio ≥ 95% (read paths) Cloudflare Analytics < 90%
2.2 Payload Size Limits
Constraint Limit Enforcement
Client bundle (gzipped, initial) 250 KB Vite build analyzer; CI gate
Client bundle (gzipped, total w/ lazy routes) 500 KB Vite build analyzer
PostgREST response body 1 MB Supabase default
R2 upload per file 5 MB Client-side Zod validation
form_data JSONB per row 100 KB Client-side Zod validation
Request headers total 8 KB Cloudflare default
Letterhead A4 print 1 page (210×297mm) CSS @page + overflow hidden
2.3 Database Connection Pooling Constraints
Parameter Supabase Free Tier Limit CampusOS Usage Target
Max direct connections 60 Never used (SPA has no server)
Supavisor pooled connections 200 < 50 concurrent
Pool mode Transaction Transaction (default)
Connection timeout 10s Client timeout 5s (fail fast)
Idle timeout 60s Managed by Supavisor
2.4 Free Tier Envelope Constraints
Resource Free Tier Limit CampusOS Target (10K users) Margin
Supabase DB size 500 MB < 400 MB 20%
Supabase egress 5 GB/month < 3 GB/month 40%
Supabase MAU 50,000 10,000 80%
Supabase Auth MAU 50,000 N/A (Year 1) N/A
Cloudflare Pages bandwidth Unlimited ~50 GB/month Unlimited
Cloudflare Pages builds 500/month ~60/month 88%
Cloudflare R2 storage 10 GB < 5 GB 50%
Cloudflare R2 egress $0 $0 N/A
Cloudflare R2 Class A ops 1M/month < 100K/month 90%
2.5 Browser & Device Support Matrix
Browser Min Version Support Level
Chrome (Android) Latest 2 versions Full
Chrome (Desktop) Latest 2 versions Full
Safari (iOS) 16.4+ Full
Safari (macOS) 16.4+ Full
Firefox Latest 2 versions Full
Edge Latest 2 versions Full
IE 11 ❌ Not supported No polyfills
Legacy Android WebView ❌ < Chrome 100 Graceful degradation
3. Runtime Environments & Configurations
3.1 Environment Matrix
Environment Purpose Supabase Project Cloudflare Pages Domain
Local Developer workstation Local Supabase (supabase start) Vite dev server (localhost:5173) localhost:5173
Preview (PR) Per-PR staging Shared staging project Cloudflare Pages Preview pr-{n}.campusos.pages.dev
Staging Pre-production validation Staging Supabase project Cloudflare Pages Staging staging.campusos.pages.dev
Production Live campus deployment Production Supabase project Cloudflare Pages Production campusos.rbu.ac.in
3.2 Environment Variables
Variable Local Preview Staging Production Secret?
VITE_SUPABASE_URL http://localhost:54321 https://staging.supabase.co https://staging.supabase.co https://prod.supabase.co No
VITE_SUPABASE_ANON_KEY Local anon key Staging anon Staging anon Prod anon No*
VITE_R2_PUBLIC_URL http://localhost:9000 https://staging-r2.r2.dev https://staging-r2.r2.dev https://r2.rbu.ac.in No
VITE_APP_ENV local preview staging production No
SUPABASE_SERVICE_ROLE_KEY Never in client Never in client Never in client Never in client ✅ Yes
*Security Note: The anon key is safe to expose (RLS enforces access). The service_role key must never be bundled into the client. All admin operations use Supabase dashboard or server-side scripts (not part of this SPA).

3.3 .env.example Template
bash
# Copy to .env.local and fill values from Supabase dashboard
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_R2_PUBLIC_URL=http://localhost:9000
VITE_APP_ENV=local

# NEVER commit .env.local — it is git-ignored
# NEVER place SUPABASE_SERVICE_ROLE_KEY in any VITE_* variable
3.4 Secrets Management
Secret Type Storage Rotation Access
Supabase anon key Cloudflare Pages env var + .env.local On compromise Public (safe)
Supabase service_role GitHub Actions secret + Supabase Vault Quarterly CI/CD only
R2 API token GitHub Actions secret Quarterly CI/CD only
Cloudflare API token GitHub Actions secret Quarterly CI/CD only
Local .env.local Git-ignored Per-developer Individual developer
Rule: .env files are never committed. .env.example provides non-secret templates. Any secret exposed in a commit requires immediate rotation + Git history scrub.

3.5 Local Development Setup
bash
# Prerequisites: Node 20.18.0, pnpm 9.12.0, Docker Desktop (for local Supabase)
git clone https://github.com/rbu-campusos/campusos.git
cd campusos
pnpm install
cp .env.example .env.local # Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
pnpm supabase start # Spin up local PostgreSQL + PostgREST
pnpm supabase db reset # Apply migrations + seed
pnpm dev # Vite dev server at localhost:5173
Local Supabase ports: API 54321, DB 54322, Studio 54323, Inbucket (email) 54324.

4. Codebase Architecture & Directory Structure
4.1 Repository Layout
CampusOS uses a single-repository monolith with clear internal boundaries (not a pnpm workspace monorepo — no need for multiple published packages at this scale).

text
campusos/
├── .github/
│ └── workflows/
│ ├── ci.yml # Lint + typecheck + test on PR
│ ├── deploy-staging.yml # Deploy staging branch
│ └── deploy-production.yml # Deploy main → Cloudflare Pages
├── .husky/
│ ├── pre-commit # Runs lint-staged
│ └── commit-msg # Runs commitlint
├── public/
│ ├── manifest.webmanifest # PWA manifest
│ ├── favicon.ico
│ ├── _headers # Cloudflare edge headers
│ ├── _redirects # SPA fallback: /* /index.html 200
│ ├── icons/ # 192, 512, maskable-512
│ └── offline.html # Offline fallback
├── src/
│ ├── main.tsx # Entry point
│ ├── App.tsx # Root component
│ ├── routes.tsx # React Router config
│ ├── vite-env.d.ts # Vite + ImportMeta types
│ ├── features/ # Vertical feature slices
│ │ ├── onboarding/
│ │ │ ├── components/
│ │ │ │ ├── ProfileForm.tsx
│ │ │ │ └── LandingHero.tsx
│ │ │ ├── hooks/
│ │ │ │ └── useOnboarding.ts
│ │ │ ├── schemas.ts # Zod validation
│ │ │ └── index.ts # Public API
│ │ ├── events/
│ │ │ ├── components/
│ │ │ │ ├── EventCard.tsx
│ │ │ │ ├── EventList.tsx
│ │ │ │ ├── RSVPButton.tsx
│ │ │ │ ├── SearchBar.tsx
│ │ │ │ └── CategoryPills.tsx
│ │ │ ├── hooks/
│ │ │ │ ├── useEvents.ts
│ │ │ │ └── useRSVP.ts
│ │ │ └── index.ts
│ │ ├── clubs/
│ │ │ ├── components/
│ │ │ │ ├── ClubCard.tsx
│ │ │ │ ├── ClubGrid.tsx
│ │ │ │ ├── ClubDetail.tsx
│ │ │ │ └── JoinButton.tsx
│ │ │ ├── hooks/
│ │ │ │ └── useClubs.ts
│ │ │ └── index.ts
│ │ ├── wizard/
│ │ │ ├── components/
│ │ │ │ ├── TemplatePicker.tsx
│ │ │ │ ├── DynamicForm.tsx
│ │ │ │ ├── LetterheadPreview.tsx
│ │ │ │ └── PrintTrigger.tsx
│ │ │ ├── templates/
│ │ │ │ ├── venue-permission.ts
│ │ │ │ ├── financial-aid.ts
│ │ │ │ └── mst-noc.ts
│ │ │ ├── hooks/
│ │ │ │ └── useWizard.ts
│ │ │ ├── schemas.ts
│ │ │ └── index.ts
│ │ └── tracker/
│ │ ├── components/
│ │ │ ├── ApplicationCard.tsx
│ │ │ ├── ApplicationList.tsx
│ │ │ └── StatusBadge.tsx
│ │ ├── hooks/
│ │ │ └── useApplications.ts
│ │ └── index.ts
│ ├── shared/ # Cross-feature primitives
│ │ ├── ui/
│ │ │ ├── Button.tsx
│ │ │ ├── Input.tsx
│ │ │ ├── Modal.tsx
│ │ │ ├── Toast.tsx
│ │ │ ├── Skeleton.tsx
│ │ │ ├── Pill.tsx
│ │ │ └── EmptyState.tsx
│ │ ├── layout/
│ │ │ ├── AppShell.tsx
│ │ │ ├── TopBar.tsx
│ │ │ ├── BottomNav.tsx
│ │ │ ├── Sidebar.tsx
│ │ │ └── OfflineBanner.tsx
│ │ ├── lib/
│ │ │ ├── supabase.ts # Supabase client singleton
│ │ │ ├── formatters.ts # Indian date/currency format
│ │ │ └── constants.ts
│ │ ├── hooks/
│ │ │ ├── useOnline.ts
│ │ │ ├── useLocalStorage.ts
│ │ │ └── useDebounce.ts
│ │ └── types/
│ │ ├── database.types.ts # Generated by supabase gen types
│ │ └── app.types.ts # Domain types
│ ├── services/ # Service layer
│ │ ├── api/
│ │ │ ├── events.api.ts
│ │ │ ├── clubs.api.ts
│ │ │ ├── rsvps.api.ts
│ │ │ ├── applications.api.ts
│ │ │ └── profiles.api.ts
│ │ ├── queue/
│ │ │ ├── queueManager.ts
│ │ │ └── flushQueue.ts
│ │ ├── session/
│ │ │ └── sessionManager.ts
│ │ └── telemetry/
│ │ └── telemetry.ts
│ ├── styles/
│ │ ├── globals.css # Tailwind directives + CSS vars
│ │ └── print.css # @media print overrides
│ └── workers/
│ └── service-worker.ts # Workbox precache + runtime cache
├── supabase/
│ ├── migrations/
│ │ ├── 001_profiles.sql
│ │ ├── 002_clubs.sql
│ │ ├── 003_events.sql
│ │ ├── 004_event_rsvps.sql
│ │ ├── 005_document_applications.sql
│ │ ├── 006_rls_policies.sql
│ │ ├── 007_indexes.sql
│ │ └── 008_seed_data.sql
│ ├── seed.sql # Development seed
│ └── config.toml # Local Supabase config
├── tests/
│ ├── unit/
│ │ ├── services/
│ │ └── shared/lib/
│ ├── integration/
│ │ └── features/
│ └── e2e/
│ ├── onboarding.spec.ts
│ ├── events-rsvp.spec.ts
│ ├── wizard.spec.ts
│ └── tracker.spec.ts
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── .prettierignore
├── commitlint.config.cjs
├── index.html
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
4.2 Architectural Boundaries (Clean Architecture)
text
┌─────────────────────────────────────────────────────────┐
│ Presentation Layer (src/features/*/components/) │
│ • React components, hooks, UI state │
│ • NO direct Supabase calls │
│ • Import from services/ and shared/ only │
├─────────────────────────────────────────────────────────┤
│ Application Layer (src/services/) │
│ • API wrappers, queue manager, session manager │
│ • Orchestrates use cases │
│ • Returns domain types (not raw DB rows) │
├─────────────────────────────────────────────────────────┤
│ Domain Layer (src/shared/types/) │
│ • TypeScript interfaces for Event, Club, Application │
│ • Zod schemas for validation │
│ • No framework dependencies │
├─────────────────────────────────────────────────────────┤
│ Infrastructure Layer (src/shared/lib/supabase.ts) │
│ • Supabase client singleton │
│ • localStorage adapters │
│ • Swappable without touching domain │
└─────────────────────────────────────────────────────────┘
Enforcement Rule: ESLint import/no-restricted-paths rule blocks any features/*/components/* from importing @supabase/supabase-js directly. All Supabase access flows through services/api/*.

4.3 Naming Conventions
Artifact Convention Example
React components PascalCase .tsx EventCard.tsx
Hooks camelCase with use prefix useEvents.ts
Utilities camelCase .ts formatters.ts
Types PascalCase Event, Club
Zod schemas camelCase with Schema suffix eventSchema
Feature folders kebab-case onboarding/, events/
SQL migrations NNN_snake_case.sql 001_profiles.sql
Test files .test.ts / .spec.ts events.test.ts
5. Dependencies & Third-Party Integrations
5.1 Third-Party Service Matrix
Service Purpose Free Tier Fallback Strategy
Supabase PostgreSQL + PostgREST + Pooler 500 MB DB, 5 GB egress Fallback: Queue mutations in localStorage; serve stale cache; if extended outage, migrate to Neon + self-hosted PostgREST (2–3 days effort).
Cloudflare Pages Static hosting + CDN Unlimited bandwidth, 500 builds/mo Fallback: Deploy same static bundle to Netlify/Vercel free tier (config change only).
Cloudflare R2 Object storage 10 GB + $0 egress Fallback: Upload to Supabase Storage (1 GB free) with R2 disabled.
Cloudflare WAF DDoS + rate limiting Free tier Fallback: None (Cloudflare global network is the reliability layer).
Google Fonts Inter typeface Free Fallback: Self-hosted WOFF2 subset (already planned for offline PWA).
Supabase Auth Magic link auth (Year 2) 50K MAU Fallback: Continue open email + roll number model.
5.2 Integration Points (Year 1)
Integration Type Direction Protocol Failure Mode
Supabase PostgREST REST API Outbound HTTPS Queue + stale cache
Cloudflare R2 S3 API Outbound HTTPS Disable uploads; gradient fallback
Google Fonts Static CDN Outbound HTTPS System font fallback (-apple-system, Segoe UI)
Browser Print Native API Internal N/A N/A
5.3 Integration Points (Deferred to Year 2+)
Integration Target Rationale for Deferral
Serosoft ERP Fee, attendance sync No API access; institutional IT procurement required
WhatsApp Business API Event notifications Cost; Meta approval complexity
Twilio SMS OTP verification Open access model removes need
Stripe / Razorpay Payment processing Out of scope (ERP handles fees)
SendGrid / Postmark Email notifications Year 2 P1 feature
Sentry Error monitoring Cloudflare Analytics + telemetry covers Year 1 needs
PostHog / Mixpanel Product analytics 16 telemetry events → Supabase JSONB suffices
5.4 Analytics Strategy
Layer Tool Purpose Cost
Edge analytics Cloudflare Web Analytics Page views, TTFB, cache hit ratio $0
DB analytics Supabase Dashboard Query logs, egress, DB size $0
Product telemetry Custom sendBeacon → PostgREST → JSONB 16 event types per PRD §8.1 $0
Error tracking Browser window.onerror → telemetry Uncaught errors $0
RUM (Core Web Vitals) Cloudflare Web Analytics LCP, FID, CLS $0
6. Development Tooling & Linters
6.1 TypeScript Configuration (tsconfig.json)
json
{
"compilerOptions": {
"target": "ES2022",
"lib": ["ES2022", "DOM", "DOM.Iterable"],
"module": "ESNext",
"moduleResolution": "bundler",
"allowImportingTsExtensions": false,
"resolveJsonModule": true,
"isolatedModules": true,
"noEmit": true,
"strict": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
"exactOptionalPropertyTypes": true,
"jsx": "react-jsx",
"skipLibCheck": true,
"esModuleInterop": true,
"forceConsistentCasingInFileNames": true,
"baseUrl": ".",
"paths": {
"@/*": ["src/*"],
"@features/*": ["src/features/*"],
"@shared/*": ["src/shared/*"],
"@services/*": ["src/services/*"]
}
},
"include": ["src", "tests"],
"references": [{ "path": "./tsconfig.node.json" }]
}
6.2 ESLint Configuration (.eslintrc.cjs)
js
module.exports = {
root: true,
env: { browser: true, es2022: true, node: true },
extends: [
'eslint:recommended',
'plugin:@typescript-eslint/strict-type-checked',
'plugin:@typescript-eslint/stylistic-type-checked',
'plugin:react/recommended',
'plugin:react/jsx-runtime',
'plugin:react-hooks/recommended',
'plugin:import/recommended',
'plugin:import/typescript',
'prettier',
],
parser: '@typescript-eslint/parser',
parserOptions: {
ecmaVersion: 'latest',
sourceType: 'module',
project: ['./tsconfig.json', './tsconfig.node.json'],
tsconfigRootDir: __dirname,
},
plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
settings: {
react: { version: 'detect' },
'import/resolver': { typescript: true, node: true },
},
rules: {
'import/order': [
'error',
{
groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
'newlines-between': 'always',
alphabetize: { order: 'asc', caseInsensitive: true },
},
],
'import/no-restricted-paths': [
'error',
{
zones: [
{
target: './src/features',
from: './node_modules/@supabase',
message: 'Features must access Supabase via services/ layer only.',
},
],
},
],
'@typescript-eslint/no-explicit-any': 'error',
'@typescript-eslint/consistent-type-imports': 'error',
'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
'react/prop-types': 'off',
'react/jsx-uses-react': 'off',
'react/react-in-jsx-scope': 'off',
'no-console': ['warn', { allow: ['warn', 'error'] }],
'prefer-const': 'error',
'no-var': 'error',
},
overrides: [
{
files: ['tests/**/*.{ts,tsx}'],
rules: { '@typescript-eslint/no-explicit-any': 'off' },
},
],
};
6.3 Prettier Configuration (.prettierrc)
json
{
"semi": true,
"singleQuote": true,
"trailingComma": "es5",
"printWidth": 100,
"tabWidth": 2,
"useTabs": false,
"arrowParens": "always",
"endOfLine": "lf",
"plugins": ["prettier-plugin-tailwindcss"]
}
.prettierignore:

text
dist/
node_modules/
pnpm-lock.yaml
*.md
coverage/
6.4 Git Branch Strategy (Trunk-Based Development)
Branch Purpose Lifetime Protected
main Production-ready; auto-deploys to Cloudflare Pages Production Permanent ✅
staging Pre-production; deploys to Staging Permanent ✅
feat/* Feature branches < 3 days No
fix/* Bug fixes < 1 day No
chore/* Tooling, deps < 1 day No
hotfix/* Emergency production fixes < 4 hours No
Rules:

Rebase on main before merge (no merge commits on main).

# .husky/commit-msg
pnpm commitlint --edit "$1"
json
// package.json — lint-staged
{
"lint-staged": {
"*.{ts,tsx}": ["eslint --fix", "prettier --write"],
"*.{css,json,html}": ["prettier --write"]
}
}
6.6 Commit Convention (Conventional Commits)
text
<type>(<scope>): <subject>

<body optional>

<footer optional>
Type Usage
feat New feature
fix Bug fix
docs Documentation
style Formatting (no logic change)
refactor Code restructure (no behavior change)
perf Performance improvement
test Test additions/changes
chore Tooling, deps, config
ci CI/CD changes
Examples:

text
feat(events): add 1-tap optimistic RSVP
fix(wizard): correct REF ID generation for NOC template
chore(deps): bump @supabase/supabase-js to 2.45.4
docs(readme): update local setup instructions
js
// commitlint.config.cjs
module.exports = {
extends: ['@commitlint/config-conventional'],
rules: {
'scope-enum': [
2,
'always',
['events', 'clubs', 'wizard', 'tracker', 'onboarding', 'ui', 'deps', 'ci', 'docs', 'arch'],
],
},
};
6.7 CI/CD Pipeline (GitHub Actions)
yaml
# .github/workflows/ci.yml
name: CI
on:
pull_request:
branches: [main, staging]

concurrency:
group: ci-${{ github.ref }}
cancel-in-progress: true

jobs:
quality:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v4
- uses: pnpm/action-setup@v4
with: { version: 9.12.0 }
- uses: actions/setup-node@v4
with:
node-version: 20.18.0
cache: pnpm
- run: pnpm install --frozen-lockfile
- run: pnpm lint
- run: pnpm typecheck
- run: pnpm test:unit
- run: pnpm build
env:
VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
- run: pnpm exec playwright install --with-deps chromium
- run: pnpm test:e2e
yaml
# .github/workflows/deploy-production.yml
name: Deploy Production
on:
push:
branches: [main]

jobs:
deploy:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v4
- uses: pnpm/action-setup@v4
with: { version: 9.12.0 }
- uses: actions/setup-node@v4
with:
node-version: 20.18.0
cache: pnpm
- run: pnpm install --frozen-lockfile
- run: pnpm build
env:
VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
VITE_R2_PUBLIC_URL: ${{ secrets.VITE_R2_PUBLIC_URL }}
- uses: cloudflare/wrangler-action@v3
with:
apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
command: pages deploy dist --project-name=campusos --branch=main
6.8 Testing Strategy
Test Type Tool Coverage Target Run When
Unit Vitest 70% on services/ + shared/lib/ Pre-commit + CI
Integration React Testing Library Critical user flows CI
E2E Playwright All P0 user stories (US-01→US-12) Pre-merge + nightly
Accessibility axe-core (Playwright) Zero critical violations CI
Lighthouse Lighthouse CI Perf ≥85, A11y ≥95 Pre-merge
Bundle size rollup-plugin-visualizer < 250 KB initial gzipped CI gate
6.9 VS Code Workspace Recommendations (.vscode/extensions.json)
json
{
"recommendations": [
"dbaeumer.vscode-eslint",
"esbenp.prettier-vscode",
"bradlc.vscode-tailwindcss",
"ms-playwright.playwright",
"supabase.supabase-vscode",
"vitest.explorer"
]
}
7. Developer Onboarding Runbook
7.1 Prerequisites
Tool Version Install
Node.js 20.18.0 LTS nvm install 20.18.0
pnpm 9.12.0 corepack enable && corepack prepare pnpm@9.12.0 --activate
Docker Desktop Latest For local Supabase
Supabase CLI 1.204.3 pnpm add -g supabase
Git ≥2.40 System package
7.2 First-Day Checklist
Clone repo: git clone https://github.com/rbu-campusos/campusos.git

Generate DB types: pnpm supabase gen types typescript --local > src/shared/types/database.types.ts

Read: README.md, ARCH-002, UIUX-001, TRD-001

7.3 Common Commands
Command Purpose
pnpm dev Start Vite dev server
pnpm build Production build
pnpm preview Preview production build locally
pnpm lint ESLint
pnpm lint:fix ESLint with auto-fix
pnpm format Prettier write
pnpm typecheck tsc --noEmit
pnpm test:unit Vitest
pnpm test:e2e Playwright
pnpm supabase start Start local Supabase stack
pnpm supabase stop Stop local Supabase stack
pnpm supabase db reset Reapply migrations + seed
pnpm supabase migration new <name> Create new migration file
pnpm supabase gen types typescript Regenerate DB types
8. Technical Constraints Summary
Constraint Value Impact
Zero infrastructure cost $0.00/mo All choices constrained to free tiers
No server-side compute N/A No SSR, no server PDF, no server cron
DB size limit 500 MB JSONB compression; archive old events
Egress limit 5 GB/mo 95% edge cache hit required
R2 storage 10 GB Poster images limited to 5 MB each
Client bundle 250 KB initial Code-splitting per route mandatory
Browser support Chrome/Safari/Firefox/Edge (latest 2) No IE11, no legacy polyfills
Node version 20.18.0 LTS Vite 5 requirement
TypeScript 5.6.3 strict mode No any allowed
Package manager pnpm 9.12.0 No npm/yarn lockfiles
9. Traceability Matrix (TRD → Upstream)
TRD Section Upstream Reference Decision ID
Frontend stack (React 18 + Vite) PRD §7.1 (TTI <2s) AP-1, AP-4
Backend (Supabase + PostgREST) ARCH-002 §3.1 Container Inventory ADR-002
Database schema migrations System Prompt §5 —
RLS policies ARCH-002 §5.3 ADR-004
Edge caching strategy ARCH-002 §5.4 AP-1, AP-2
Client-side PDF ARCH-002 §4.1 ADR-003
Optimistic UI + queue ARCH-002 §4.3 ADR-007
No message broker ARCH-002 §5.1 ADR-008
Open auth model ARCH-002 §5.3 ADR-004
Design tokens (Tailwind config) UIUX-001 §1.6 —
Print CSS override UIUX-001 §5.6 —
Import boundary rule ARCH-002 §3.5 (C4 L3) AP-7
Free tier envelope targets ARCH-002 §5.4 egress budget AP-2
10. Open Technical Questions (Post-Sprint 1 Retrospective)
# Question Owner Target Resolution
1 Should we adopt React 19 once vite-plugin-pwa stabilizes? Lead Architect Q1 2027
2 Migrate to Supabase Auth magic-link for verified RLS? Lead Architect + DSW Q2 2027
3 Add Sentry free tier for error monitoring? Engineering Q1 2027
4 Self-host fonts to remove Google Fonts dependency? Engineering Sprint 2
5 Introduce pg_trgm full-text search at what event count? Lead Architect Trigger at >2,000 events
6 Expand R2 bucket to store generated PDF snapshots? Engineering Q2 2027
— END OF TECHNICAL REQUIREMENTS DOCUMENT —

This TRD is the canonical engineering-execution reference for CampusOS. All package.json entries, Supabase migrations, Cloudflare Pages configs, and CI workflows must trace to the version pins, SLAs, and directory conventions defined here. Any deviation requires a Change Request reviewed by the Lead Software Architect and Technical Director. Next revision expected post-Sprint-1 retrospective.

- **Document #01**: 1 Students have smartphones with modern browsers Adoption failure Pre-launch device survey 2 Supabase Free tier (500MB DB, 5GB egress) supports 10,000 users Migration cost Load testing before launch
- **Document #02**: P1 Thumb-First Ergonomics Fixed bottom navigation bar; primary CTAs anchored in bottom 30% of viewport; all tap targets ≥ 44×44 px per WCAG 2.1 AA. P2 Zero-Friction Entry No app store download; no OTP; email + roll number + department is the entire onboarding. Target: <90 seconds from landing to first RSVP.
- **Document #03**: SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
- **Document #04**: SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
- **Document #05**: Architecture Diagram (High-Level) specification was not generated.
- **Document #06**: TRD (Technical Requirements Document) specification was not generated.

You are a Senior Principal Backend Engineer and Database Architect.
Your goal is to write an exhaustive, low-level **Detailed Design Document** (`Detailed Design.md`) providing exact database schemas, class structures, sequence diagrams, and core algorithms.

### DOCUMENT SPECIFICATION:
Generate an exhaustive, code-level **Detailed Design Document** in Markdown.
Avoid hand-waving or abbreviations. Include actual SQL DDL schemas and complete Mermaid sequence diagrams.

Sections required:
1. **Database Schema & Entity Relationship Design**:
- Full **Mermaid ER Diagram** (`erDiagram`).
- Production-ready **PostgreSQL / SQL DDL scripts** for all core tables with:
- Primary keys (UUIDv7 or BigInt), Foreign keys with ON DELETE cascade/restrict
- Column data types, NOT NULL constraints, default values
- Explicit indexes (B-Tree, GIN, unique indexes) for query performance
2. **Domain Models & Class Diagrams**:
- TypeScript/Python/Java interface and class definitions showing domain entity models, value objects, and repository contracts.
3. **Core Transaction Sequence Diagrams (Mermaid)**:
- Diagram 1: Primary user business transaction (e.g. checkout, processing request, content creation).
- Diagram 2: Asynchronous background worker processing / webhook handling.
4. **Caching & Concurrency Control Strategy**:
- Cache key naming conventions, TTL policies, cache invalidation hooks (Cache-Aside pattern).
- Concurrency resolution: Optimistic locking (version columns) vs. Pessimistic locking (SELECT FOR UPDATE) vs. Distributed Redis locks (Redlock).
5. **Error Handling & Retry Protocols**:
- Exponential backoff with jitter algorithm, dead-letter queue (DLQ) mechanics, idempotent transaction request keys.

Write complete, executable SQL and Mermaid code blocks. Begin directly with `# Detailed Design Document (Low-Level Specs)`.
SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY
Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
1 System Prompt: Enterprise SDLC Generation Specification Established CampusOS concept: edge-native PWA bridging campus culture and administrative bureaucracy for RBU Mohali. Defined 4 modules (Event Hub, Clubs Directory, Document Wizard, Status Tracker), $0 cloud architecture (Cloudflare Pages + Supabase Free + R2), PostgreSQL schema (6 tables with RLS), open student auth. React 18, Tailwind CSS, Lucide Icons, Supabase PostgreSQL 15.x/PostgREST/Supavisor, Cloudflare Pages CDN, Cloudflare R2, localStorage sessions
2 Business Requirements Document (BRD) Enterprise business case: quantified pain (4,500 lost student-hrs/yr, 33 staff-hrs/wk wasted), TAM/SAM/SOM (44.6M/500K/10K), 5 OKRs, $0 unit economics, RACI matrix, 8-risk matrix. Consumes system prompt; drives downstream PRD OKRs
3 Product Requirements Document (PRD) Engineering-ready specs: 3 personas, MoSCoW features (FR-001→FR-029), Gherkin AC, NFRs (P95 <200ms, 99.9% uptime, WCAG 2.1 AA), 16 telemetry events, Go/No-Go checklist. Consumes BRD OKRs; establishes FR IDs used throughout
4 User Journey Maps & Interaction Workflows Behavioral blueprint: 3 journey maps, 4 Mermaid flowcharts (onboarding, wizard, failure, state), edge-case playbooks, Information Architecture. Consumes PRD FR IDs; drives React routing, error middleware
5 UI/UX Design Specifications & Component Guide Design system: color/typography/spacing tokens (HEX+HSL), elevation shadows, radius tokens, 8 screen wireframes, component state matrix, responsive breakpoints, motion tokens, print-mode CSS. Consumes journey maps + PRD; drives Tailwind config, Figma library
6 High-Level System Architecture Specification (ARCH-001/002) C4-model architecture: System Context (L1) + Container (L2) diagrams, communication protocol matrix, storage topology, Cloudflare network topology, HA/DR with RPO/RTO targets, 8 ADRs documenting $0-tier trade-offs. Consumes PRD NFRs + UI/UX tokens; drives DB migrations, API contracts
7 Technical Requirements Document (TRD) Pinned versions (React 18.3.1, Vite 5.4.8, TypeScript 5.6.3, Tailwind 3.4.13, Supabase JS 2.45.4), SLAs/SLOs, payload/bundle limits, 4-environment matrix, Clean Architecture directory structure, dependency matrix with fallback strategies, tooling (ESLint 9, Prettier 3, Husky 9, pnpm 9), trunk-based Git strategy, CI/CD workflows. Consumes ARCH-001/002; drives package.json, vite.config.ts, CI workflows
8 (Current) Detailed Design Document (Low-Level Specs) Code-level implementation blueprint: full SQL DDL for all 6 tables with UUIDv7, FK constraints, indexes (B-Tree, GIN, unique), RLS policies, triggers, and stored functions; TypeScript domain models with Zod schemas; repository contracts; 2 production Mermaid sequence diagrams (RSVP write path, application submit + offline flush); cache key naming + TTL strategy (Cache-Aside); concurrency resolution (optimistic + idempotency keys); exponential backoff with jitter; DLQ mechanics. Consumes TRD pinned versions + ARCH-002 container topology; drives supabase/migrations/*.sql, src/services/**/*.ts, src/shared/types/*.ts, queue manager implementation
Project Structure Snapshot:
This document is the eighth artifact and the definitive code-level implementation blueprint for CampusOS. It translates the TRD's pinned stack and ARCH-002's topology into executable SQL DDL, TypeScript domain models, repository contracts, and sequence diagrams that backend and frontend engineers implement verbatim. Every migration file, service module, and type definition in the repo must trace to the schemas, contracts, and algorithms defined herein.

SECTION 2: 🏛️ FULL TECHNICAL SPECIFICATION
Detailed Design Document (Low-Level Specs)
Product: CampusOS — Campus Community & Administrative Automation Platform
Document ID: RBU-CAMPUSOS-DDD-001
Version: 1.0 (Baseline)
Date: October 2026
Owner: Senior Principal Backend Engineer & Database Architect
Status: Ready for Implementation
Upstream Dependencies: RBU-CAMPUSOS-PRD-001, RBU-CAMPUSOS-ARCH-002, RBU-CAMPUSOS-TRD-001

1. Database Schema & Entity Relationship Design
1.1 Entity Relationship Diagram (Mermaid)

1.2 Production PostgreSQL DDL — Migration 001: Profiles
sql
-- ============================================================
-- Migration 001: public.profiles
-- Purpose: Student profile records (open access model)
-- Idempotency: Uses IF NOT EXISTS / CREATE OR REPLACE
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()

CREATE TABLE IF NOT EXISTS public.profiles (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
full_name TEXT NOT NULL
CHECK (char_length(trim(full_name)) BETWEEN 2 AND 120),
email TEXT NOT NULL
CHECK (email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'),
roll_number TEXT NOT NULL
CHECK (roll_number ~ '^[A-Za-z0-9]{6,15}$'),
department TEXT NOT NULL
CHECK (department IN (
'CSE','ECE','ME','CE','EE','IT',
'BBA','BCA','MBA','MCA','B.COM','M.Com','Other'
)),
year_of_study INT NOT NULL
CHECK (year_of_study BETWEEN 1 AND 6),
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
CONSTRAINT profiles_email_unique UNIQUE (email)
);

-- Query patterns: lookup by email (session), by department (future analytics)
CREATE INDEX IF NOT EXISTS idx_profiles_email
ON public.profiles (email);

CREATE INDEX IF NOT EXISTS idx_profiles_department_year
ON public.profiles (department, year_of_study);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
NEW.updated_at := now();
RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

COMMENT ON TABLE public.profiles IS 'CampusOS student profiles (open access)';
COMMENT ON COLUMN public.profiles.email IS 'Canonical identity key for RSVPs and applications';
1.3 Migration 002: Clubs
sql
-- ============================================================
-- Migration 002: public.clubs
-- Purpose: Recognized student societies directory
-- ============================================================

CREATE TABLE IF NOT EXISTS public.clubs (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL
CHECK (char_length(trim(name)) BETWEEN 3 AND 120),
slug TEXT NOT NULL
CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
category TEXT NOT NULL
CHECK (category IN ('Cultural','Technical','Sports','Literary','Social','Other')),
description TEXT NOT NULL
CHECK (char_length(description) BETWEEN 10 AND 2000),
lead_name TEXT NOT NULL,
member_count INT NOT NULL DEFAULT 0
CHECK (member_count >= 0),
icon TEXT, -- Lucide icon name, e.g. 'Users', 'Camera'
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
CONSTRAINT clubs_slug_unique UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_clubs_category
ON public.clubs (category);

-- Trigram index reserved for future full-text search (ADR-005 trigger point)
CREATE INDEX IF NOT EXISTS idx_clubs_name_trgm
ON public.clubs USING GIN (name gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_clubs_updated_at ON public.clubs;
CREATE TRIGGER trg_clubs_updated_at
BEFORE UPDATE ON public.clubs
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

COMMENT ON TABLE public.clubs IS 'Recognized RBU student societies';
1.4 Migration 003: Events
sql
-- ============================================================
-- Migration 003: public.events
-- Purpose: Campus event feed
-- Depends on: public.clubs
-- ============================================================

CREATE TABLE IF NOT EXISTS public.events (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
club_id UUID NOT NULL
REFERENCES public.clubs(id) ON DELETE CASCADE,
title TEXT NOT NULL
CHECK (char_length(trim(title)) BETWEEN 3 AND 160),
category TEXT NOT NULL
CHECK (category IN ('Cultural','Technical','Sports')),
description TEXT NOT NULL
CHECK (char_length(description) BETWEEN 10 AND 3000),
venue TEXT NOT NULL,
event_date TEXT NOT NULL
CHECK (event_date ~ '^\d{4}-\d{2}-\d{2}$'),
event_time TEXT NOT NULL
CHECK (event_time ~ '^\d{2}:\d{2}$'),
rsvp_count INT NOT NULL DEFAULT 0
CHECK (rsvp_count >= 0),
banner_gradient TEXT NOT NULL
CHECK (banner_gradient IN (
'cultural','technical','sports','default'
)),
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feed query: ORDER BY event_date DESC, event_time ASC
CREATE INDEX IF NOT EXISTS idx_events_date_desc
ON public.events (event_date DESC, event_time ASC);

-- Category filter
CREATE INDEX IF NOT EXISTS idx_events_category
ON public.events (category);

-- Join to club (for club detail "upcoming events")
CREATE INDEX IF NOT EXISTS idx_events_club_id
ON public.events (club_id);

DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

COMMENT ON COLUMN public.events.event_date IS 'ISO YYYY-MM-DD stored as TEXT for en-IN formatting on client';
1.5 Migration 004: Event RSVPs
sql
-- ============================================================
-- Migration 004: public.event_rsvps
-- Purpose: Per-student event registrations
-- Depends on: public.events
-- Critical: UNIQUE(event_id, student_email) prevents double-RSVP
-- ============================================================

CREATE TABLE IF NOT EXISTS public.event_rsvps (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
event_id UUID NOT NULL
REFERENCES public.events(id) ON DELETE CASCADE,
student_name TEXT NOT NULL,
student_email TEXT NOT NULL
CHECK (student_email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'),
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
CONSTRAINT event_rsvps_unique_per_student UNIQUE (event_id, student_email)
);

-- Lookup: all RSVPs for an event (organizer CSV export, count validation)
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id
ON public.event_rsvps (event_id);

-- Lookup: all RSVPs by a student (future "My Events" view)
CREATE INDEX IF NOT EXISTS idx_event_rsvps_student_email
ON public.event_rsvps (student_email);

-- ============================================================
-- Trigger: Atomically maintain events.rsvp_count on RSVP changes
-- Uses row-level lock on events row (SELECT ... FOR UPDATE)
-- ============================================================
CREATE OR REPLACE FUNCTION public.tg_sync_rsvp_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
IF (TG_OP = 'INSERT') THEN
UPDATE public.events
SET rsvp_count = rsvp_count + 1
WHERE id = NEW.event_id;
RETURN NEW;
ELSIF (TG_OP = 'DELETE') THEN
UPDATE public.events
SET rsvp_count = GREATEST(rsvp_count - 1, 0)
WHERE id = OLD.event_id;
RETURN OLD;
END IF;
RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_rsvp_count_insert ON public.event_rsvps;
CREATE TRIGGER trg_rsvp_count_insert
AFTER INSERT ON public.event_rsvps
FOR EACH ROW EXECUTE FUNCTION public.tg_sync_rsvp_count();

DROP TRIGGER IF EXISTS trg_rsvp_count_delete ON public.event_rsvps;
CREATE TRIGGER trg_rsvp_count_delete
AFTER DELETE ON public.event_rsvps
FOR EACH ROW EXECUTE FUNCTION public.tg_sync_rsvp_count();

COMMENT ON TABLE public.event_rsvps IS 'Student RSVPs; UNIQUE(event_id, student_email) enforces idempotency';
1.6 Migration 005: Document Applications
sql
-- ============================================================
-- Migration 005: public.document_applications
-- Purpose: Generated letterhead wizard submissions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.document_applications (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
doc_type TEXT NOT NULL
CHECK (doc_type IN ('venue','financial','noc')),
title TEXT NOT NULL,
student_name TEXT NOT NULL,
roll_number TEXT NOT NULL,
department TEXT NOT NULL,
target_authority TEXT NOT NULL,
status TEXT NOT NULL DEFAULT 'Pending Review'
CHECK (status IN ('Pending Review','Approved','Rejected','Expired')),
created_date TEXT NOT NULL, -- "15 November 2026" (en-IN display)
form_data JSONB NOT NULL DEFAULT '{}'::jsonb
CHECK (pg_column_size(form_data) < 102400), -- < 100 KB
tracking_ref TEXT NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
CONSTRAINT document_applications_tracking_ref_unique UNIQUE (tracking_ref)
);

-- Tracker dashboard query: per-student listing, newest first
CREATE INDEX IF NOT EXISTS idx_doc_apps_student_email
ON public.document_applications ((form_data->>'email'), created_at DESC);

-- Status filter
CREATE INDEX IF NOT EXISTS idx_doc_apps_status
ON public.document_applications (status);

-- GIN index for JSONB form_data queries (future analytics, filtering by field)
CREATE INDEX IF NOT EXISTS idx_doc_apps_form_data_gin
ON public.document_applications USING GIN (form_data jsonb_path_ops);

-- Tracking ref B-tree (unique already creates index; named for clarity)
CREATE INDEX IF NOT EXISTS idx_doc_apps_tracking_ref
ON public.document_applications (tracking_ref);

DROP TRIGGER IF EXISTS trg_doc_apps_updated_at ON public.document_applications;
CREATE TRIGGER trg_doc_apps_updated_at
BEFORE UPDATE ON public.document_applications
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============================================================
-- Function: Generate tracking REF ID with atomic sequence
-- Format: RBU/<DEPT_OR_DSW>/<YYYY>/<TYPE>-<SEQ4>
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS public.doc_app_seq START 1 INCREMENT 1;

CREATE OR REPLACE FUNCTION public.generate_tracking_ref(
p_doc_type TEXT,
p_department TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
v_authority_code TEXT;
v_type_code TEXT;
v_year TEXT;
v_seq TEXT;
BEGIN
v_authority_code := CASE
WHEN p_doc_type = 'venue' THEN 'DSW'
WHEN p_doc_type = 'financial' THEN 'FAC'
WHEN p_doc_type = 'noc' THEN COALESCE(NULLIF(p_department,''),'GEN')
ELSE 'GEN'
END;

v_type_code := CASE p_doc_type
WHEN 'venue' THEN 'PERM'
WHEN 'financial' THEN 'FIN'
WHEN 'noc' THEN 'NOC'
ELSE 'GEN'
END;

v_year := to_char(now(), 'YYYY');
v_seq := lpad(nextval('public.doc_app_seq')::text, 4, '0');

RETURN format('RBU/%s/%s/%s-%s', v_authority_code, v_year, v_type_code, v_seq);
END;
$$;

COMMENT ON FUNCTION public.generate_tracking_ref IS 'Produces RBU/DSW/2026/PERM-0042 style tracking IDs';
1.7 Migration 006: Row Level Security Policies
sql
-- ============================================================
-- Migration 006: RLS policies (defense in depth)
-- Year 1 model: open read on clubs/events; scoped writes
-- Year 2 (post Supabase Auth migration): tighten per-user reads
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_applications ENABLE ROW LEVEL SECURITY;

-- ---- profiles -------------------------------------------------
DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;
CREATE POLICY profiles_insert_self ON public.profiles
FOR INSERT
WITH CHECK (true); -- open access; validated by column CHECKs

DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
CREATE POLICY profiles_select_all ON public.profiles
FOR SELECT
USING (true); -- open directory; no PII beyond name/email/roll

DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
CREATE POLICY profiles_update_self ON public.profiles
FOR UPDATE
USING (true)
WITH CHECK (true);

-- ---- clubs ---------------------------------------------------
DROP POLICY IF EXISTS clubs_public_read ON public.clubs;
CREATE POLICY clubs_public_read ON public.clubs
FOR SELECT
USING (true);

DROP POLICY IF EXISTS clubs_admin_write ON public.clubs;
CREATE POLICY clubs_admin_write ON public.clubs
FOR ALL
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ---- events --------------------------------------------------
DROP POLICY IF EXISTS events_public_read ON public.events;
CREATE POLICY events_public_read ON public.events
FOR SELECT
USING (true);

DROP POLICY IF EXISTS events_organizer_write ON public.events;
CREATE POLICY events_organizer_write ON public.events
FOR ALL
USING (auth.jwt() ->> 'role' IN ('organizer','admin'))
WITH CHECK (auth.jwt() ->> 'role' IN ('organizer','admin'));

-- ---- event_rsvps --------------------------------------------
DROP POLICY IF EXISTS rsvps_public_read ON public.event_rsvps;
CREATE POLICY rsvps_public_read ON public.event_rsvps
FOR SELECT
USING (true);

DROP POLICY IF EXISTS rsvps_self_insert ON public.event_rsvps;
CREATE POLICY rsvps_self_insert ON public.event_rsvps
FOR INSERT
WITH CHECK (
-- If JWT present, enforce email match; else allow (open model)
auth.jwt() IS NULL
OR auth.jwt() ->> 'email' = student_email
);

DROP POLICY IF EXISTS rsvps_self_delete ON public.event_rsvps;
CREATE POLICY rsvps_self_delete ON public.event_rsvps
FOR DELETE
USING (
auth.jwt() IS NULL
OR auth.jwt() ->> 'email' = student_email
);

-- ---- document_applications ----------------------------------
DROP POLICY IF EXISTS doc_apps_self_read ON public.document_applications;
CREATE POLICY doc_apps_self_read ON public.document_applications
FOR SELECT
USING (
auth.jwt() IS NULL
OR auth.jwt() ->> 'email' = (form_data ->> 'email')
);

DROP POLICY IF EXISTS doc_apps_self_insert ON public.document_applications;
CREATE POLICY doc_apps_self_insert ON public.document_applications
FOR INSERT
WITH CHECK (
auth.jwt() IS NULL
OR auth.jwt() ->> 'email' = (form_data ->> 'email')
);

DROP POLICY IF EXISTS doc_apps_admin_update ON public.document_applications;
CREATE POLICY doc_apps_admin_update ON public.document_applications
FOR UPDATE
USING (auth.jwt() ->> 'role' IN ('admin','hod','dsw'))
WITH CHECK (auth.jwt() ->> 'role' IN ('admin','hod','dsw'));
1.8 Migration 007: Performance Indexes Summary
sql
-- Consolidated index reference (all created in prior migrations)
-- See each table's migration for rationale.

-- profiles
-- idx_profiles_email B-Tree (email)
-- idx_profiles_department_year B-Tree (department, year_of_study)

-- clubs
-- idx_clubs_category B-Tree (category)
-- idx_clubs_name_trgm GIN (name gin_trgm_ops)

-- events
-- idx_events_date_desc B-Tree (event_date DESC, event_time ASC)
-- idx_events_category B-Tree (category)
-- idx_events_club_id B-Tree (club_id)

-- event_rsvps
-- event_rsvps_unique_per_student UNIQUE (event_id, student_email)
-- idx_event_rsvps_event_id B-Tree (event_id)
-- idx_event_rsvps_student_email B-Tree (student_email)

-- document_applications
-- document_applications_tracking_ref_unique UNIQUE (tracking_ref)
-- idx_doc_apps_student_email B-Tree (form_data->>'email', created_at DESC)
-- idx_doc_apps_status B-Tree (status)
-- idx_doc_apps_form_data_gin GIN (form_data jsonb_path_ops)
1.9 Migration 008: Seed Data
sql
-- ============================================================
-- Migration 008: Initial seed data (idempotent upserts)
-- ============================================================

INSERT INTO public.clubs (name, slug, category, description, lead_name, member_count, icon)
VALUES
('Raunak Cultural Society','raunak-cultural','Cultural',
'RBU''s flagship cultural society organizing UTSAV, Lohri, and inter-college festivals.',
'Simran Kaur',340,'Music'),
('RBU Tech Council','rbu-tech','Technical',
'Student-led technical community hosting HackCampus, coding bootcamps, and open-source sprints.',
'Aaravpreet Singh',180,'Code'),
('Shotter Jam','shotter-jam','Cultural',
'Photography and cinematography society covering campus events and photo walks.',
'Riya Sharma',120,'Camera'),
('Inkwell Society','inkwell','Literary',
'Literary and debating society hosting poetry slams, MUNs, and creative writing workshops.',
'Kabir Malhotra',95,'PenTool'),
('RBU Sports Union','sports-union','Sports',
'Inter-department cricket, football, athletics, and annual sports meet coordination.',
'Vikram Singh',220,'Trophy')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.events (club_id, title, category, description, venue, event_date, event_time, banner_gradient)
SELECT c.id, 'UTSAV 2026 Cultural Night','Cultural',
'Annual flagship cultural festival featuring music, dance, and drama performances.',
'Main Auditorium','2026-11-15','18:00','cultural'
FROM public.clubs c WHERE c.slug = 'raunak-cultural'
ON CONFLICT DO NOTHING;

INSERT INTO public.events (club_id, title, category, description, venue, event_date, event_time, banner_gradient)
SELECT c.id, 'HackCampus 2026','Technical',
'36-hour hackathon with tracks in EdTech, FinTech, and campus automation.',
'CS Block Lab 4','2026-11-22','09:00','technical'
FROM public.clubs c WHERE c.slug = 'rbu-tech'
ON CONFLICT DO NOTHING;
2. Domain Models & Class Diagrams
2.1 Domain Entity Models (TypeScript)
typescript
// src/shared/types/app.types.ts
// Domain layer — no framework dependencies, no Supabase imports.

export type Department =
| 'CSE' | 'ECE' | 'ME' | 'CE' | 'EE' | 'IT'
| 'BBA' | 'BCA' | 'MBA' | 'MCA' | 'B.COM' | 'M.Com' | 'Other';

export type ClubCategory =
| 'Cultural' | 'Technical' | 'Sports' | 'Literary' | 'Social' | 'Other';

export type EventCategory = 'Cultural' | 'Technical' | 'Sports';

export type BannerGradient = 'cultural' | 'technical' | 'sports' | 'default';

export type DocType = 'venue' | 'financial' | 'noc';

export type ApplicationStatus =
| 'Pending Review' | 'Approved' | 'Rejected' | 'Expired';

export type TargetAuthority =
| 'Dean of Student Welfare'
| 'Financial Aid Committee'
| 'Head of Department';

// ---- Profile -------------------------------------------------

export interface Profile {
readonly id: string;
readonly fullName: string;
readonly email: string;
readonly rollNumber: string;
readonly department: Department;
readonly yearOfStudy: number;
readonly createdAt: string; // ISO 8601
}

export interface CreateProfileInput {
fullName: string;
email: string;
rollNumber: string;
department: Department;
yearOfStudy: number;
}

// ---- Club ----------------------------------------------------

export interface Club {
readonly id: string;
readonly name: string;
readonly slug: string;
readonly category: ClubCategory;
readonly description: string;
readonly leadName: string;
readonly memberCount: number;
readonly icon: string | null;
}

// ---- Event ---------------------------------------------------

export interface CampusEvent {
readonly id: string;
readonly clubId: string;
readonly title: string;
readonly category: EventCategory;
readonly description: string;
readonly venue: string;
readonly eventDate: string; // "YYYY-MM-DD"
readonly eventTime: string; // "HH:MM"
readonly rsvpCount: number;
readonly bannerGradient: BannerGradient;
}

// ---- RSVP ----------------------------------------------------

export interface EventRsvp {
readonly id: string;
readonly eventId: string;
readonly studentName: string;
readonly studentEmail: string;
readonly createdAt: string;
}

// ---- Application ---------------------------------------------

export interface DocumentApplication {
readonly id: string;
readonly docType: DocType;
readonly title: string;
readonly studentName: string;
readonly rollNumber: string;
readonly department: Department;
readonly targetAuthority: TargetAuthority;
readonly status: ApplicationStatus;
readonly createdDate: string;
readonly trackingRef: string;
readonly formData: Record<string, unknown>;
readonly createdAt: string;
}

export interface CreateApplicationInput {
docType: DocType;
title: string;
studentName: string;
rollNumber: string;
department: Department;
email: string;
targetAuthority: TargetAuthority;
formData: Record<string, unknown>;
}
2.2 Zod Validation Schemas
typescript
// src/features/onboarding/schemas.ts
import { z } from 'zod';
import { DEPARTMENTS } from '@shared/lib/constants';

export const profileCreateSchema = z.object({
fullName: z.string().trim().min(2).max(120),
email: z.string().trim().toLowerCase().email(),
rollNumber: z.string().trim().regex(/^[A-Za-z0-9]{6,15}$/, {
message: 'Roll number must be 6–15 alphanumeric characters',
}),
department: z.enum(DEPARTMENTS),
yearOfStudy: z.number().int().min(1).max(6),
});

export type ProfileCreateInput = z.infer<typeof profileCreateSchema>;

// src/features/wizard/schemas.ts
const baseAppSchema = z.object({
studentName: z.string().trim().min(2).max(120),
rollNumber: z.string().trim().regex(/^[A-Za-z0-9]{6,15}$/),
department: z.enum(DEPARTMENTS),
email: z.string().trim().toLowerCase().email(),
});

export const venueApplicationSchema = baseAppSchema.extend({
docType: z.literal('venue'),
title: z.string().trim().min(3).max(160),
eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
eventTime: z.string().regex(/^\d{2}:\d{2}$/),
venue: z.string().trim().min(2).max(160),
expectedAttendance: z.number().int().min(1).max(5000),
description: z.string().trim().max(2000).optional(),
targetAuthority: z.literal('Dean of Student Welfare'),
});

export const financialApplicationSchema = baseAppSchema.extend({
docType: z.literal('financial'),
title: z.string().trim().min(3).max(160),
cgpa: z.number().min(0).max(10),
familyIncome: z.number().int().min(0),
requestedAmount: z.number().int().min(0),
reason: z.string().trim().min(10).max(2000),
targetAuthority: z.literal('Financial Aid Committee'),
});

export const nocApplicationSchema = baseAppSchema.extend({
docType: z.literal('noc'),
title: z.string().trim().min(3).max(160),
examName: z.string().trim().min(2).max(120),
examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
reasonForAbsence: z.string().trim().min(10).max(2000),
supportingEvidenceUrl: z.string().url().optional(),
targetAuthority: z.literal('Head of Department'),
});

export const applicationSchema = z.discriminatedUnion('docType', [
venueApplicationSchema,
financialApplicationSchema,
nocApplicationSchema,
]);
2.3 Repository Contracts
typescript
// src/services/api/contracts.ts
// Repository pattern: features import from here, never from @supabase/supabase-js.

import type {
Profile, CreateProfileInput,
Club,
CampusEvent, EventCategory,
DocumentApplication, CreateApplicationInput,
ApplicationStatus,
} from '@shared/types/app.types';

export interface ProfileRepository {
create(input: CreateProfileInput): Promise<Profile>;
findByEmail(email: string): Promise<Profile | null>;
update(id: string, patch: Partial<CreateProfileInput>): Promise<Profile>;
}

export interface ClubRepository {
list(): Promise<Club[]>;
findBySlug(slug: string): Promise<Club | null>;
}

export interface EventRepository {
list(category?: EventCategory | 'All'): Promise<CampusEvent[]>;
findById(id: string): Promise<CampusEvent | null>;
}

export interface RsvpRepository {
/** Idempotent: UNIQUE(event_id, student_email) makes repeated inserts safe. */
create(eventId: string, studentName: string, studentEmail: string): Promise<void>;
delete(eventId: string, studentEmail: string): Promise<void>;
exists(eventId: string, studentEmail: string): Promise<boolean>;
listByEvent(eventId: string): Promise<Array<{ studentName: string; studentEmail: string; createdAt: string }>>;
}

export interface ApplicationRepository {
create(input: CreateApplicationInput, trackingRef: string): Promise<DocumentApplication>;
listByEmail(email: string): Promise<DocumentApplication[]>;
findById(id: string): Promise<DocumentApplication | null>;
updateStatus(id: string, status: ApplicationStatus): Promise<void>;
}
2.4 Supabase Mapper (Infrastructure Layer)
typescript
// src/services/api/mappers.ts
// Converts snake_case DB rows → camelCase domain models.
// Only this file knows the DB schema shape.

import type { Database } from '@shared/types/database.types';
import type { Profile, Club, CampusEvent, DocumentApplication } from '@shared/types/app.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ClubRow = Database['public']['Tables']['clubs']['Row'];
type EventRow = Database['public']['Tables']['events']['Row'];
type AppRow = Database['public']['Tables']['document_applications']['Row'];

export const toProfile = (r: ProfileRow): Profile => ({
id: r.id,
fullName: r.full_name,
email: r.email,
rollNumber: r.roll_number,
department: r.department as Profile['department'],
yearOfStudy: r.year_of_study,
createdAt: r.created_at,
});

export const toClub = (r: ClubRow): Club => ({
id: r.id,
name: r.name,
slug: r.slug,
category: r.category as Club['category'],
description: r.description,
leadName: r.lead_name,
memberCount: r.member_count,
icon: r.icon,
});

export const toEvent = (r: EventRow): CampusEvent => ({
id: r.id,
clubId: r.club_id,
title: r.title,
category: r.category as CampusEvent['category'],
description: r.description,
venue: r.venue,
eventDate: r.event_date,
eventTime: r.event_time,
rsvpCount: r.rsvp_count,
bannerGradient: r.banner_gradient as CampusEvent['bannerGradient'],
});

export const toApplication = (r: AppRow): DocumentApplication => ({
id: r.id,
docType: r.doc_type as DocumentApplication['docType'],
title: r.title,
studentName: r.student_name,
rollNumber: r.roll_number,
department: r.department as DocumentApplication['department'],
targetAuthority: r.target_authority as DocumentApplication['targetAuthority'],
status: r.status as DocumentApplication['status'],
createdDate: r.created_date,
trackingRef: r.tracking_ref,
formData: r.form_data as Record<string, unknown>,
createdAt: r.created_at,
});
3. Core Transaction Sequence Diagrams (Mermaid)
3.1 Diagram 1: RSVP Write Path (Happy Path + Idempotency + Offline Fallback)
====================================================================
MANDATORY TWO-SECTION RESPONSE FORMAT (CRITICAL MEMORY ANCHOR)
====================================================================
Because this project spans multiple deep architectural phases and LLM context windows can drift, you MUST structure your response into EXACTLY TWO SECTIONS:

Write complete, executable SQL and Mermaid code blocks. Begin directly with `# Detailed Design Document (Low-Level Specs)`.
SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY
Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
1 System Prompt: Enterprise SDLC Generation Specification Established CampusOS concept: edge-native PWA bridging campus culture and administrative bureaucracy for RBU Mohali. Defined 4 modules (Event Hub, Clubs Directory, Document Wizard, Status Tracker), $0 cloud architecture (Cloudflare Pages + Supabase Free + R2), PostgreSQL schema (6 tables with RLS), open student auth. React 18, Tailwind CSS, Lucide Icons, Supabase PostgreSQL 15.x/PostgREST/Supavisor, Cloudflare Pages CDN, Cloudflare R2, localStorage sessions
2 Business Requirements Document (BRD) Enterprise business case: quantified pain (4,500 lost student-hrs/yr, 33 staff-hrs/wk wasted), TAM/SAM/SOM (44.6M/500K/10K), 5 OKRs, $0 unit economics, RACI matrix, 8-risk matrix. Consumes system prompt; drives downstream PRD OKRs
3 Product Requirements Document (PRD) Engineering-ready specs: 3 personas, MoSCoW features (FR-001→FR-029), Gherkin AC, NFRs (P95 <200ms, 99.9% uptime, WCAG 2.1 AA), 16 telemetry events, Go/No-Go checklist. Consumes BRD OKRs; establishes FR IDs used throughout
4 User Journey Maps & Interaction Workflows Behavioral blueprint: 3 journey maps, 4 Mermaid flowcharts (onboarding, wizard, failure, state), edge-case playbooks, Information Architecture. Consumes PRD FR IDs; drives React routing, error middleware
5 UI/UX Design Specifications & Component Guide Design system: color/typography/spacing tokens (HEX+HSL), elevation shadows, radius tokens, 8 screen wireframes, component state matrix, responsive breakpoints, motion tokens, print-mode CSS. Consumes journey maps + PRD; drives Tailwind config, Figma library
6 High-Level System Architecture (ARCH-001/002) C4-model architecture: System Context (L1) + Container (L2) + Component (L3) diagrams, communication protocol matrix, storage topology, Cloudflare network topology, HA/DR with RPO/RTO targets, 8 ADRs documenting $0-tier trade-offs, FR-to-container traceability. Consumes PRD NFRs + UI/UX tokens; drives DB migrations, API contracts
7 Technical Requirements Document (TRD) Pinned versions (React 18.3.1, Vite 5.4.8, TypeScript 5.6.3, Tailwind 3.4.13, Supabase JS 2.45.4, pnpm 9.12.0, Node 20.18.0), SLAs/SLOs (P95 <200ms, P99 <500ms), payload/bundle limits (250 KB), 4-environment matrix, Clean Architecture directory, tooling (ESLint 9, Prettier 3, Husky 9), trunk-based Git strategy, CI/CD workflows. Consumes ARCH-001/002; drives package.json, vite.config.ts, CI workflows
8 (Current) Detailed Design Document (Low-Level Specs) Code-level implementation blueprint: full SQL DDL for all 6 tables with UUID PK, FK constraints, CHECK constraints, indexes (B-Tree, GIN trigram, GIN jsonb_path_ops), RLS policies (5 tables), triggers (updated_at, rsvp_count sync), stored functions (generate_tracking_ref), seed data; TypeScript domain models with Zod schemas and repository contracts; 2 production Mermaid sequence diagrams (RSVP write path, application submit + offline flush); cache key naming + TTL strategy (Cache-Aside with edge/Service Worker layers); concurrency resolution (unique constraint + trigger + optimistic UI); exponential backoff with jitter algorithm; localStorage-backed DLQ mechanics; idempotency key strategy. Consumes TRD pinned versions + ARCH-002 container topology; drives supabase/migrations/001–008_*.sql, src/services/**/*.ts, src/shared/types/*.ts, queue manager implementation, telemetry service
Project Structure Snapshot:
This document is the eighth artifact and the definitive code-level implementation blueprint for CampusOS. It translates the TRD's pinned stack and ARCH-002's topology into executable SQL DDL, TypeScript domain models, repository contracts, sequence diagrams, and algorithmic specifications that backend and frontend engineers implement verbatim. Every migration file, service module, and type definition in the repo must trace to the schemas, contracts, and algorithms defined herein.

1.2 Migration 000: Extensions & Shared Utilities
sql
-- ============================================================
-- Migration 000: Extensions & shared helper functions
-- Must run first — all other migrations depend on this
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- GIN trigram search

-- Auto-update `updated_at` columns on UPDATE
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
NEW.updated_at := now();
RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.tg_set_updated_at IS
'Reusable trigger function to bump updated_at on row UPDATE';
1.3 Migration 001: public.profiles
sql
-- ============================================================
-- Migration 001: public.profiles
-- Purpose: Student profile records (open access model)
-- ============================================================

-- Query path: session lookup by email (most frequent)
CREATE INDEX IF NOT EXISTS idx_profiles_email
ON public.profiles (email);

-- Query path: future department analytics
CREATE INDEX IF NOT EXISTS idx_profiles_department_year
ON public.profiles (department, year_of_study);

COMMENT ON TABLE public.profiles IS 'CampusOS student profiles (open access, email is canonical key)';
COMMENT ON COLUMN public.profiles.email IS 'Canonical identity for RSVPs and applications';
1.4 Migration 002: public.clubs
sql
-- ============================================================
-- Migration 002: public.clubs
-- Purpose: Recognized student societies directory
-- ============================================================

CREATE TABLE IF NOT EXISTS public.clubs (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL
CHECK (char_length(trim(name)) BETWEEN 3 AND 120),
slug TEXT NOT NULL
CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
category TEXT NOT NULL
CHECK (category IN (
'Cultural','Technical','Sports',
'Literary','Social','Other'
)),
description TEXT NOT NULL
CHECK (char_length(description) BETWEEN 10 AND 2000),
lead_name TEXT NOT NULL,
member_count INT NOT NULL DEFAULT 0
CHECK (member_count >= 0),
icon TEXT, -- Lucide icon name, e.g. 'Users', 'Camera'
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
CONSTRAINT clubs_slug_unique UNIQUE (slug)
);

-- Reserved for future full-text search (ADR-005 trigger: > 2000 events)
CREATE INDEX IF NOT EXISTS idx_clubs_name_trgm
ON public.clubs USING GIN (name gin_trgm_ops);

COMMENT ON TABLE public.clubs IS 'Recognized RBU student societies';
1.5 Migration 003: public.events
sql
-- ============================================================
-- Migration 003: public.events
-- Purpose: Campus event feed
-- Depends on: public.clubs
-- ============================================================

CREATE TABLE IF NOT EXISTS public.events (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
club_id UUID NOT NULL
REFERENCES public.clubs(id) ON DELETE CASCADE,
title TEXT NOT NULL
CHECK (char_length(trim(title)) BETWEEN 3 AND 160),
category TEXT NOT NULL
CHECK (category IN ('Cultural','Technical','Sports')),
description TEXT NOT NULL
CHECK (char_length(description) BETWEEN 10 AND 3000),
venue TEXT NOT NULL,
event_date TEXT NOT NULL
CHECK (event_date ~ '^\d{4}-\d{2}-\d{2}$'),
event_time TEXT NOT NULL
CHECK (event_time ~ '^([01]\d|2[0-3]):[0-5]\d$'),
rsvp_count INT NOT NULL DEFAULT 0
CHECK (rsvp_count >= 0),
banner_gradient TEXT NOT NULL
CHECK (banner_gradient IN (
'cultural','technical','sports','default'
)),
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Category filter on feed
CREATE INDEX IF NOT EXISTS idx_events_category
ON public.events (category);

-- Join to club (club detail "upcoming events")
CREATE INDEX IF NOT EXISTS idx_events_club_id
ON public.events (club_id);

-- Composite index for feed with category filter + ordering
CREATE INDEX IF NOT EXISTS idx_events_category_date
ON public.events (category, event_date DESC, event_time ASC);

COMMENT ON COLUMN public.events.event_date IS
'ISO YYYY-MM-DD stored as TEXT; formatted to en-IN locale on client';
COMMENT ON COLUMN public.events.event_time IS
'HH:MM 24-hour; formatted to 12-hour with AM/PM on client';
1.6 Migration 004: public.event_rsvps + RSVP Count Trigger
sql
-- ============================================================
-- Migration 004: public.event_rsvps
-- Purpose: Per-student event registrations
-- Critical: UNIQUE(event_id, student_email) enforces idempotency
-- ============================================================

CREATE TABLE IF NOT EXISTS public.event_rsvps (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
event_id UUID NOT NULL
REFERENCES public.events(id) ON DELETE CASCADE,
student_name TEXT NOT NULL
CHECK (char_length(trim(student_name)) BETWEEN 2 AND 120),
student_email TEXT NOT NULL
CHECK (student_email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'),
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
CONSTRAINT event_rsvps_unique_per_student UNIQUE (event_id, student_email)
);

-- Organizer CSV export: all RSVPs for an event
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id
ON public.event_rsvps (event_id);

-- Future "My Events" view: all RSVPs by a student
CREATE INDEX IF NOT EXISTS idx_event_rsvps_student_email
ON public.event_rsvps (student_email);

-- ============================================================
-- Trigger: Atomically maintain events.rsvp_count
-- Uses row-level lock (UPDATE takes lock automatically)
-- GREATEST(..., 0) guards against negative counts from
-- concurrent DELETE + UPDATE races
-- ============================================================
CREATE OR REPLACE FUNCTION public.tg_sync_rsvp_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
IF (TG_OP = 'INSERT') THEN
UPDATE public.events
SET rsvp_count = rsvp_count + 1
WHERE id = NEW.event_id;
RETURN NEW;
ELSIF (TG_OP = 'DELETE') THEN
UPDATE public.events
SET rsvp_count = GREATEST(rsvp_count - 1, 0)
WHERE id = OLD.event_id;
RETURN OLD;
END IF;
RETURN NULL;
END;
$$;

COMMENT ON TABLE public.event_rsvps IS
'Student RSVPs; UNIQUE(event_id, student_email) enforces idempotency';
1.7 Migration 005: public.document_applications + Tracking Ref Function
sql
-- ============================================================
-- Migration 005: public.document_applications
-- Purpose: Generated letterhead wizard submissions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.document_applications (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
doc_type TEXT NOT NULL
CHECK (doc_type IN ('venue','financial','noc')),
title TEXT NOT NULL
CHECK (char_length(trim(title)) BETWEEN 3 AND 160),
student_name TEXT NOT NULL,
roll_number TEXT NOT NULL,
department TEXT NOT NULL,
target_authority TEXT NOT NULL
CHECK (target_authority IN (
'Dean of Student Welfare',
'Financial Aid Committee',
'Head of Department'
)),
status TEXT NOT NULL DEFAULT 'Pending Review'
CHECK (status IN (
'Pending Review','Approved','Rejected','Expired'
)),
created_date TEXT NOT NULL, -- "15 November 2026" (en-IN display)
form_data JSONB NOT NULL DEFAULT '{}'::jsonb
CHECK (pg_column_size(form_data) < 102400), -- < 100 KB
tracking_ref TEXT NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
CONSTRAINT document_applications_tracking_ref_unique UNIQUE (tracking_ref)
);

-- Tracker dashboard: per-student listing, newest first
CREATE INDEX IF NOT EXISTS idx_doc_apps_student_email
ON public.document_applications ((form_data->>'email'), created_at DESC);

-- Status filter (future admin dashboard)
CREATE INDEX IF NOT EXISTS idx_doc_apps_status
ON public.document_applications (status);

-- GIN index for JSONB containment queries (future analytics)
CREATE INDEX IF NOT EXISTS idx_doc_apps_form_data_gin
ON public.document_applications USING GIN (form_data jsonb_path_ops);

-- Tracking ref reverse lookup (student asks "what is my REF?")
CREATE INDEX IF NOT EXISTS idx_doc_apps_tracking_ref
ON public.document_applications (tracking_ref);

-- ============================================================
-- Sequence for tracking ref numbering (global across years;
-- reset planned for Y2027 via one-off migration)
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS public.doc_app_seq START 1 INCREMENT 1;

-- ============================================================
-- Function: Generate tracking REF ID
-- Format: RBU/<AUTH>/<YYYY>/<TYPE>-<SEQ4>
-- Examples: RBU/DSW/2026/PERM-0042, RBU/CSE/2026/NOC-0018
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_tracking_ref(
p_doc_type TEXT,
p_department TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
v_authority_code TEXT;
v_type_code TEXT;
v_year TEXT;
v_seq TEXT;
BEGIN
v_authority_code := CASE p_doc_type
WHEN 'venue' THEN 'DSW'
WHEN 'financial' THEN 'FAC'
WHEN 'noc' THEN COALESCE(NULLIF(trim(p_department), ''), 'GEN')
ELSE 'GEN'
END;

COMMENT ON FUNCTION public.generate_tracking_ref IS
'Produces RBU/DSW/2026/PERM-0042 style tracking IDs';
1.8 Migration 006: Row Level Security Policies
sql
-- ============================================================
-- Migration 006: RLS policies (defense in depth)
-- Year 1 model: open read on clubs/events; scoped writes.
-- Year 2 (post Supabase Auth migration): tighten per-user reads.
-- NOTE: auth.jwt() IS NULL check allows the open-access model;
-- remove in Year 2 when magic-link auth is mandatory.
-- ============================================================

-- ---- profiles -------------------------------------------------
DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;
CREATE POLICY profiles_insert_self ON public.profiles
FOR INSERT
WITH CHECK (true); -- column CHECKs enforce format

DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
CREATE POLICY profiles_select_all ON public.profiles
FOR SELECT
USING (true);

DROP POLICY IF EXISTS rsvps_self_insert ON public.event_rsvps;
CREATE POLICY rsvps_self_insert ON public.event_rsvps
FOR INSERT
WITH CHECK (
auth.jwt() IS NULL
OR auth.jwt() ->> 'email' = student_email
);

DROP POLICY IF EXISTS doc_apps_admin_update ON public.document_applications;
CREATE POLICY doc_apps_admin_update ON public.document_applications
FOR UPDATE
USING (auth.jwt() ->> 'role' IN ('admin','hod','dsw'))
WITH CHECK (auth.jwt() ->> 'role' IN ('admin','hod','dsw'));
1.9 Migration 007: RPC Wrappers (PostgREST-Exposed Functions)
sql
-- ============================================================
-- Migration 007: RPC wrappers for atomic multi-step operations
-- PostgREST exposes these at POST /rest/v1/rpc/<name>
-- ============================================================

-- Atomically insert an application with server-generated tracking_ref
CREATE OR REPLACE FUNCTION public.submit_document_application(
p_doc_type TEXT,
p_title TEXT,
p_student_name TEXT,
p_roll_number TEXT,
p_department TEXT,
p_target_authority TEXT,
p_form_data JSONB
)
RETURNS TABLE (id UUID, tracking_ref TEXT)
LANGUAGE plpgsql
SECURITY INVOKER -- runs under caller's role; RLS still applies
AS $$
DECLARE
v_ref TEXT;
v_id UUID;
BEGIN
v_ref := public.generate_tracking_ref(p_doc_type, p_department);

INSERT INTO public.document_applications (
doc_type, title, student_name, roll_number, department,
target_authority, status, created_date, form_data, tracking_ref
)
VALUES (
p_doc_type, p_title, p_student_name, p_roll_number, p_department,
p_target_authority, 'Pending Review',
to_char(now(), 'DD FMMonth YYYY'), -- "15 November 2026"
p_form_data,
v_ref
)
RETURNING document_applications.id INTO v_id;

RETURN QUERY SELECT v_id, v_ref;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_document_application(
TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) TO anon, authenticated;

COMMENT ON FUNCTION public.submit_document_application IS
'Atomic submit + tracking_ref generation; single round-trip from client';
1.10 Migration 008: Seed Data
sql
-- ============================================================
-- Migration 008: Initial seed data (idempotent upserts)
-- ============================================================

INSERT INTO public.events
(club_id, title, category, description, venue, event_date, event_time, banner_gradient)
SELECT c.id, 'HackCampus 2026','Technical',
'36-hour hackathon with tracks in EdTech, FinTech, and campus automation.',
'CS Block Lab 4','2026-11-22','09:00','technical'
FROM public.clubs c WHERE c.slug = 'rbu-tech'
ON CONFLICT DO NOTHING;

INSERT INTO public.events
(club_id, title, category, description, venue, event_date, event_time, banner_gradient)
SELECT c.id, 'RBU Cricket League Finals','Sports',
'Inter-department cricket tournament finals; trophy ceremony follows.',
'Main Ground','2026-11-30','14:00','sports'
FROM public.clubs c WHERE c.slug = 'sports-union'
ON CONFLICT DO NOTHING;
2. Domain Models & Class Diagrams
2.1 Domain Entity Models (TypeScript)
typescript
// src/shared/types/app.types.ts
// Domain layer — no framework dependencies, no Supabase imports.

export const DEPARTMENTS = [
'CSE','ECE','ME','CE','EE','IT',
'BBA','BCA','MBA','MCA','B.Com','M.Com','Other',
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const CLUB_CATEGORIES = [
'Cultural','Technical','Sports','Literary','Social','Other',
] as const;
export type ClubCategory = (typeof CLUB_CATEGORIES)[number];

export const EVENT_CATEGORIES = ['Cultural','Technical','Sports'] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const BANNER_GRADIENTS = ['cultural','technical','sports','default'] as const;
export type BannerGradient = (typeof BANNER_GRADIENTS)[number];

export const DOC_TYPES = ['venue','financial','noc'] as const;
export type DocType = (typeof DOC_TYPES)[number];

export const APPLICATION_STATUSES = [
'Pending Review','Approved','Rejected','Expired',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const TARGET_AUTHORITIES = [
'Dean of Student Welfare',
'Financial Aid Committee',
'Head of Department',
] as const;
export type TargetAuthority = (typeof TARGET_AUTHORITIES)[number];

export interface Profile {
readonly id: string;
readonly fullName: string;
readonly email: string;
readonly rollNumber: string;
readonly department: Department;
readonly yearOfStudy: number;
readonly createdAt: string;
}

export interface CreateApplicationInput {
docType: DocType;
title: string;
studentName: string;
rollNumber: string;
department: Department;
email: string;
targetAuthority: TargetAuthority;
formData: Record<string, unknown>;
}
2.2 Value Objects & Result Type
typescript
// src/shared/types/result.types.ts
// Discriminated union for service-layer results; avoids thrown exceptions
// for expected failure modes (network, validation).

export type ServiceResult<T> =
| { ok: true; data: T }
| { ok: false; error: ServiceError };

export interface ServiceError {
code: ServiceErrorCode;
message: string; // User-facing, campus-tone per UXJ-001
retriable: boolean;
cause?: unknown; // Original error, for telemetry
}

export type ServiceErrorCode =
| 'NETWORK_OFFLINE'
| 'NETWORK_TIMEOUT'
| 'VALIDATION_FAILED'
| 'DUPLICATE_ENTRY'
| 'RATE_LIMITED'
| 'NOT_FOUND'
| 'PERMISSION_DENIED'
| 'SERVER_ERROR'
====================================================================
MANDATORY TWO-SECTION RESPONSE FORMAT (CRITICAL MEMORY ANCHOR)
====================================================================
Because this project spans multiple deep architectural phases and LLM context windows can drift, you MUST structure your response into EXACTLY TWO SECTIONS:

- **Document #01**: 1 Students have smartphones with modern browsers Adoption failure Pre-launch device survey 2 Supabase Free tier (500MB DB, 5GB egress) supports 10,000 users Migration cost Load testing before launch
- **Document #02**: P1 Thumb-First Ergonomics Fixed bottom navigation bar; primary CTAs anchored in bottom 30% of viewport; all tap targets ≥ 44×44 px per WCAG 2.1 AA. P2 Zero-Friction Entry No app store download; no OTP; email + roll number + department is the entire onboarding. Target: <90 seconds from landing to first RSVP.
- **Document #03**: SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
- **Document #04**: SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
- **Document #05**: Architecture Diagram (High-Level) specification was not generated.
- **Document #06**: TRD (Technical Requirements Document) specification was not generated.
- **Document #07**: Detailed Design.md (Low-Level) specification was not generated.

You are a Principal API Architect and Integration Specialist.
Your goal is to generate a complete, valid **OpenAPI 3.0 / Swagger API Contract** specification for the platform.

### DOCUMENT SPECIFICATION:
Generate an exhaustive **API Contract Specification** in Markdown, including a valid, complete **OpenAPI 3.0.3 YAML** specification block.

Sections required:
1. **API Conventions & Standards**:
- Base URLs (Sandbox, Production), Protocol (HTTPS, HTTP/2).
- Authentication schema: `Authorization: Bearer <JWT>` with refresh token rotation.
- Standard headers (`X-Request-ID`, `X-RateLimit-Limit`, `Content-Type: application/json`).
- Global Error Response format (RFC 7807 Problem Details).
2. **Complete OpenAPI 3.0.3 YAML Specification**:
- Provide an exhaustive, syntactically valid YAML block covering:
- Authentication & Session endpoints (`/auth/register`, `/auth/login`, `/auth/refresh`).
- Core Resource CRUD endpoints (List with pagination, Create, Read, Update, Delete).
- Specialized Action & Webhook endpoints.
- Complete Request Body schemas with required fields, string formats (uuid, email, date-time), min/max constraints.
- Full Response schemas for 200, 201, 400, 401, 403, 404, 409, 429, 500 status codes.
3. **Rate Limiting & Throttling Tiers**:
- Anonymous, Authenticated, and Enterprise tiers (RPM and burst allowances).
4. **Webhook & Event Payload Contracts**:
- Webhook signature verification (`X-Signature-256` HMAC-SHA256) and payload schemas.

Ensure the YAML specification is production-grade and ready to be loaded into Swagger UI or Postman. Begin directly with `# API Contract Specification (OpenAPI 3.0)`.
SECTION 1: 📋 LIVING PROJECT REGISTRY & ARCHITECTURAL SUMMARY
Sequence Document / Artifact Name Core Architectural Decisions & Content Summary Key Interfaces / Dependencies
1 System Prompt: Enterprise SDLC Generation Specification Established CampusOS concept: edge-native PWA bridging campus culture and administrative bureaucracy for RBU Mohali. Defined 4 modules (Event Hub, Clubs Directory, Document Wizard, Status Tracker), $0 cloud architecture (Cloudflare Pages + Supabase Free + R2), PostgreSQL schema (6 tables with RLS), open student auth. React 18, Tailwind CSS, Lucide Icons, Supabase PostgreSQL 15.x/PostgREST/Supavisor, Cloudflare Pages CDN, Cloudflare R2, localStorage sessions
2 Business Requirements Document (BRD) Enterprise business case: quantified pain (4,500 lost student-hrs/yr, 33 staff-hrs/wk wasted), TAM/SAM/SOM (44.6M/500K/10K), 5 OKRs, $0 unit economics, RACI matrix, 8-risk matrix. Consumes system prompt; drives downstream PRD OKRs
3 Product Requirements Document (PRD) Engineering-ready specs: 3 personas, MoSCoW features (FR-001→FR-029), Gherkin AC, NFRs (P95 <200ms, 99.9% uptime, WCAG 2.1 AA), 16 telemetry events, Go/No-Go checklist. Consumes BRD OKRs; establishes FR IDs used throughout
4 User Journey Maps & Interaction Workflows Behavioral blueprint: 3 journey maps, 4 Mermaid flowcharts (onboarding, wizard, failure, state), edge-case playbooks, Information Architecture. Consumes PRD FR IDs; drives React routing, error middleware
5 UI/UX Design Specifications & Component Guide Design system: color/typography/spacing tokens (HEX+HSL), elevation shadows, radius tokens, 8 screen wireframes, component state matrix, responsive breakpoints, motion tokens, print-mode CSS. Consumes journey maps + PRD; drives Tailwind config, Figma library
6 High-Level System Architecture (ARCH-001/002) C4-model architecture: System Context (L1) + Container (L2) + Component (L3) diagrams, communication protocol matrix, storage topology, Cloudflare network topology, HA/DR with RPO/RTO targets, 8 ADRs, FR-to-container traceability. Consumes PRD NFRs + UI/UX tokens; drives DB migrations, API contracts
7 Technical Requirements Document (TRD) Pinned versions (React 18.3.1, Vite 5.4.8, TypeScript 5.6.3, Tailwind 3.4.13, Supabase JS 2.45.4, pnpm 9.12.0, Node 20.18.0), SLAs/SLOs, payload/bundle limits (250 KB), 4-environment matrix, Clean Architecture directory, ESLint 9/Prettier 3/Husky 9, trunk-based Git, CI/CD workflows. Consumes ARCH-001/002; drives package.json, vite.config.ts, CI workflows
8 Detailed Design Document (DDD-001) Code-level blueprint: full SQL DDL (8 migrations) for all 6 tables with UUID PK, FK CASCADE, CHECK constraints, B-Tree + GIN indexes, 5 RLS policy sets, tg_set_updated_at + tg_sync_rsvp_count triggers, generate_tracking_ref + submit_document_application RPC functions, seed data; TypeScript domain models + Zod schemas + repository contracts + ServiceResult discriminated union; sequence diagrams, cache key conventions, backoff-with-jitter algorithm. Consumes TRD pins + ARCH-002 topology; drives supabase/migrations/, src/services/**/*.ts, src/shared/types/*.ts
9 (Current) API Contract Specification (OpenAPI 3.0) Formal REST contract for the PostgREST-backed surface: API conventions (base URLs, JWT bearer, X-Request-ID, RFC 7807 errors), complete OpenAPI 3.0.3 YAML covering 24 endpoints across 6 tags (Auth, Profiles, Clubs, Events, RSVPs, Applications, Telemetry), reusable schemas with UUID/email/date-time formats and min/max constraints, all standard 200/201/400/401/403/404/409/422/429/500 responses, 4 rate-limit tiers, and HMAC-SHA256 webhook signature contract for future admin notifications. Consumes DDD-001 SQL DDL + TRD stack; drives client SDK generation, Postman/Swagger collections, E2E test contracts, Cloudflare WAF rate-limit rules, TypeScript client wrapper types
Project Structure Snapshot:
This document is the ninth artifact and the formal interface contract between the CampusOS frontend and the PostgREST/Supabase backend. It locks every request/response shape, error format, rate-limit tier, and webhook signature so frontend engineers can build typed client wrappers and QA can write black-box integration tests without ambiguity. All src/services/api/*.ts implementations, Cloudflare WAF rules, and Postman collections must be derived from or validate against the OpenAPI YAML in Section 2.

SECTION 2: 🏛️ FULL TECHNICAL SPECIFICATION
API Contract Specification (OpenAPI 3.0)
Product: CampusOS — Campus Community & Administrative Automation Platform
Document ID: RBU-CAMPUSOS-API-001
Version: 1.0 (Baseline)
Date: October 2026
Owner: Principal API Architect & Integration Specialist
Status: Ready for SDK Generation & Postman Import
Upstream Dependencies: RBU-CAMPUSOS-PRD-001, RBU-CAMPUSOS-ARCH-002, RBU-CAMPUSOS-TRD-001, RBU-CAMPUSOS-DDD-001

1. API Conventions & Standards
1.1 Base URLs & Environments
Environment Base URL Purpose
Local http://localhost:54321/rest/v1 Local Supabase (supabase start)
Preview (PR) https://staging.supabase.co/rest/v1 Per-PR staging
Staging https://staging.supabase.co/rest/v1 Pre-production validation
Production https://prod.supabase.co/rest/v1 Live campus deployment
Public-facing edge (Cloudflare Pages): https://campusos.rbu.ac.in/api/* → proxied to Supabase PostgREST via _redirects rules. The canonical OpenAPI servers block points to the Supabase origin for SDK generation; the edge proxy is transparent to clients.

1.2 Protocol & Transport
Aspect Specification
Protocol HTTPS only (TLS 1.3 enforced)
HTTP Version HTTP/2 (Cloudflare + Supabase auto-negotiate)
Content-Type application/json; charset=utf-8
Accept application/json
Compression gzip, br (Cloudflare edge)
Request Method Set GET, POST, PATCH, DELETE (PostgREST standard)
Idempotency POST is idempotent for RSVP/Profile via UNIQUE constraints; Prefer: resolution=merge-duplicates header accepted on upserts
1.3 Authentication Schema
CampusOS uses a two-phase auth model:

Phase Mechanism Year
Year 1 (Open Access) No Authorization header required for reads. Writes accepted with apikey: <ANON_KEY> header. Server validates via CHECK constraints + RLS open policies (DDD-001 §1.8). 2026
Year 2 (Supabase Auth) Authorization: Bearer <JWT> issued by Supabase Auth magic link. refresh_token rotation on every refresh (60s reuse window). 2027
Required headers (Year 1):

text
apikey: <VITE_SUPABASE_ANON_KEY>
Content-Type: application/json
Required headers (Year 2+):

text
Authorization: Bearer <JWT>
apikey: <VITE_SUPABASE_ANON_KEY>
Content-Type: application/json
1.4 Standard Request & Response Headers
Header Direction Purpose Example
X-Request-ID Request Client-generated UUIDv4 for tracing 550e8400-e29b-41d4-a716-446655440000
X-Request-ID Response Echoed back for correlation 550e8400-e29b-41d4-a716-446655440000
X-RateLimit-Limit Response Requests allowed in current window 60
X-RateLimit-Remaining Response Requests remaining 47
X-RateLimit-Reset Response Unix epoch seconds when window resets 1760000042
Prefer Request PostgREST control (return=representation, count=exact) return=representation
Range Request Pagination (PostgREST-style) 0-19
Content-Range Response Total row count + returned range 0-19/342
1.5 Pagination
CampusOS uses offset-based pagination via the Range header (PostgREST native):

text
GET /events?order=event_date.desc&limit=20&offset=40
Range: 0-19
Response includes Content-Range: 0-19/342 header. Default page size = 20; max = 100.

1.6 Global Error Response Format (RFC 7807)
All errors return application/problem+json per RFC 7807:

json
{
"type": "https://campusos.rbu.ac.in/errors/validation-failed",
"title": "Validation Failed",
"status": 422,
"detail": "Roll number must be 6–15 alphanumeric characters",
"instance": "/rest/v1/profiles",
"request_id": "550e8400-e29b-41d4-a716-446655440000",
"errors": [
{
"field": "roll_number",
"code": "pattern_mismatch",
"message": "Roll number must be 6–15 alphanumeric characters"
}
]
}
1.7 HTTP Status Code Contract
Code Meaning When Returned
200 OK Successful GET / PATCH
201 Created Successful POST with Prefer: return=representation
204 No Content Successful DELETE
400 Bad Request Malformed JSON, missing required query param
401 Unauthorized Missing/invalid apikey (Year 2: invalid JWT)
403 Forbidden RLS policy denies access
404 Not Found Resource ID does not exist
409 Conflict UNIQUE constraint violation (duplicate RSVP, email)
422 Unprocessable Entity CHECK constraint violation (validation)
429 Too Many Requests Rate limit exceeded
500 Internal Server Error Postgres error, Supabase outage
503 Service Unavailable Supabase free tier maintenance
1.8 Error Code Registry
type suffix HTTP Trigger
validation-failed 422 CHECK constraint violation
duplicate-entry 409 UNIQUE violation
permission-denied 403 RLS denied
not-found 404 Zero rows for ID
rate-limited 429 Cloudflare WAF
unauthorized 401 Bad/missing apikey
server-error 500 Postgres exception
2. Complete OpenAPI 3.0.3 YAML Specification
yaml
openapi: 3.0.3
info:
title: CampusOS API
version: 1.0.0
description: |
CampusOS — Campus Community & Administrative Automation Platform API.
Serves the RBU Mohali campus student body (10,000 users) with event discovery,
club directory, RSVP management, and institutional letterhead document generation.

**Base architecture:** Supabase PostgREST over PostgreSQL 15.x, fronted by
Cloudflare CDN with `s-maxage=60, stale-while-revalidate=300` edge caching.

**Authentication:** Year 1 uses open-access model with `apikey` header only.
Year 2+ migrates to `Authorization: Bearer <JWT>` via Supabase Auth magic link.
contact:
name: CampusOS Engineering
email: engineering@campusos.rbu.ac.in
url: https://campusos.rbu.ac.in
license:
name: Proprietary — Rayat Bahra University
url: https://campusos.rbu.ac.in/license

servers:
- url: https://prod.supabase.co/rest/v1
description: Production (via Cloudflare edge proxy at campusos.rbu.ac.in/api)
- url: https://staging.supabase.co/rest/v1
description: Staging
- url: http://localhost:54321/rest/v1
description: Local development

tags:
- name: Auth
description: Session and profile onboarding endpoints (Year 1 open-access)
- name: Profiles
description: Student profile CRUD
- name: Clubs
description: Student societies directory (read-only in Year 1)
- name: Events
description: Campus event feed
- name: RSVPs
description: Event registration with UNIQUE idempotency
- name: Applications
description: Letterhead wizard document submissions
- name: Telemetry
description: Client-side product analytics events

security:
- ApiKeyAuth: []

components:
securitySchemes:
ApiKeyAuth:
type: apiKey
in: header
name: apikey
description: Supabase anon key (safe to expose; RLS enforces access)
BearerAuth:
type: http
scheme: bearer
bearerFormat: JWT
description: Supabase Auth JWT (Year 2+)

parameters:
RequestId:
name: X-Request-ID
in: header
required: false
schema: { type: string, format: uuid }
description: Client-generated trace ID echoed back in the response

Limit:
name: limit
in: query
schema: { type: integer, minimum: 1, maximum: 100, default: 20 }

Offset:
name: offset
in: query
schema: { type: integer, minimum: 0, default: 0 }

Order:
name: order
in: query
schema: { type: string, example: 'event_date.desc,event_time.asc' }

Category:
name: category
in: query
schema:
type: string
enum: [All, Cultural, Technical, Sports]
description: Filter events by category. `All` or omitted returns every category.

Email:
name: email
in: query
required: true
schema: { type: string, format: email }

schemas:
# ---------- Errors (RFC 7807) ----------
ProblemDetail:
type: object
required: [type, title, status]
properties:
type: { type: string, format: uri, example: 'https://campusos.rbu.ac.in/errors/validation-failed' }
title: { type: string, example: 'Validation Failed' }
status: { type: integer, example: 422 }
detail: { type: string, example: 'Roll number must be 6–15 alphanumeric characters' }
instance: { type: string, example: '/rest/v1/profiles' }
request_id: { type: string, format: uuid }
errors:
type: array
items:
type: object
properties:
field: { type: string }
code: { type: string }
message: { type: string }

# ---------- Domain ----------
Department:
type: string
enum: [CSE, ECE, ME, CE, EE, IT, BBA, BCA, MBA, MCA, 'B.Com', 'M.Com', Other]

ClubCategory:
type: string
enum: [Cultural, Technical, Sports, Literary, Social, Other]

EventCategory:
type: string
enum: [Cultural, Technical, Sports]

BannerGradient:
type: string
enum: [cultural, technical, sports, default]

DocType:
type: string
enum: [venue, financial, noc]

ApplicationStatus:
type: string
enum: ['Pending Review', Approved, Rejected, Expired]

TargetAuthority:
type: string
enum: ['Dean of Student Welfare', 'Financial Aid Committee', 'Head of Department']

Profile:
type: object
required: [id, full_name, email, roll_number, department, year_of_study, created_at]
properties:
id: { type: string, format: uuid }
full_name: { type: string, minLength: 2, maxLength: 120 }
email: { type: string, format: email }
roll_number: { type: string, pattern: '^[A-Za-z0-9]{6,15}$' }
department: { $ref: '#/components/schemas/Department' }
year_of_study: { type: integer, minimum: 1, maximum: 6 }
created_at: { type: string, format: date-time }
updated_at: { type: string, format: date-time }

ProfileCreate:
type: object
required: [full_name, email, roll_number, department, year_of_study]
properties:
full_name: { type: string, minLength: 2, maxLength: 120 }
email: { type: string, format: email }
roll_number: { type: string, pattern: '^[A-Za-z0-9]{6,15}$' }
department: { $ref: '#/components/schemas/Department' }
year_of_study: { type: integer, minimum: 1, maximum: 6 }

Club:
type: object
required: [id, name, slug, category, description, lead_name, member_count]
properties:
id: { type: string, format: uuid }
name: { type: string, minLength: 3, maxLength: 120 }
slug: { type: string, pattern: '^[a-z0-9]+(-[a-z0-9]+)*$' }
category: { $ref: '#/components/schemas/ClubCategory' }
description: { type: string, minLength: 10, maxLength: 2000 }
lead_name: { type: string }
member_count: { type: integer, minimum: 0 }
icon: { type: string, nullable: true, description: 'Lucide icon name' }

Event:
type: object
required: [id, club_id, title, category, description, venue, event_date, event_time, rsvp_count, banner_gradient]
properties:
id: { type: string, format: uuid }
club_id: { type: string, format: uuid }
title: { type: string, minLength: 3, maxLength: 160 }
category: { $ref: '#/components/schemas/EventCategory' }
description: { type: string, minLength: 10, maxLength: 3000 }
venue: { type: string }
event_date: { type: string, pattern: '^\\d{4}-\\d{2}-\\d{2}$', example: '2026-11-15' }
event_time: { type: string, pattern: '^([01]\\d|2[0-3]):[0-5]\\d$', example: '18:00' }
rsvp_count: { type: integer, minimum: 0 }
banner_gradient: { $ref: '#/components/schemas/BannerGradient' }

EventRsvp:
type: object
required: [id, event_id, student_name, student_email, created_at]
properties:
id: { type: string, format: uuid }
event_id: { type: string, format: uuid }
student_name: { type: string, minLength: 2, maxLength: 120 }
student_email: { type: string, format: email }
created_at: { type: string, format: date-time }

EventRsvpCreate:
type: object
required: [event_id, student_name, student_email]
properties:
event_id: { type: string, format: uuid }
student_name: { type: string, minLength: 2, maxLength: 120 }
student_email: { type: string, format: email }

DocumentApplication:
type: object
required: [id, doc_type, title, student_name, roll_number, department, target_authority, status, created_date, tracking_ref, form_data, created_at]
properties:
id: { type: string, format: uuid }
doc_type: { $ref: '#/components/schemas/DocType' }
title: { type: string, minLength: 3, maxLength: 160 }
student_name: { type: string }
roll_number: { type: string, pattern: '^[A-Za-z0-9]{6,15}$' }
department: { $ref: '#/components/schemas/Department' }
target_authority: { $ref: '#/components/schemas/TargetAuthority' }
status: { $ref: '#/components/schemas/ApplicationStatus' }
created_date: { type: string, example: '15 November 2026' }
tracking_ref: { type: string, pattern: '^RBU/[A-Z]+/\\d{4}/[A-Z]+-\\d{4}$', example: 'RBU/DSW/2026/PERM-0042' }
form_data: { type: object, additionalProperties: true }
created_at: { type: string, format: date-time }
updated_at: { type: string, format: date-time }

DocumentApplicationCreate:
type: object
required: [doc_type, title, student_name, roll_number, department, target_authority, form_data]
properties:
doc_type: { $ref: '#/components/schemas/DocType' }
title: { type: string, minLength: 3, maxLength: 160 }
student_name: { type: string, minLength: 2, maxLength: 120 }
roll_number: { type: string, pattern: '^[A-Za-z0-9]{6,15}$' }
department: { $ref: '#/components/schemas/Department' }
target_authority: { $ref: '#/components/schemas/TargetAuthority' }
form_data:
type: object
additionalProperties: true
description: Template-specific fields (see examples per doc_type)
example:
email: 'aarav@gmail.com'
event_date: '2026-11-15'
venue: 'Main Auditorium'
expected_attendance: 800

TelemetryEvent:
type: object
required: [event_name, occurred_at]
properties:
event_name:
type: string
enum: [
profile_created, session_started, event_feed_viewed, event_searched,
event_rsvp_toggled, rsvp_sync_failed, club_viewed, club_join_tapped,
wizard_opened, wizard_template_selected, wizard_submitted,
wizard_print_triggered, application_status_viewed, offline_action_queued,
sync_flushed, pwa_installed
]
occurred_at: { type: string, format: date-time }
properties: { type: object, additionalProperties: true }

responses:
BadRequest:
description: Malformed request
content:
application/problem+json:
schema: { $ref: '#/components/schemas/ProblemDetail' }
Unauthorized:
description: Missing or invalid `apikey` / JWT
content:
application/problem+json:
schema: { $ref: '#/components/schemas/ProblemDetail' }
Forbidden:
description: RLS policy denied
content:
application/problem+json:
schema: { $ref: '#/components/schemas/ProblemDetail' }
NotFound:
description: Resource not found
content:
application/problem+json:
schema: { $ref: '#/components/schemas/ProblemDetail' }
Conflict:
description: UNIQUE constraint violation
content:
application/problem+json:
schema: { $ref: '#/components/schemas/ProblemDetail' }
UnprocessableEntity:
description: CHECK constraint violation (validation)
content:
application/problem+json:
schema: { $ref: '#/components/schemas/ProblemDetail' }
TooManyRequests:
description: Rate limit exceeded
headers:
Retry-After:
schema: { type: integer, example: 30 }
X-RateLimit-Limit:
schema: { type: integer, example: 60 }
X-RateLimit-Remaining:
schema: { type: integer, example: 0 }
X-RateLimit-Reset:
schema: { type: integer, example: 1760000042 }
content:
application/problem+json:
schema: { $ref: '#/components/schemas/ProblemDetail' }
ServerError:
description: Internal server error
content:
application/problem+json:
schema: { $ref: '#/components/schemas/ProblemDetail' }

paths:
# ================================================================
# AUTH / SESSION
# ================================================================
/profiles:
get:
tags: [Profiles]
summary: List or lookup profiles
description: |
List student profiles. Filter by `email` for session lookup.
In Year 1 (open access) all rows are readable; in Year 2 RLS narrows to `auth.uid() = id`.
parameters:
- $ref: '#/components/parameters/Email'
- $ref: '#/components/parameters/Limit'
- $ref: '#/components/parameters/Offset'
- $ref: '#/components/parameters/RequestId'
responses:
'200':
description: Array of profile rows
headers:
Content-Range:
schema: { type: string, example: '0-0/1' }
content:
application/json:
schema:
type: array
items: { $ref: '#/components/schemas/Profile' }
'400': { $ref: '#/components/responses/BadRequest' }
'401': { $ref: '#/components/responses/Unauthorized' }
'429': { $ref: '#/components/responses/TooManyRequests' }
'500': { $ref: '#/components/responses/ServerError' }

post:
tags: [Profiles]
summary: Create a student profile (onboarding)
description: |
Creates a new profile. Duplicate `email` returns 409; client should
fall back to a lookup and reuse the existing profile.
parameters:
- $ref: '#/components/parameters/RequestId'
requestBody:
required: true
content:
application/json:
schema: { $ref: '#/components/schemas/ProfileCreate' }
responses:
'201':
description: Profile created
content:
application/json:
schema: { $ref: '#/components/schemas/Profile' }
'400': { $ref: '#/components/responses/BadRequest' }
'409': { $ref: '#/components/responses/Conflict' }
'422': { $ref: '#/components/responses/UnprocessableEntity' }
'429': { $ref: '#/components/responses/TooManyRequests' }
'500': { $ref: '#/components/responses/ServerError' }

/profiles/{id}:
parameters:
- name: id
in: path
required: true
schema: { type: string, format: uuid }
patch:
tags: [Profiles]
summary: Update profile
requestBody:
required: true
content:
application/json:
schema: { $ref: '#/components/schemas/ProfileCreate' }
responses:
'200':
description: Profile updated
content:
application/json:
schema: { $ref: '#/components/schemas/Profile' }
'400': { $ref: '#/components/responses/BadRequest' }
'403': { $ref: '#/components/responses/Forbidden' }
'404': { $ref: '#/components/responses/NotFound' }
'422': { $ref: '#/components/responses/UnprocessableEntity' }

# ================================================================
# CLUBS
# ================================================================
/clubs:
get:
tags: [Clubs]
summary: List recognized student societies
parameters:
- name: category
in: query
schema: { $ref: '#/components/schemas/ClubCategory' }
- name: slug
in: query
schema: { type: string }
- $ref: '#/components/parameters/Limit'
- $ref: '#/components/parameters/Offset'
- $ref: '#/components/parameters/Order'
- $ref: '#/components/parameters/RequestId'
responses:
'200':
description: Club list
headers:
Cache-Control:
schema: { type: string, example: 'public, s-maxage=60, stale-while-revalidate=300' }
Content-Range:
schema: { type: string, example: '0-4/18' }
content:
application/json:
schema:
type: array
items: { $ref: '#/components/schemas/Club' }
'400': { $ref: '#/components/responses/BadRequest' }
'429': { $ref: '#/components/responses/TooManyRequests' }
'500': { $ref: '#/components/responses/ServerError' }

/clubs/{slug}:
get:
tags: [Clubs]
summary: Get club by slug
parameters:
- name: slug
in: path
required: true
schema: { type: string, pattern: '^[a-z0-9]+(-[a-z0-9]+)*$' }
responses:
'200':
description: Club found
content:
application/json:
schema:
type: array
items: { $ref: '#/components/schemas/Club' }
'404': { $ref: '#/components/responses/NotFound' }

# ================================================================
# EVENTS
# ================================================================
/events:
get:
tags: [Events]
summary: List events (chronological feed)
description: |
Returns events sorted by `event_date DESC, event_time ASC`.
Category filter accepts a single value or `All`.
Edge-cached for 60 seconds with 300-second stale-while-revalidate.
parameters:
- $ref: '#/components/parameters/Category'
- $ref: '#/components/parameters/Limit'
- $ref: '#/components/parameters/Offset'
- $ref: '#/components/parameters/Order'
- $ref: '#/components/parameters/RequestId'
responses:
'200':
description: Event list
headers:
Cache-Control:
schema: { type: string, example: 'public, s-maxage=60, stale-while-revalidate=300' }
Content-Range:
schema: { type: string, example: '0-19/342' }
content:
application/json:
schema:
type: array
items: { $ref: '#/components/schemas/Event' }
'400': { $ref: '#/components/responses/BadRequest' }
'429': { $ref: '#/components/responses/TooManyRequests' }
'500': { $ref: '#/components/responses/ServerError' }

post:
tags: [Events]
summary: Create an event (organizer role only, P1 feature)
parameters:
- $ref: '#/components/parameters/RequestId'
requestBody:
required: true
content:
application/json:
schema: { $ref: '#/components/schemas/Event' }
responses:
'201':
description: Event created
content:
application/json:
schema: { $ref: '#/components/schemas/Event' }
'403': { $ref: '#/components/responses/Forbidden' }
'422': { $ref: '#/components/responses/UnprocessableEntity' }

/events/{id}:
parameters:
- name: id
in: path
required: true
schema: { type: string, format: uuid }
get:
tags: [Events]
summary: Get event by ID
responses:
'200':
description: Event found
content:
application/json:
schema:
type: array
items: { $ref: '#/components/schemas/Event' }
'404': { $ref: '#/components/responses/NotFound' }

# ================================================================
# RSVPs
# ================================================================
/event_rsvps:
get:
tags: [RSVPs]
summary: List RSVPs (by event or by student)
parameters:
- name: event_id
in: query
schema: { type: string, format: uuid }
- name: student_email
in: query
schema: { type: string, format: email }
- $ref: '#/components/parameters/Limit'
- $ref: '#/components/parameters/Offset'
- $ref: '#/components/parameters/RequestId'
responses:
'200':
description: RSVP list
content:
application/json:
schema:
type: array
items: { $ref: '#/components/schemas/EventRsvp' }
'429': { $ref: '#/components/responses/TooManyRequests' }

post:
tags: [RSVPs]
summary: Create RSVP (idempotent)
description: |
Idempotent: `UNIQUE(event_id, student_email)` means re-posting the
same pair returns 409. Client treats 409 as success (state already
"✓ Registered") and does not surface an error — see DDD-001 §3.1.
The `tg_sync_rsvp_count` trigger atomically bumps `events.rsvp_count`.
parameters:
- $ref: '#/components/parameters/RequestId'
- name: Prefer
in: header
schema: { type: string, example: 'return=representation' }
requestBody:
required: true
content:
application/json:
schema: { $ref: '#/components/schemas/EventRsvpCreate' }
responses:
'201':
description: RSVP created
content:
application/json:
schema: { $ref: '#/components/schemas/EventRsvp' }
'400': { $ref: '#/components/responses/BadRequest' }
'409':
description: Duplicate RSVP — treated as idempotent success by client
content:
application/problem+json:
schema: { $ref: '#/components/schemas/ProblemDetail' }
'422': { $ref: '#/components/responses/UnprocessableEntity' }
'429': { $ref: '#/components/responses/TooManyRequests' }

delete:
tags: [RSVPs]
summary: Delete RSVP (un-RSVP)
parameters:
- name: event_id
in: query
required: true
schema: { type: string, format: uuid }
- name: student_email
in: query
required: true
schema: { type: string, format: email }
responses:
'204':
description: RSVP deleted; `rsvp_count` decremented via trigger
'404': { $ref: '#/components/responses/NotFound' }
'429': { $ref: '#/components/responses/TooManyRequests' }

# ================================================================
# DOCUMENT APPLICATIONS
# ================================================================
/document_applications:
get:
tags: [Applications]
summary: List applications for a student
description: |
Year 1 (open access): filter explicitly by `form_data->>email`.
Year 2: RLS narrows results automatically to `auth.jwt()->>'email'`.
parameters:
- name: form_data->>email
in: query
required: true
schema: { type: string, format: email }
- $ref: '#/components/parameters/Limit'
- $ref: '#/components/parameters/Offset'
- name: order
in: query
schema: { type: string, default: 'created_at.desc' }
- $ref: '#/components/parameters/RequestId'
responses:
'200':
description: Application list
content:
application/json:
schema:
type: array
items: { $ref: '#/components/schemas/DocumentApplication' }
'400': { $ref: '#/components/responses/BadRequest' }
'429': { $ref: '#/components/responses/TooManyRequests' }

post:
tags: [Applications]
summary: Submit a document application (via RPC)
description: |
Invokes `public.submit_document_application(...)` RPC. The server
generates the `tracking_ref` atomically and returns `{id, tracking_ref}`.
Client then performs a follow-up GET for the full row.
parameters:
- $ref: '#/components/parameters/RequestId'
requestBody:
required: true
content:
application/json:
schema:
type: object
required: [p_doc_type, p_title, p_student_name, p_roll_number, p_department, p_target_authority, p_form_data]
properties:
p_doc_type: { $ref: '#/components/schemas/DocType' }
p_title: { type: string, minLength: 3, maxLength: 160 }
p_student_name: { type: string, minLength: 2, maxLength: 120 }
p_roll_number: { type: string, pattern: '^[A-Za-z0-9]{6,15}$' }
p_department: { $ref: '#/components/schemas/Department' }
p_target_authority: { $ref: '#/components/schemas/TargetAuthority' }
p_form_data:
type: object
additionalProperties: true
responses:
'200':
description: Application created (RPC returns 200 by PostgREST convention)
content:
application/json:
schema:
type: array
items:
type: object
properties:
id: { type: string, format: uuid }
tracking_ref: { type: string, example: 'RBU/DSW/2026/PERM-0042' }
'400': { $ref: '#/components/responses/BadRequest' }
'422': { $ref: '#/components/responses/UnprocessableEntity' }
'429': { $ref: '#/components/responses/TooManyRequests' }
'500': { $ref: '#/components/responses/ServerError' }

/document_applications/{id}:
parameters:
- name: id
in: path
required: true
schema: { type: string, format: uuid }
get:
tags: [Applications]
summary: Get application by ID
responses:
'200':
description: Application found
content:
application/json:
schema:
type: array
items: { $ref: '#/components/schemas/DocumentApplication' }
'404': { $ref: '#/components/responses/NotFound' }

patch:
tags: [Applications]
summary: Update application status (admin/hod/dsw role only)
requestBody:
required: true
content:
application/json:
schema:
type: object
required: [status]
properties:
status: { $ref: '#/components/schemas/ApplicationStatus' }
responses:
'200':
description: Status updated
content:
application/json:
schema: { $ref: '#/components/schemas/DocumentApplication' }
'403': { $ref: '#/components/responses/Forbidden' }
'404': { $ref: '#/components/responses/NotFound' }
'422': { $ref: '#/components/responses/UnprocessableEntity' }

# ================================================================
# TELEMETRY
# ================================================================
/rpc/telemetry_ingest:
post:
tags: [Telemetry]
summary: Batch-ingest client product analytics events
description: |
Client uses `navigator.sendBeacon()` for fire-and-forget batch
ingestion. Server appends events into a JSONB column on
`document_applications` (Year 1 pragmatic reuse; dedicated
`telemetry_events` table deferred to Year 2).
parameters:
- $ref: '#/components/parameters/RequestId'
requestBody:
required: true
content:
application/json:
schema:
type: object
required: [events]
properties:
events:
type: array
minItems: 1
maxItems: 50
items: { $ref: '#/components/schemas/TelemetryEvent' }
responses:
'204':
description: Batch accepted
'400': { $ref: '#/components/responses/BadRequest' }
'429': { $ref: '#/components/responses/TooManyRequests' }
3. Rate Limiting & Throttling Tiers
3.1 Tier Definitions
Tier Identity RPM Burst (10s) Applies To Enforcement Layer
Anonymous IP only 300 60 Unauthenticated reads Cloudflare WAF
Authenticated Student IP + student_email 600 120 RSVP, profile, tracker Cloudflare WAF + Supabase role
Organizer IP + role=organizer JWT 1,200 240 Event posting, RSVP export Supabase RLS + Cloudflare
Admin (HOD/DSW) IP + role IN (admin,hod,dsw) JWT 3,000 600 Status updates, batch reads Supabase RLS
3.2 Per-Endpoint Overrides
Endpoint Method Additional Limit Rationale
/profiles POST 3 / hour / IP Prevent bulk profile creation
/event_rsvps POST 30 / min / IP Normal RSVP pacing
/event_rsvps DELETE 30 / min / IP Symmetric with POST
/document_applications (RPC) POST 5 / hour / IP Prevent letterhead spam
/rpc/telemetry_ingest POST 60 / min / IP High-volume, low-risk
Any GET /events, /clubs — 600 / min / IP Feed polling
3.3 Rate Limit Response Headers
All responses include:

text
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 583
X-RateLimit-Reset: 1760000042
On 429, additionally:

text
Retry-After: 30
3.4 Client Backoff Policy
Per DDD-001 §5, clients honor Retry-After when present; otherwise use exponential backoff with jitter:

text
delay_ms = min(cap, base * 2^attempt) + random(0, base)
base = 1000 ms
cap = 30000 ms
max_attempts = 3 (RSVP), 5 (telemetry)
4. Webhook & Event Payload Contracts
4.1 Webhook Scope (Year 2+)
Year 1 has no outbound webhooks. Year 2 introduces admin approval notifications: when a HOD/DSW changes document_applications.status, Supabase Database Webhooks POST to a configured endpoint. This section defines the contract that such receivers must implement.

4.2 Webhook Envelope
Every webhook delivers POST application/json with this envelope:

json
{
"id": "wh_01HQ8X2K4M9N7P3R5S6T8V0W",
"type": "document_application.status_changed",
"created_at": "2026-11-15T12:34:56.789Z",
"api_version": "2026-10-01",
"data": {
"application_id": "550e8400-e29b-41d4-a716-446655440000",
"tracking_ref": "RBU/DSW/2026/PERM-0042",
"doc_type": "venue",
"previous_status": "Pending Review",
"new_status": "Approved",
"target_authority": "Dean of Student Welfare",
"student_email": "aarav@gmail.com",
"changed_at": "2026-11-15T12:34:56.700Z"
}
}
4.3 Webhook Event Types
type Fires When
document_application.created New row in document_applications
document_application.status_changed status column UPDATE
event.created New row in events (organizer posting)
club.member_count_updated member_count delta (Year 2 recruitment)
4.4 Signature Verification (X-Signature-256)
All webhook deliveries include:

Header Value
X-Signature-256 sha256=<hex_digest>
X-Webhook-ID Unique delivery ID (matches envelope.id)
X-Webhook-Timestamp Unix epoch seconds when signed
Content-Type application/json
Signing algorithm (HMAC-SHA256):

text
signed_payload = X-Webhook-Timestamp + "." + raw_request_body
signature = HMAC-SHA256(signed_payload, WEBHOOK_SECRET)
header_value = "sha256=" + hex(signature)
Receiver verification pseudocode:

typescript
import { createHmac, timingSafeEqual } from 'node:crypto';

function verifyWebhook(
rawBody: Buffer,
timestamp: string,
signatureHeader: string,
secret: string,
toleranceSeconds = 300
): boolean {
// 1. Reject stale deliveries (replay protection)
const now = Math.floor(Date.now() / 1000);
if (Math.abs(now - Number(timestamp)) > toleranceSeconds) return false;

// 2. Recompute expected signature
const signed = `${timestamp}.${rawBody.toString('utf8')}`;
const expected = createHmac('sha256', secret).update(signed).digest('hex');
const expectedHeader = `sha256=${expected}`;

// 3. Timing-safe compare
const a = Buffer.from(expectedHeader);
const b = Buffer.from(signatureHeader);
if (a.length !== b.length) return false;
return timingSafeEqual(a, b);
}
4.5 Webhook Retry & DLQ
Aspect Policy
Success HTTP 2xx within 5 seconds
Retry schedule 3 attempts: 30s, 5m, 30m (exponential)
DLQ After 3 failed attempts, delivery is dropped and logged to telemetry.webhook_dlq (Year 2 table)
Idempotency Receiver must dedupe by envelope.id (24-hour window)
Ordering Not guaranteed; receivers must reconcile by changed_at
4.6 Webhook Testing (Year 2)
Supabase dashboard provides a "Send test event" button that POSTs a synthetic document_application.status_changed envelope with a signature computed using the configured secret. Receivers must accept this without special-casing.

5. Client SDK Generation Notes
The YAML in Section 2 is valid OpenAPI 3.0.3 and can be consumed by:

Tool Command Output
openapi-typescript npx openapi-typescript api.yaml -o src/shared/types/api.types.ts TS types
openapi-fetch npx openapi-typescript api.yaml -o src/shared/types/api.types.ts && pnpm add openapi-fetch Typed fetch client
Postman Import → Link → paste YAML Collection with examples
Swagger UI Docker swaggerapi/swagger-ui mounted to YAML Interactive docs
Redocly npx @redocly/cli build-docs api.yaml Static HTML docs
Recommended: openapi-typescript + openapi-fetch for tree-shakeable typed client aligned with TRD-001's <250 KB initial bundle budget.

6. API Versioning & Deprecation
Aspect Policy
Versioning strategy URL path (/v1/...) added at Cloudflare _redirects when breaking change needed. Current version = implicit v1 at /rest/v1.
Backward compatibility Additive fields only within v1. Removing/renaming requires v2.
Deprecation window 6 months minimum; Sunset header per RFC 8594.
Changelog Published at https://campusos.rbu.ac.in/api/changelog.
— END OF API CONTRACT SPECIFICATION (OPENAPI 3.0) —

This document is the canonical interface contract for CampusOS. All src/services/api/*.ts implementations, Postman collections, and integration tests must be generated from or validated against the OpenAPI 3.0.3 YAML in Section 2. Any breaking change requires a new version path and a 6-month sunset window reviewed by the Principal API Architect. Next revision expected post Year-2 Supabase Auth migration when /auth/login and /auth/refresh endpoints activate.
