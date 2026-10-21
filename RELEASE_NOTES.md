# Release Notes — Blades in the Dark Campaign Suite

All notable changes, architectural milestones, and rule implementations for the **Blades Campaign Suite Revamped** are documented in this file.

The project follows [Semantic Versioning](https://semver.org/) and strict adherence to the **Blades in the Dark System Reference Document (SRD)**.

---

## [0.5.1] — 2026-10-21

### 💉 Scoundrel Recovery Engine & 4-Segment Healing Clock

This release implements the full, authentic **Recovery and Healing** mechanics from the *Blades in the Dark* System Reference Document (RAW p. 155). Scoundrels now track their own dedicated 4-segment linear Healing project clock, can seek treatment from physickers or attempt self-treatment via Tinker, and experience automatic cascading harm reduction upon clock completion.

#### 🌟 Key Improvements

* **Dedicated 4-Segment Healing Clock (`HarmMatrix.tsx`, `CharacterSheet.tsx`)**:
  * Added `healing_clock: number` (0 to 4) to the character model and UI.
  * Rendered as an interactive 4-segment linear progress bar directly within the **Harm & Armor** matrix on the character sheet.
  * Supports manual segment adjustments and a one-click manual "Heal 1 Level (Clear Clock)" action for table flexibility.

* **Authentic Downtime Recovery Activity (`DowntimeWizard.tsx`, `downtime.ts`)**:
  * **Treatment Selection**: Scoundrels can choose treatment from an NPC Physicker (Quality 1d–4d, default 2d) or attempt Self-Treatment via their **Tinker** action rating.
  * **Incapacitation Cost (RAW p. 155)**: Attempting self-treatment while suffering Level 3 harm automatically imposes a 2-stress cost to push through the agony.
  * **Standard Recovery Tick Table**: Critical $\to$ 5 ticks (fills 4 and carries over 1); 6 $\to$ 3 ticks; 4/5 $\to$ 2 ticks; 1–3 $\to$ 1 tick.

* **Automated Cascading Harm Reduction (`downtime.ts`)**:
  * When the 4-segment Healing clock reaches or exceeds 4 segments:
    * All **Level 1** harms are completely cleared.
    * All **Level 2** harms are shifted down to Level 1.
    * Any **Level 3** harm is shifted down to Level 2.
    * Clock resets to 0 (carrying over any remainder from critical rolls).

---

## [0.5.0] — 2026-10-21

### ⚔️ The Engagement Roll & Score Planning Engine

This release introduces the canonical **Engagement Roll** system from the *Blades in the Dark* System Reference Document (RAW p. 127–131). It allows the crew to establish their operational plan archetype, enter required details, evaluate situational advantages and disadvantages, and roll for their initial fiction and starting obstacle position (**Controlled**, **Risky**, or **Desperate**).

#### 🌟 Key Improvements

* **Engagement Roll Dialog (`EngagementRollModal.tsx`)**:
  * **6 Operation Plan Archetypes**: Direct support for *Assault, Deception, Stealth, Occult, Social,* and *Transport*, complete with thematic icons, rules descriptions, and prompt examples.
  * **Required Plan Detail**: Enforces single-sentence detail input tailored to the selected plan archetype (e.g. point of attack, method of deception, infiltration route).
  * **Dynamic Target & Tier Comparison**: Automatic calculation of Tier difference against campaign factions or independent targets (+1d per tier above target; -1d per tier below target).
  * **Operational Circumstance Toggles**: Checklists for canonical advantage (+1d bold, +1d target vulnerability, +1d contact intel, +1d prior setup) and disadvantage (-1d target fortified, -1d hostile territory/war, -1d supernatural/weather hazards).
  * **Deterministic Fortune Resolution (`roller.ts`)**: Calculates net dice pool starting from 1d base luck, with 0-dice fallback (`min(2d)`). Outputs starting position (Critical/6 $\to$ Controlled, 4/5 $\to$ Risky, 1-3 $\to$ Desperate) and initial obstacle friction prompt.

* **Score Initiation & Seamless Action Transition (`page.tsx`, `DiceRoller.tsx`)**:
  * Added prominent **"Plan Score"** launcher button to the main top-bar header.
  * **"Begin First Action"** handoff: Concluding an engagement roll immediately transitions into the `DiceRoller` with the determined starting position and narrative context preloaded.
  * **"Log in Journal"**: Automatically formats and records the score plan, target, modifiers, dice roll, and starting position directly into the campaign ledger as a permanent `score_log`.

---

## [0.4.2] — 2026-10-21

### ⚓ Action Rating Cap (3 Dots) & Crew Mastery Gating

This release strictly enforces the Blades in the Dark SRD Rules-As-Written (RAW p. 998 & 1409) governing action rating limits: action ratings are capped at **3 dots** during standard advancement, and can only reach **4 dots** when the crew has unlocked the **Mastery** upgrade.

#### 🌟 Key Improvements

* **Strict Action Rating Ceiling (`CharacterSheet.tsx`)**:
  * Action ratings are capped at **3 dots** during normal play and advancement.
  * Attempting to advance a 3-dot action without Crew Mastery is disabled in the UI, displaying `Needs Mastery`.
  * Added an Action Cap & Mastery Banner in the advancement modal indicating the active cap (`Cap: 3 Dots` vs `Cap: 4 Dots`).
  * In Edit Mode, manual dot setting is also clamped to 3 dots unless Crew Mastery is active or the user is the GM.

* **Live Crew Mastery Integration (`CharacterSheet.tsx`, `page.tsx`)**:
  * Connected `CharacterSheet` with the active campaign `Crew` state.
  * Character advancement dynamically responds whenever the crew unlocks or modifies upgrades.

* **Crew Upgrades & Training Management (`CrewSheet.tsx`)**:
  * Added an interactive **Crew Upgrades & Training** panel to the Crew Sheet.
  * Allows toggling key crew upgrades including **Mastery**, **Training** (Insight, Prowess, Resolve, Personal), **Hardened**, **Lair Security**, **Quality Weapons**, and **Fine Shadow Cloaks**.
  * Unlocking Mastery immediately lifts the action rating cap to 4 dots for all crew members.

---

## [0.4.1] — 2026-10-21

### ⚖️ SRD Attribute Advancement Alignment & Knowledge Sync

This patch aligns character advancement and attribute ratings strictly with the official **Blades in the Dark System Reference Document (SRD p. 48)**, restoring the 6-XP attribute advancement trigger, adding calculated attribute ratings, purifying playbook advancement, and updating the ground-truth knowledge base.

#### 🌟 New Features & Enhancements

* **Restored Attribute Advancement Trigger (`CharacterSheet.tsx`)**:
  * Added a prominent `Advance (6 XP)` button to each attribute header (Insight, Prowess, Resolve) whenever 6 XP is accumulated.
  * Launches the targeted modal allowing players to select any nested action to advance by +1 dot, resetting the 6 XP upon confirmation.
  * Enforces the standard SRD action rating ceiling of **3 dots** (or 4 dots with crew Mastery).

* **Calculated Attribute Ratings Display (`CharacterSheet.tsx`)**:
  * Dynamically calculates each Attribute Rating (count of actions in that attribute with $\ge 1$ dot — the first column).
  * Displays the rating as a dedicated badge in each attribute header (e.g., `Insight: 2d`, `Prowess: 3d`, `Resolve: 1d`).
  * Updated the `Resist` button label to explicitly display the scoundrel's resistance dice pool size.

* **Playbook Advancement SRD Purification (`CharacterSheet.tsx`)**:
  * Removed the non-SRD "+1 Action Dot" option from the 8-XP Playbook advancement dialog.
  * Streamlined Playbook advancement to strictly offer **Playbook Special Abilities** and **Veteran Special Abilities** per SRD p. 48.
  * Guaranteed that Action Dots can only be advanced through their respective Attribute XP tracks.

#### 📚 Knowledge Base Synchronizations (`.agent/knowledge/`)

* **`character_playbooks.md`**:
  * Corrected Section 3 to specify that Playbook XP (8 XP) is exclusively for Special Abilities.
  * Documented the Attribute Rating derivation and the 3-dot standard / 4-dot Mastery ceiling invariants.
* **`core_mechanics.md`**:
  * Specified that Resistance pools equal the calculated Attribute Rating.
  * Corrected Prowess action terminology (*Skulk* $\rightarrow$ *Skirmish*).
* **`glossary.md`**:
  * Added explicit canonical definitions for **Attribute Rating** and **Advancement & XP Tracks**.
* **`crew_playbooks.md`**:
  * Documented the **Mastery** upgrade (unlocks 4th dot in action ratings) and **Training** upgrades (+1 bonus XP in downtime).

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
