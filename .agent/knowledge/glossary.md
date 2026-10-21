# Blades in the Dark — Glossary & Lexicon

This reference glossary provides concise, unambiguous definitions of core terms in Blades in the Dark for AI agents and code generators.

---

### Core Mechanics & Rolls
* **Action Roll**: Dice pool roll (highest die determines outcome) used when an action faces danger or opposition. Pool = dots in action rating + bonus dice (push, assist, Devil's Bargain).
  - `6`: Full success.
  - `4/5`: Partial success (success with consequence).
  - `1-3`: Bad outcome (consequence/failure).
  - `Critical (two or more 6s)`: Success with enhanced effect.
* **Position**: Danger level of an action roll:
  - **Controlled**: Minor consequences on 4/5 or 1-3. Can try another approach.
  - **Risky**: Standard consequences (harm, heat, complication, reduced effect). Default position.
  - **Desperate**: Severe consequences (severe harm, catastrophic trouble). Gives 1 xp on action roll.
* **Effect Level**: How much progress an action achieves:
  - **None**: No meaningful impact.
  - **Limited**: Minor impact or 1 tick on a complex clock.
  - **Standard**: Expected outcome or 2 ticks on a clock.
  - **Great**: Exceptional outcome or 3 ticks on a clock.
  - Factors modifying effect: Quality/Tier difference, Scale, Potency.
* **Fortune Roll**: Dispassionate roll by the GM or player to determine an outcome outside direct player skill or when luck/factions collide.
* **Resistance Roll**: A roll using an Attribute rating (Insight, Prowess, Resolve) to negate or mitigate a consequence. Stress suffered = `6 - highest die` (or recover 1 stress on a Critical).
* **Devil's Bargain**: An optional GM/player offer: +1d to an action roll in exchange for an immediate, irrevocable narrative consequence, regardless of roll success.
* **Push Yourself**: Spend 2 stress to either take +1d to a roll or improve effect by +1 level.

---

### Scoundrel State & Economy
* **Stress**: Mental, emotional, and physical exhaustion buffer (0 to 9 stress boxes). Spending or suffering stress absorbs consequences and powers special abilities.
* **Trauma**: Gained when stress exceeds 9. The scoundrel resets stress to 0, is taken out of action for the scene, and selects 1 permanent Trauma condition (Cold, Haunted, Obsessed, Paranoid, Reckless, Soft, Unstable, Vicious). At 4 traumas, the character must retire.
* **Harm**: Physical or mental injuries tracked on 3 levels:
  - Level 1 (lesser): -1d when that specific harm applies (two slots).
  - Level 2 (moderate): -1d to all actions (two slots).
  - Level 3 (severe): Incapacitated without assistance/pushing (one slot).
  - Level 4 (fatal): Death.
* **Armor**: Equipment used to reduce a harm level by 1 tier (Standard Armor, Heavy Armor, Special Armor).
* **Load**: Declared at the start of an operation, determining how many items a scoundrel can produce mid-score:
  - **Light (≤3)**: Agile, unnoticeable as a criminal.
  - **Normal (4-5)**: Ready for trouble, looks like a working scoundrel.
  - **Heavy (6)**: Encumbered, visibly armed and conspicuous.
* **Coin**: Liquid monetary value.
  - Character purse holds up to 4 Coin on person.
  - Stash holds up to 40 Coin for long-term lifestyle, legal defense, and retirement.
* **Stash**: Wealth put away safely. Every 10 Stash increases retirement tier (Poor, Modest, Fine, Luxurious).

---

### Crew & Faction System
* **Rep (Reputation)**: Clout on the streets (0 to 12). Reaching 12 Rep allows the crew to advance Tier (if Hold is Strong and coin cost is paid).
* **Heat**: Law enforcement and underworld attention accumulated from scores (0 to 9). At 9 Heat, Wanted Level increases by 1 and Heat resets.
* **Wanted Level**: Severity of police pursuit (0 to 4). Sets prison sentences and triggers severe Entanglements.
* **Tier**: Power and scale of a faction or crew (0 to V). Sets the quality of gear and baseline cohort strength.
* **Hold**: Grip on power within a Tier: **Weak** or **Strong**. Moving from Weak to Strong costs Rep/Coin; falling from Weak drops Tier by 1.
* **Turf**: Claims of territory that reduce the Rep cost to increase Tier.
* **Vault**: Secure storage in the crew lair for excess Coin. Baseline capacity is 4 Coin, upgraded via crew enhancements to 8 or 16.

---

### Progress Clocks
* **Clock**: A segmented linear or circular progress tracker representing obstacles, danger, countdowns, tug-of-war, or long-term projects. Standard segment counts: **4**, **6**, **8**, **12**.
  - **Obstacle Clock**: Filled to overcome a barrier (ticks = effect level).
  - **Danger Clock**: Filled when consequences trigger or countdowns advance.
  - **Long-Term Project Clock**: Advanced during downtime activities (Healing, Crafting, Research).
  - **Tug-of-War Clock**: Two opposing sides fill or unfill segments against each other.

---

### Downtime Phases
* **Payoff**: Distributing Coin and Rep earned from a score based on target Tier and risk.
* **Heat Roll**: Adding heat based on score noise, dead bodies, and district alert level.
* **Entanglements**: A fortune roll based on Wanted Level determining underworld complications (e.g. Unquiet Dead, Gang War, Bluecoats).
* **Downtime Activities**: Each scoundrel receives 2 free activities (1 if in war). Extra activities cost 1 Coin or 1 Rep each:
  - **Indulge Vice**: Clear stress equal to the highest die of a Vice roll. (Rolling higher than current stress causes Overindulgence).
  - **Recover / Heal**: Tick the healing project clock.
  - **Acquire Asset**: Temporary cohort, fine item, or service.
  - **Long-Term Project**: Tick a project clock.
  - **Reduce Heat**: Roll Ingratiate/Prowl/etc. to lower Heat.
  - **Train**: Mark 1 xp in an attribute or playbook track.
