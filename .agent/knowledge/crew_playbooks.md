# Blades in the Dark — Crew Playbooks & Faction Assets

This document specifies the data model and mechanics for Crew sheets, claims, upgrades, cohorts, and Tier advancement.

---

## 1. Crew Playbooks

### 1. Assassins
* **Focus**: Killers for hire, executioners, contract snipers.
* **XP Trigger**: *Execute a covert assassination, hit, or lethal contract.*
* **Special Abilities**:
  - `Deadly`: +1d to combat or execution rolls during an assassination score.
  - `Crow's Veil`: Harder for Spirit Wardens to detect bells and hollows when you kill.
  - `Iron Syndicate`: Suffer 1 less stress during physical resistance rolls.
  - `Predators`: When executing a surprise attack, take +1 effect.
  - `Vipers`: +1d when using poisons or alchemicals against targets.

### 2. Bravos
* **Focus**: Extortionists, thugs, street fighters, mercenaries.
* **XP Trigger**: *Execute an extortion, battle, robbery, or show of violent force.*
* **Special Abilities**:
  - `Dangerous`: Each PC gains +1 action dot in Skirmish or Command (up to max 3).
  - `Blood Brothers`: When you fight alongside a cohort, gain +1d.
  - `Fiends`: Suffer 1 less heat from violent scores.
  - `Forged in the Fire`: +1d to resistance rolls against physical consequences.
  - `War Dogs`: Your cohorts are more vicious, resilient, and immune to fear.

### 3. Cult
* **Focus**: Devotees of a Forgotten God, esoteric mystery cult.
* **XP Trigger**: *Advance the agenda of your deity or acquire occult relics/knowledge.*
* **Special Abilities**:
  - `Chosen`: Each PC gains +1 action dot in Attune or Study (up to max 3).
  - `Anointed`: +1d to resist supernatural fear or horror.
  - `Bound in Darkness`: You may spend 1 Rep to gain 2 Coin during occult scores.
  - `Zealots`: Cohorts are fanatically loyal and ignore morale penalties.
  - `Convocation`: Perform rituals with 1 fewer downtime action.

### 4. Hawkers
* **Focus**: Vice dealers, illegal contraband distributors, smugglers of vices.
* **XP Trigger**: *Execute a sale, expand your sales territory, or secure rare product.*
* **Special Abilities**:
  - `Silver Tongues`: Each PC gains +1 action dot in Sway or Consort (up to max 3).
  - `Accord`: When negotiating truce or business deals with other factions, take +1d.
  - `Ghost Market`: Can sell esoteric goods to ghosts and spirits for electroplasmic Coin.
  - `High Society`: +1d when consorting with Tier III+ clientele.
  - `Lookouts`: Suffer 1 less heat from distribution operations.

### 5. Shadows
* **Focus**: Burglars, infiltrators, thieves, espionage agents.
* **XP Trigger**: *Execute a theft, burglary, infiltration, or corporate espionage.*
* **Special Abilities**:
  - `Everyone Steals`: Each PC gains +1 action dot in Prowl or Finesse (up to max 3).
  - `Ghost Passage`: Can bypass security wards and locks using electroplasmic keys.
  - `High-Class Contacts`: +1d when gathering information on elite marks.
  - `Patron`: A powerful patron provides support; -1 heat on scores that advance their interests.
  - `Slippery`: Take -2 heat on scores where no alarms were sounded.

### 6. Smugglers
* **Focus**: Contraband transporters, blockade runners, Deathlands couriers.
* **XP Trigger**: *Execute a transport score through dangerous checkpoints or the Deathlands.*
* **Special Abilities**:
  - `Like Part of the Family`: Each PC gains +1 action dot in Survey or Tinker (up to max 3).
  - `All Hands`: Cohorts have increased vehicle handling and defensive ratings.
  - `Ghost Passage`: Vehicles are protected against Deathlands horrors.
  - `Just Passing Through`: Suffer -1 heat when transporting contraband across district boundaries.
  - `Vehicle`: The crew owns a specialized carriage, barge, or steam rail-crawler.

---

## 2. Crew Economy & Tier Advancement

### Tier, Hold & Rep Engine
* **Reputation (Rep)**: Tracks street renown from 0 to 12.
* **Turf**: Claims on the turf map reduce the Rep required to advance Tier:
  - Required Rep = `12 - count(Turf)`.
* **Hold**:
  - **Weak Hold**: Vulnerable to territory loss; dropping below 0 Hold lowers Tier by 1.
  - **Strong Hold**: Resilient status; can advance Tier by paying Coin and spending required Rep.
* **Tier Cost**: Advancing from Tier `N` to `N+1` costs `(Next Tier × 8) - Turf` Coin (or as specified by hold state).

### Crew Upgrades: Advancement & Training
* **Mastery**: Your scoundrels can advance action ratings to **4 dots** (standard advancement is capped at 3 dots).
* **Training Upgrades** (Insight, Prowess, Resolve, Personal):
  - When a scoundrel performs the **Train** downtime activity for an attribute with a matching crew upgrade, they mark **2 XP** instead of 1.

### Crew Vault & Coin
* Baseline crew vault holds **4 Coin**.
* Upgrade 1: Vault expansion to **8 Coin**.
* Upgrade 2: Vault expansion to **16 Coin**.
* Any Coin gained beyond vault capacity must be either distributed immediately to player purses/stashes or spent on bribes/assets, else it is lost to graft and decay.

---

## 3. Cohorts (Gangs & Experts)
* **Types**:
  - **Gang**: Group of thugs, rovers, adepts, or shadows (Scale based on Tier).
  - **Expert**: Single specialized NPC (Doctor, Investigator, Spy, Alchemist).
* **Quality**: Equals crew Tier.
* **Edges**: Fearsome, Independent, Loyal, Tenacious, Principled.
* **Flaws**: Principled, Savage, Unreliable, Wild, Vulnerable.
* **Harm Track**:
  - Impaired: -1d to rolls.
  - Broken: Incapacitated until recovered.
  - Dead / Destroyed.
