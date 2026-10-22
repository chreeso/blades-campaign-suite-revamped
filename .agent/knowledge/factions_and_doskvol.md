# Blades in the Dark — Factions & The City of Doskvol

This reference document defines the faction system, district geography, and relationship mechanics for GM campaign tracking.

---

## 1. Faction Status Ladder

Relationships between factions (and between the Crew and NPC factions) are tracked on a 7-step scale:

| Status | Meaning | Mechanical Effects |
| :---: | :--- | :--- |
| **+3** | **Allies** | Faction will assist directly, share resources, defend in wars, and provide high-tier assets. |
| **+2** | **Helpful** | Faction is favorably inclined, offers friendly trade terms, and shares rumors. |
| **+1** | **Friendly** | Faction is cordial, will not act against you without cause, and cooperates for mutual benefit. |
| **0** | **Neutral** | Indifferent; strictly transactional or unconcerned with your operations. |
| **-1** | **Unfriendly** | Suspicious, competitive, or charging higher prices; may interfere indirectly. |
| **-2** | **Hostile** | Actively seeking to undermine, sabotage, or displace you; attacks when vulnerable. |
| **-3** | **At War** | Outright armed conflict. **Crew takes -1 Hold while at War, and PCs receive only 1 free downtime action.** |

---

## 2. Prominent Factions of Doskvol

### City Institutions & Law
* **City Council (Tier V, Strong)**: The ruling nobility and treasury heads governing Doskvol.
* **Spirit Wardens (Tier IV, Strong)**: Masked keepers of the death bells and electroplasmic crematoriums.
* **Bluecoats (Tier III, Strong)**: The corrupt, brutal city watch policing the districts.
* **Inspectors (Tier III, Strong)**: Imperial detectives investigating serious crimes and corruption.
* **Imperial Military (Tier VI, Strong)**: Troops stationed at Gaddoc Rail Station and ironclads in the harbor.

### Underworld Powers
* **The Lampblacks (Tier II, Weak)**: Former lamplighters turned street gang led by Bazso Baz, locked in a turf war with the Red Sashes.
* **The Red Sashes (Tier II, Weak)**: Iruvian sword-fighters and academy duelists led by Mylera Klev, commanding Crow's Foot.
* **The Crows (Tier II, Weak)**: The historic ruling gang of Crow's Foot, weakened by the recent assassination of their leader, Roric.
* **The Billhooks (Tier II, Strong)**: Butcher gang armed with meat cleavers and billhooks, based in the Docks.
* **The Dimmer Sisters (Tier II, Strong)**: Reclusive occult sisters living in Six Towers who traffic in ghosts and forgotten lore.
* **The Silver Nails (Tier II, Strong)**: Exiled Severosi cavalry mercenaries and ghost hunters.
* **The Unseen (Tier IV, Strong)**: Secret criminal conspiracy manipulating the city's highest courts and vice syndicates.
* **Lord Scurlock (Tier III, Strong)**: Ancient vampire aristocrat with immense sorcerous power and secret interests.
* **Ulf Ironborn (Tier I, Strong)**: Ruthless Skovlander refugee fighter carving out territory in Coalridge.

### Labor, Trade & The Occult
* **Dockers (Tier III, Strong)**: Fierce, unionized laborers controlling maritime cargo and warehouses.
* **Gondoliers (Tier III, Strong)**: Guild of canal boatmen with secret knowledge of canal wards and spirits.
* **Sparkwrights (Tier IV, Strong)**: Engineers, mechanists, and inventors of electroplasmic technology and the lightning barrier.
* **Leviathan Hunters (Tier V, Strong)**: Massive steam ironclads harvesting demon blood from the dark Void Sea.
* **Forgotten Gods Cults (Tier II, Weak)**: Secret cells worshiping primordial horrors buried before the cataclysm.

---

## 3. Districts of Doskvol
* **Crow's Foot**: Overcrowded criminal crossway; epicenter of the turf war (Lampblacks vs Red Sashes vs Crows).
* **The Docks**: Sights, sounds, and smells of trade; rough sailors, dockers, and smuggled cargo.
* **Charhollow**: Dense working-class tenement neighborhood; community solidarity and activist agitators.
* **Coalridge**: Heavy industrial smoke, textile mills, iron works, and indentured factory labor.
* **Nightmarket**: Bustling nighttime bazaars, street vendors, silk, spices, and exotic goods under glowing lamps.
* **Six Towers**: Fading aristocracy; grand mansions, crumbling estates, and quiet ghost sightings.
* **Brightstone**: Wealthy elite, city administrators, opulent avenues, and heavy Bluecoat presence.
* **Charterhall**: Scholars, magistrates, the University of Doskvol, and bureaucratic courthouses.
* **Dunslough**: Labor camps, the Ironhook Prison, and miserable pauper graves.
* **Silkshore**: Artists, courtesans, pleasure dens, canals, and vice parlors.
* **The Lost District**: Haunted ruin beyond the original lightning barrier, overrun by rogue spirits and horrors.

---

## 4. GM Faction Turn Engine
* Every campaign cycle (usually between scores or during downtime), the GM advances **Faction Clocks**.
* Each active faction advances 1 clock tick (or rolls Fortune: 1-3 = 0 ticks, 4/5 = 1 tick, 6 = 2 ticks, Crit = 3 ticks).
* When a faction clock fills, the faction's status, hold, or territory changes, generating ripples for the player crew.

---

## 5. NPCs, Faction Affiliations & Scoundrel Ties
* **Faction Membership**: Each NPC can be linked to a campaign Faction (`faction_id`) with a defined rank or role (e.g. Leader, Lieutenant, Enforcer, Fence) or designated as Independent.
* **1:N Multi-Player Ties**: Any NPC can hold distinct relationship scores (1–100) and badges with multiple player characters simultaneously.
* **Open Table Visibility**: Relationships are public to the table by default with optional secret GM/player plot notes.
* **Mid-Session Dynamic Creation**: NPCs and emergent factions can be created on the fly mid-score or mid-session via global quick-actions or directly from the Character Sheet, immediately linking initial relationship states.


---

## 6. Street-Level Procedural Generation & Cartography Landmarks

* **Street Oracles (SRD RAW p. 300–305)**:
  * Generates street scenes comprising 10 distinct traits: **Street Name** (prefix/suffix combinations or historic titles), **Layout Type** (alleys, canals, catwalks, boulevards), **Mood**, **Sensory Impressions** (*Sight, Sound, Smell*), **Building Type**, **Architectural Oddity**, **Street Encounter**, and **Occult Complication**.
  * **District Context Biasing**: Rolls are dynamically weighted toward each district's unique socio-economic character (e.g. factory soot in Coalridge, pleasure barges in Silkshore, aristocratic guards in Brightstone).
  * **Improvisational Trait Locking**: GMs can lock any subset of traits (`locked: StreetTrait[]`) to preserve specific elements while rerolling surrounding atmospheric details.
  * **Campaign Journal Integration**: Instant export of generated street dossiers to the session log (`JournalLedger`).
* **Cartography Pin-Drop Engine**:
  * Precision coordinate pinning on the interactive Doskvol SVG map via right-click or crosshair mode.
  * Ray-casting point-in-polygon algorithm automatically maps SVG `(x, y)` coordinates to one of the 12 canonical districts, with nearest-neighbor fallback.
  * Pin categorization: `Landmark`, `Hideout`, `Hazard`, `Shop / Fence`, and `Rumor`.
  * **Role-Based Visibility (RLS)**: Pins support `gm_only` secret flags to hide prep notes and hidden assets from players, strictly enforced at the Supabase PostgreSQL layer (`map_pins`).
