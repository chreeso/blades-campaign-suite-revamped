# Blades Campaign Suite — Agentic Routing Map

This file serves as the primary routing map for AI coding agents operating in this repository. Use the tables and paths below to locate rules, skills, and schemas before generating or modifying code.

---

## 1. System Architecture & Tech Stack

| Layer | Technology | Key Responsibility |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router, TypeScript) | Server components, API routes, multi-tenant campaign layouts |
| **UI & Styling** | Tailwind CSS + shadcn/ui | Dark Victorian steampunk/gothic theme, responsive dialogs & forms |
| **Database & Auth**| Supabase (PostgreSQL + RLS) | Multi-campaign tenancy, role-based isolation (GM vs Player), Realtime |
| **Agent Context** | Graphify (`graphify-ts`) | AST knowledge graph for codebase navigation and rules indexing |

---

## 2. Agent Skills Routing

When handling specific feature requests, activate the corresponding skill:

| Domain | Skill Path | When to Route Here |
| :--- | :--- | :--- |
| **Game Rules & Mechanics** | [blades-rules](file:///.agent/skills/blades-rules/SKILL.md) | Rolls, stress/trauma, harm, playbooks, downtime, payoffs, heat |
| **Database & Multi-Tenancy** | [supabase-architecture](file:///.agent/skills/supabase-architecture/SKILL.md) | Schema design, RLS policies, GM vs player permissions, migrations |
| **Code & Rule Graph Navigation** | [graphify-knowledge](file:///.agent/skills/graphify-knowledge/SKILL.md) | AST context indexing, symbol lookup, token-efficient queries |
| **UI Components & Theming** | [ui-components](file:///.agent/skills/ui-components/SKILL.md) | shadcn/ui styling, linear progress clocks, dot ratings, sheets |

---

## 3. Knowledge Base Index

The directory [`.agent/knowledge/`](file:///.agent/knowledge/) contains deterministic extracts of the official Blades in the Dark SRD:

| Knowledge File | Topics Covered |
| :--- | :--- |
| [`glossary.md`](file:///.agent/knowledge/glossary.md) | Standard definitions of all game terms, positions, effects, and metrics |
| [`core_mechanics.md`](file:///.agent/knowledge/core_mechanics.md) | Action rolls (0d rules), position & effect matrix, harm, resistance & armor |
| [`character_playbooks.md`](file:///.agent/knowledge/character_playbooks.md) | 7 Scoundrel playbooks (Cutter, Hound, Leech, Lurk, Slide, Spider, Whisper), items & XP |
| [`crew_playbooks.md`](file:///.agent/knowledge/crew_playbooks.md) | 6 Crew playbooks (Assassins, Bravos, Cult, Hawkers, Shadows, Smugglers), upgrades, claims |
| [`factions_and_doskvol.md`](file:///.agent/knowledge/factions_and_doskvol.md) | Faction status (-3 to +3), Doskvol districts, GM faction turn engine |
| [`downtime_and_economy.md`](file:///.agent/knowledge/downtime_and_economy.md) | Payoffs, Heat & Wanted level, Entanglements, Downtime activities, Purse vs Stash |
| [`clocks_and_progress.md`](file:///.agent/knowledge/clocks_and_progress.md) | Linear progress bar specs (4, 6, 8, 12 segments), GM/Public visibility rules |

---

## 4. Feature Implementation Routing

| When Working On... | Primary Knowledge File | Primary Skill |
| :--- | :--- | :--- |
| **Character Creator & Level-Up** | [`character_playbooks.md`](file:///.agent/knowledge/character_playbooks.md) | `blades-rules`, `ui-components` |
| **Linear Progress Bar Clocks** | [`clocks_and_progress.md`](file:///.agent/knowledge/clocks_and_progress.md) | `ui-components`, `supabase-architecture` |
| **Player / Crew Economy & Vault** | [`downtime_and_economy.md`](file:///.agent/knowledge/downtime_and_economy.md) | `blades-rules`, `supabase-architecture` |
| **GM Faction Tracker & NPC Webs**| [`factions_and_doskvol.md`](file:///.agent/knowledge/factions_and_doskvol.md) | `supabase-architecture`, `ui-components` |
| **Multi-Campaign Switching & Auth** | [`supabase-architecture/SKILL.md`](file:///.agent/skills/supabase-architecture/SKILL.md) | `supabase-architecture` |

---

## 5. Non-Negotiable Invariants

1. **SRD Fidelity**: Never invent custom dice roll equations or violate stress/trauma/harm rules. Consult `.agent/knowledge/`.
2. **Linear Clocks**: Clocks must render as segmented linear progress bars (not circular pie charts).
3. **Strict Multi-Campaign Isolation**: Every table with campaign data must carry `campaign_id` with RLS enforcing GM vs Player permissions.
4. **Context Precision**: Use Graphify AST and the knowledge files rather than reading raw bulk files into prompts.
