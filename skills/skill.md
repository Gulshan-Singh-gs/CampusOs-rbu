Skills & SKILL.md Manifest for AI Agents
This manifest serves as a unified index and setup guide for integrating public and custom SKILL.md extensions into AI coding environments (Cursor, Claude Code, OpenAI Codex, and custom agent harnesses).


1. Public GitHub Repositories & Installation Commands
The following open-source skills provide specialized execution Capabilities for agents. Install them using npx skills or the respective CLI initializers.

Skill Name
Repository URL
Installation / Activation Command
Description
taste-skill
 Leonxlnx/taste-skill
 npx skills add Leonxlnx/taste-skill
UI design opinionation, spacing system, typography rules, and modern visual aesthetics.
graft
 trailhq/Graft
 npx @nanonets/graft init
Framework for connecting external tools and structural APIs directly into local agent workspaces.
planning-and-task-breakdown
 addyosmani/agent-skills
 npx skills add addyosmani/agent-skills
Decomposes complex user specifications into actionable, testable sub-tasks with state tracking.
debugging-and-error-recovery
 addyosmani/agent-skills
 npx skills add addyosmani/agent-skills
Systematic root-cause analysis, stack trace parsing, and structured test-driven recovery.
webapp-testing
 anthropics/skills
 npx skills add anthropics/skills --skill webapp-testing
Playwright/Puppeteer automated browser testing patterns and DOM interaction flows.



2. Custom Workflow SKILL.md Manifests
Copy and paste the code blocks below directly into SKILL.md files within your project configuration directory.
Skill 1: Full-Stack MVP Architecture
---

name: fullstack-mvp-architecture

description: Directives for architecting scalable, minimal full-stack web applications using modern TypeScript stacks.

version: 1.0.0

---

# Full-Stack MVP Architecture Guide

## Core Principles

1. **Type Safety Across Boundaries**: Enforce end-to-end type safety from database schemas to UI component props using TypeScript, Zod, and ORM interfaces.

2. **Modular Directory Structure**: Feature-based grouping over layer-based grouping. Keep components, server actions, and utility functions co-located where possible.

3. **Optimistic UI & Server Authority**: Handle updates optimistically on the client while strictly enforcing validation and authorization on the server.

## Recommended Tech Stack

- **Framework**: Next.js (App Router) or Remix / React Router v7

- **Database / ORM**: PostgreSQL via Prisma or Drizzle ORM

- **Authentication**: Lucia Auth, Auth.js, or Clerk

- **Styling**: Tailwind CSS + shadcn/ui

- **State & Data Fetching**: TanStack Query (React Query) or Server Actions with optimistic hooks

## Implementation Protocol

### 1. Database Schema Guidelines

* Always include `id` (UUIDv4 or CUID2), `created_at` (TIMESTAMPTZ), and `updated_at` (TIMESTAMPTZ) fields.

* Explicitly declare foreign key cascading rules (`ON DELETE CASCADE` vs `ON DELETE SET NULL`).

### 2. API Layer & Mutations

* Wrap all server handlers in input-validation schemas (Zod).

* Return standard outcome contracts:

  ```ts

  type ActionResult<T> = 

    | { success: true; data: T }

    | { success: false; error: string; details?: Record<string, string[]> };
3. Component Hierarchy Rules
Keep client components ('use client') at the leaf nodes of the DOM tree.
Pass data down as primitives or validated plain objects.

### Skill 2: Client Communication & Soft Skills

```markdown

---

name: client-communication-and-soft-skills

description: Rules for formatting user-facing messages, status reports, technical clarifications, and non-technical explanations.

version: 1.0.0

---

# Client Communication & Soft Skills Directive

## Persona & Tone

- **Professional & Direct**: Maintain a clear, helpful, and concise tone. Avoid corporate jargon, filler words, or overly sycophantic statements.

- **Transparent Risk Reporting**: Flag potential architecture, scope, or timeline blockers early with explicit trade-offs.

## Communication Structure

### 1. Update / Progress Reports

When summarizing work completed, use a 3-part layout:

* **Accomplished**: High-level, value-focused summary of changes.

* **Technical Impact**: Key files modified or infrastructure adjusted.

* **Next Steps**: Explicit list of remaining actions.

### 2. Seeking Clarification

When specifications are ambiguous:

1. State the current assumption.

2. Provide option A vs. Option B with pros/cons.

3. Recommend the optimal path and request confirmation before proceeding.

### 3. Error / Incident Escalation

* **Problem**: Brief definition of the failure.

* **Root Cause**: Why it happened in non-blameworthy terms.

* **Fix Applied / Proposed**: Immediate resolution step.

* **Prevention**: Long-term safeguard implemented.
Skill 3: Asset Request Pipeline
---

name: asset-request-pipeline

description: Workflow for requesting, tracking, validating, and replacing visual or media assets (images, icons, mockups, datasets).

version: 1.0.0

---

# Asset Request Pipeline Protocol

## Purpose

Streamline the identification, placeholder creation, and formal acquisition of static media assets during project development.

## Pipeline Workflow

### Phase 1: Identification & Placeholder Generation

* When a view or component requires an asset, do not halt execution.

* Create a lightweight vector or SVG placeholder immediately using accessible HTML/CSS or inline SVG.

* Add an explicit placeholder marker:

  ```tsx

  <span type="placeholder" placeholder-type="file"></span>
Phase 2: Asset Inventory Manifest
Maintain or append to an ASSETS.md inventory in the project root detailing outstanding needs:

Asset ID
Location / Component
Required Dimensions
Format
Description / Content
Status
hero-bg
/components/Hero.tsx
1920x1080
WebP / SVG
Dark gradient abstract background
Pending
user-avatar-default
/components/Nav.tsx
128x128
PNG / SVG
Neutral user profile graphic
Provided

Phase 3: Ingestion & Validation
Upon receiving asset files:

Verify dimensions, aspect ratio, and color space.
Run lossy/lossless compression (e.g., sharp, imagemin).
Place files in public/assets/ following strict kebab-case naming (hero-background-dark.webp).
Update code reference and clear placeholder chips.

---

## 3. Setup Instructions for External AI Agents

Follow these platform-specific directions to load these skills into your preferred agent workspace.

### A. Cursor (`.cursor/rules/`)

Cursor parses markdown or rule files stored inside `.cursor/rules/` to shape workspace behaviors.

1. Ensure the directory structure exists at the root of your project:

   ```bash

   mkdir -p .cursor/rules

Save each skill as an individual .mdc or .md file inside .cursor/rules/:
.cursor/rules/fullstack-mvp-architecture.mdc
.cursor/rules/client-communication.mdc
.cursor/rules/asset-pipeline.mdc
Optional metadata header format for Cursor .mdc files:---

description: Fullstack MVP Architecture rules

globs: "src/app/**/*, src/components/**/*"

---
B. Claude Code (.claude/skills/)
Claude Code checks local and global .claude/skills/ directories for executable skill definitions.

Create the project-level skills directory:mkdir -p .claude/skills
Save each custom skill directly into its own markdown file:
.claude/skills/fullstack-mvp-architecture.md
.claude/skills/client-communication-and-soft-skills.md
.claude/skills/asset-request-pipeline.md
To install public skills into your Claude environment, run:npx skills add Leonxlnx/taste-skill

npx skills add addyosmani/agent-skills

npx skills add anthropics/skills --skill webapp-testing
C. OpenAI Codex / Custom Agent Tools
For agents utilizing raw prompt injection or dynamic system prompt loading (e.g., custom LangChain, AutoGen, or custom OpenAI API scripts):

Store all skills in a central /skills or .agent/skills/ directory within the workspace root.
In your agent runner or orchestration script, dynamically scan and append SKILL.md contents into the system prompt:import glob

import os

def load_agent_skills(skills_dir=".agent/skills"):

    skills_prompt = "\n\n--- ACTIVE SKILLS AND DIRECTIVES ---\n"

    for filepath in glob.glob(f"{skills_dir}/*.md"):

        with open(filepath, "r", encoding="utf-8") as f:

            skills_prompt += f"\n{f.read()}\n"

    return skills_prompt

Pass the generated aggregate string as part of the initial system context during agent initialization.

