# Release Notes — Blades in the Dark Campaign Suite

All notable changes, architectural milestones, and rule implementations for the **Blades Campaign Suite Revamped** are documented in this file.

The project follows [Semantic Versioning](https://semver.org/) and strict adherence to the **Blades in the Dark System Reference Document (SRD)**.

---

## [0.4.0] — 2026-10-21

### 🎯 Character Creation & Advancement Separation

This milestone eliminates accidental stat manipulation during tabletop sessions by clearly separating character creation, active play, and advancement. Action dots are safeguarded against accidental misclicks in Play Mode with tactile full-row click-to-roll mechanics, an explicit Edit Mode override empowers manual corrections, and multi-track XP advancement provides full Blades SRD choices.

#### 🌟 New Features & Enhancements

* **Starting Action Dot Allocation Matrix (`CharacterCreator.tsx`)**:
  * Enforces official Blades in the Dark character creation rules: scoundrels receive baseline playbook action ratings plus exactly **4 starting action dots** (2 into their playbook's actions, 2 into any actions).
  * **Hard Cap**: No action rating may exceed **2 dots** at character creation.
  * **Interactive Budget Indicators**: Live badges display `Playbook Dots: X / 2` and `General Dots: Y / 2` with visual feedback and submit validation safeguards.

* **Play Mode Action Locking & Tactile Rolling (`CharacterSheet.tsx`)**:
  * Action rating dots are locked against inline editing during regular sessions to prevent accidental misclicks.
  * **Full-Row Click-to-Roll**: Clicking anywhere on an action row (label, dot indicators, or dice icon) initiates an action roll for that action pool.

* **Explicit Manual "Edit Mode" Override (`CharacterSheet.tsx`)**:
  * Added a dedicated `Edit / Done` toggle in the scoundrel sheet header for Players and GMs.
  * Displays a prominent amber banner while active: *"Edit Mode Active: Direct stat editing enabled. Exit Edit Mode to roll actions."*
  * Enables inline adjustment of dots, manual XP corrections, and toggling special ability unlock states for retroactive corrections.

* **Multi-Track Attribute Advancement (`CharacterSheet.tsx`)**:
  * Reaching 6 XP on Insight, Prowess, or Resolve activates an `Advance (6 XP)` button.
  * Focused modal allows selecting any action in that attribute group to advance by +1 dot (up to the maximum of 4 dots), automatically deducting 6 XP.

* **Comprehensive 3-Tab Playbook Advancement Modal (`CharacterSheet.tsx`)**:
  * Reaching 8 Playbook XP activates the `Advance (8 XP)` button with full SRD rewards:
    * **Playbook Ability**: Unlock any unlearned ability from the scoundrel's playbook.
    * **Veteran Ability**: Learn a Special Ability from any of the other 6 scoundrel playbooks (with source playbook filtering).
    * **Action Dot**: Advance any action rating across the sheet by +1 dot (max 4).
  * Deducts 8 XP and persists the chosen upgrade.

---

## [0.3.0] — 2026-10-21

### 🎭 Live Mid-Session NPC Creation & Contact Linking

This release enables players and Game Masters to dynamically create NPCs, register emergent street factions, and forge scoundrel ties mid-campaign, mid-session, or mid-score without interrupting tabletop flow.

#### 🌟 New Features & Enhancements

* **Global Quick-Action Shortcut (`+ NPC`)**:
  * Added a persistent `+ NPC` quick-action button in the primary navigation header, accessible during any phase of play (Free Play, Score, Downtime) for both Players and GMs.
  * Launches the new `QuickNpcModal` with instant keyboard autofocus and streamlined data entry.

* **Universal Quick-Create NPC Modal (`QuickNpcModal.tsx`)**:
  * Fast capture of NPC Name, Role/Profession, Quirk, and First Encounter context.
  * **On-the-Fly Faction Registration**: Assign to an existing campaign faction, mark as *Independent / Unaligned*, or type in a new custom street faction name that is instantly registered in the campaign.
  * **Optional Scoundrel Relation Link**: Pre-selects the active player's scoundrel, allowing immediate assignment of 1–100 sentiment score (default `50`), relationship badges (Mentor, Debtor, Creditor, etc.), and narrative notes.
  * Visibility toggle: Player-created NPCs default to Public; GMs can toggle between Public and GM-Only.

* **Character Sheet Contact Connection & Inline Creation (`CharacterSheet.tsx`)**:
  * Added `+ Add / Connect Contact` action to the *Street Contacts & Relations* section header.
  * Dual-mode dialog:
    * **Connect Existing NPC**: Searchable dropdown of campaign NPCs not yet tied to this character, with sentiment slider and badge toggles.
    * **Quick Create New NPC**: Seamlessly opens `QuickNpcModal` pre-linked to this scoundrel.
  * Immediately updates the scoundrel's sheet and broadcasts via Supabase Realtime.

---

## [0.2.0] — 2026-10-21

### ⚔️ NPC Faction Affiliations & Multi-Character Relations

This milestone introduces deep relational networks between non-player characters (NPCs), Doskvol factions, and individual scoundrels, including strict character creation contact rules from the Blades in the Dark SRD.

#### 🌟 New Features & Enhancements

* **Playbook Contacts & Strict Character Creation (`CharacterCreator.tsx`)**:
  * Added canonical SRD starting contacts across all 7 Scoundrel playbooks (Cutter, Hound, Leech, Lurk, Slide, Spider, Whisper) with suggested faction associations and roles.
  * Enforced strict Blades in the Dark rule requirement: A character cannot be finalized without selecting **exactly 1 Close Friend (▲)** and **exactly 1 Rival / Foe (▼)**.
  * Added support for creating custom street contacts during character creation.
  * Automatically creates campaign NPC records and links initial character relation states.

* **1–100 Sentiment Grading Scale**:
  * Replaced flat contact flags with a dynamic 1–100 relationship sentiment meter:
    * **1–20**: Bitter Foe / Arch-Enemy (defaults to `15` at character creation for chosen Rival)
    * **21–40**: Rival / Adversary
    * **41–60**: Neutral / Acquaintance / Professional Contact (defaults to `50` for unselected contacts)
    * **61–80**: Ally / Friendly Contact
    * **81–100**: Devoted Friend / Close Confidant (defaults to `85` at character creation for chosen Friend)

* **Relationship Badges & Campaign-Exclusive Labels**:
  * **9 Systemwide Badges**: `Mentor`, `Protégé`, `Debtor`, `Creditor`, `Lover`, `Family`, `Blackmailer`, `Former Partner`, `Confidant`.
  * **Campaign-Exclusive Labels**: Players and GMs can define custom tags per campaign (e.g., *Smuggling Partner*, *Blood Oath*) with dedicated color coding.
  * Full multi-selection badge manager modal accessible directly from each contact card on the Character Sheet.

* **Faction Affiliation Architecture (`NpcTracker.tsx`)**:
  * NPCs now formally link to campaign factions (`faction_id`) with a designated rank/role title, or can be assigned as *Independent / Unaligned*.
  * NPC cards render styled faction badges with Roman numeral Tier indicators (e.g., *The Lampblacks (Tier II)*).
  * Full NPC modal for creating and updating faction ties, aliases, quirks, notes, and GM visibility.

* **Multi-Character Relationship Chips & Filtering**:
  * Each NPC card displays connection chips for every linked scoundrel in the campaign, showcasing their sentiment score, friendly/hostile status indicator, assigned badges, and narrative notes.
  * Added dynamic filtering on the NPC Tracker: filter by Faction, linked Scoundrel, Badge, or full-text query.

* **Character Sheet Contacts Tab (`CharacterSheet.tsx`)**:
  * Dedicated *Street Contacts & Relations* management view.
  * Interactive 1–100 slider with quick $\pm5$ adjustment buttons and responsive sentiment styling.
  * Inline public narrative notes and confidential GM plot hook notes with role-based visibility.

#### 🗄️ Database & Schema (`supabase/migrations/20261021000000_npc_affiliations_and_relations.sql`)
* Added table `campaign_relationship_labels` with unique campaign scoping and RLS policies.
* Added table `character_npc_relations` with foreign keys to `characters` and `npcs`, check constraint `score BETWEEN 1 AND 100`, and unique constraint `(character_id, npc_id)`.
* Added helper function `owns_character` for row-level security enforcement allowing players to edit their own relationships while GMs maintain universal oversight.
* Enabled Supabase Realtime synchronization across relation and label tables.

#### 📚 Knowledge & AST Indexation
* Updated `.agent/knowledge/character_playbooks.md` and `.agent/knowledge/factions_and_doskvol.md` with official contact lists and relationship rules.
* Updated `graphify-ts` knowledge graph to 182 nodes and 266 dependency edges.

---

## [0.1.5] — 2026-10-21

### 🚀 CI/CD & GitHub Pages Automated Deployment

* Configured GitHub Actions workflow (`.github/workflows/deploy.yml`) for static Next.js export and automated deployment to GitHub Pages.
* Configured `next.config.ts` with `output: 'export'` and repository subpath routing.
* Enabled `--legacy-peer-deps` resolution for build pipeline compatibility with `graphify-ts`.

---

## [0.1.0] — 2026-10-20

### 🏛️ Initial Release — Core Campaign Suite

The foundational launch of the Blades in the Dark Campaign Suite Revamped, providing a dark Victorian steampunk platform for tabletop scoundrels and Game Masters.

#### Core Features
* **Multi-Campaign Tenancy & Auth**:
  * Supabase PostgreSQL schema with strict Row-Level Security (RLS) isolating GM and Player permissions per campaign.
  * Realtime state synchronization across players and Game Masters.
  * Campaign switcher and token-based player invite system.

* **Scoundrel Character Sheet (`CharacterSheet.tsx`)**:
  * Full tracking for all 7 Scoundrel playbooks: Cutter, Hound, Leech, Lurk, Slide, Spider, and Whisper.
  * Interactive 0–9 Stress track with automated Trauma triggers (Cold, Haunted, Obsessed, Paranoid, Reckless, Soft, Unstable, Vicious).
  * Segmented Level 1, 2, and 3 Harm matrix with Armor usage tracking (Standard, Heavy, Special).
  * Action ratings across Insight, Prowess, and Resolve with 6-segment Attribute XP tracks.
  * Playbook advancement engine with 8-box Playbook XP and Level-Up ability unlocks.
  * Scoundrel economy managing Coin Purse (0–4) and Stash (0–40) with retirement lifestyle grading.
  * Standard items and playbook-unique equipment with dynamic load calculation (Light, Normal, Heavy).

* **Crew Sheet & Interactive Claims Map (`CrewSheet.tsx`, `ClaimsMap.tsx`)**:
  * 6 Crew Playbooks: Assassins, Bravos, Cult, Hawkers, Shadows, Smugglers.
  * Rep, Tier, Hold (Weak/Strong), Heat (0–9), and Wanted Level (0–4) tracking.
  * Crew Vault management with upgradeable capacity.
  * Visual interactive Claims Map with claim capture, prerequisites, and turf mechanics.

* **Linear Progress Clocks Engine (`LinearClock.tsx`, `ClocksManager.tsx`)**:
  * Strict SRD compliance: Segmented linear progress bars (4, 6, 8, 12 segments) replacing ambiguous circular charts.
  * Clock categories: Obstacle, Danger, Project, and Tug-of-War.
  * Role-based visibility: Public, GM-only, and Character-private clocks with color theming.

* **GM Faction Tracker & Faction Turn Engine (`FactionsTracker.tsx`)**:
  * 12 canonical Doskvol factions (The Lampblacks, Red Sashes, Crows, Bluecoats, Dimmer Sisters, Sparkwrights, Lord Scurlock, etc.) across Institutions, Underworld, and Labor/Occult categories.
  * 7-step Faction Status ladder ($-3$ At War to $+3$ Allies).
  * Automated GM Faction Turn simulation: advances faction clocks, executes fortune rolls, and applies tier/hold changes.

* **Rules-Compliant Dice Roller (`DiceRoller.tsx`, `roller.ts`)**:
  * Full implementation of Blades in the Dark dice pool resolution, including the official **0d rule** (roll 2 take lowest).
  * Action rolls with Position (Controlled, Risky, Desperate) and Effect (None, Limited, Standard, Great) matrices.
  * Criticals (multiple 6s), Full Success (6), Partial Success (4/5), and Bad Outcome (1–3) with automatic clock ticks and consequences.
  * Resistance rolls (Resolve/Insight/Prowess) calculating $6 - \text{highest die}$ stress cost.

* **Downtime Phase Wizard (`DowntimeWizard.tsx`, `downtime.ts`)**:
  * Payoff & Rep calculation based on score scale and crew tier.
  * Heat accumulation from smooth, noisy, or lethal operations.
  * Entanglements table roll resolution according to current Wanted Level.
  * Automated downtime activity logging: Indulge Vice (with overindulgence rules), Recover from Harm, Acquire Asset, Long-Term Project advancement, and Incarceration.

* **Journal & Campaign Ledger (`JournalLedger.tsx`)**:
  * Session logs, character notes, GM secret files, and score chronicles.
  * Audit ledger tracking coin, stash, rep, and heat transactions.
