# Blades in the Dark — Downtime Phase & Economy Engine

This document details the mechanics for calculating payoffs, heat accumulation, entanglements, downtime activities, and the dual Coin/Stash economy.

---

## 1. Payoff Engine

After completing a score, the crew collects rewards:
* **Coin Payoff**:
  - `2 Coin`: Minor job or low-tier mark.
  - `4-6 Coin`: Standard score with respectable payout.
  - `8 Coin`: Major score against wealthy mark.
  - `10+ Coin`: Spectacular heist against high-tier aristocracy or imperial transport.
* **Reputation (Rep)**:
  - Base: **2 Rep**.
  - If the target is of higher Tier than your crew: **+1 Rep per Tier difference**.
  - If the target is of lower Tier: **1 Rep total**.
  - If the operation was completely secret: **0 Rep** (unless leaked deliberately).
* **Tithes & Costs**:
  - If the crew owes allegiance or protection money to a higher faction, pay 1 Coin tithe.

---

## 2. Heat & Wanted Level Progression

### Heat Calculation
1. **Base Heat per Score**:
   - `0 Heat`: Smooth, unnoticed operation; phantom infiltrations.
   - `2 Heat`: Standard score; contained incident, suspects kept vague.
   - `4 Heat`: Loud, chaotic score; public property destroyed, alarms raised.
   - `6 Heat`: Catastrophic operation; public panic, high-profile scandal.
2. **Body Count Modifier**:
   - **+2 Heat** if anyone was killed during the score (the Spirit Wardens' bells chime across the city).
3. **District Alert Modifier**:
   - Hostile or wealthy district (e.g. Brightstone): +1 or +2 Heat.

### Wanted Level Thresholds
* **Heat Track**: 0 to 9 boxes.
* When the 9th box is marked, the crew gains **+1 Wanted Level** (0 to 4 max).
* Any excess Heat wraps around into the new track (e.g., at 8 Heat + 3 Heat gained = Wanted Level increases by 1, and new Heat is 2).
* Maximum Wanted Level is 4. Reaching max triggers relentless imperial manhunts and Ironhook prison sentences.

---

## 3. Entanglements

After heat is calculated, the GM rolls a die pool equal to the crew's **Wanted Level** (or rolls 2 dice and takes lowest if Wanted Level is 0):

| Roll | Wanted Level 0-1 | Wanted Level 2-3 | Wanted Level 4 |
| :---: | :--- | :--- | :--- |
| **1-3** | **Gang Trouble** or **Usual Suspects** | **Demands** (Faction demands tribute or war) | **Vendetta** or **Flipped** (Allies betray you) |
| **4/5** | **Rivals** (Rival crew makes a play) | **Show of Force** or **Questioning** | **Interrogation** (Bluecoats round up crew associates) |
| **6** | **Unquiet Dead** or **Cooperation** | **Reprisals** (Target strikes back at claims) | **Arrest** (Inspector warrant for a scoundrel's arrest) |

---

## 4. Downtime Activities

Each PC gets **2 free downtime activities** (reduced to **1 activity if the crew is at War**).
Extra activities cost **1 Coin** or **1 Rep** per action.

### 1. Indulge Vice
* The scoundrel visits their purveyor to indulge their vice (Luxury, Obligation, Pleasure, Stupor, Faith, Gambler, Weird).
* Roll dice equal to the character's lowest attribute rating.
* **Stress Cleared**: Value of the highest die.
* **Overindulgence**: If the roll result exceeds the character's current stress, they overindulged! Choose 1:
  - *Attract Trouble*: Select an additional entanglement or +2 heat.
  - *Brag*: Make boastful claims; take +2 heat.
  - *Lost*: Gone for days; absent for the first score of next cycle.
  - *Tapped*: Purveyor cut you off; must find a new purveyor.

### 2. Recover (Healing)
* Advance the healing clock (4 segments) by rolling with a physicker cohort or doctor contact.
* *Level 1 Harm*: Cleared when healing clock fills once.
* *Level 2 Harm*: Reduced to Level 1 when healing clock fills.
* *Level 3 Harm*: Reduced to Level 2 when healing clock fills.

### 3. Acquire Asset
* Roll Crew Tier to temporarily secure a specialized item, vehicle, mercenary squad, or service for the next score.
* Result determines asset quality:
  - 1-3: Crew Tier - 1.
  - 4/5: Crew Tier.
  - 6: Crew Tier + 1.
  - Critical: Crew Tier + 2.

### 4. Long-Term Project
* Work on research, arcane studies, forging documents, or crafting.
* Roll appropriate action rating to tick a project clock (1, 2, or 3 ticks depending on outcome).

### 5. Reduce Heat
* Consort, Sway, or bribe to cover up crimes.
* Roll rating: 1-3 = -1 Heat; 4/5 = -2 Heat; 6 = -3 Heat; Critical = -5 Heat.

### 6. Train
* Mark 1 XP in any attribute track (or playbook track) if the crew possesses the corresponding training upgrade.

---

## 5. Economy Ledger: Purse vs Stash

* **Purse (0 to 4 Coin)**:
  - Carried on person during operations.
  - Can be spent instantly for flashbacks, bribes, or extra downtime activities.
* **Stash (0 to 40 Coin)**:
  - Long-term safety deposit box.
  - Determines scoundrel retirement outcome:
    - `0 - 10`: Poor (Slums of Dunslough, beggar).
    - `11 - 20`: Modest (Working-class home in Charhollow).
    - `21 - 30`: Fine (Townhouse in Six Towers or Nightmarket).
    - `31 - 40`: Luxurious (Manor in Brightstone, high-society life).
* **Liquidation Rule**: Moving Coin from Stash back to Purse costs **2 Stash for 1 Coin** (launderer cut and asset liquidation fee). Depositing Coin from Purse to Stash is 1:1.
