# Blades in the Dark — Core Mechanics & Rules Engine Reference

This document outlines the exact deterministic logic, dice mechanics, and consequence handling required for implementing the Blades in the Dark rules engine.

---

## 1. Action Rolls & Dice Resolution

### Dice Pool Calculation
* **Base Dice**: Number of dots in the action rating being rolled (0 to 4 dots).
* **Zero Dots Rule**: If rolling an action with 0 dots, roll **two dice and take the lowest result**.
* **Modifiers**:
  - +1d for pushing yourself (spend 2 stress) OR taking a Devil's Bargain.
  - +1d if an ally assists you (the assisting scoundrel suffers 1 stress).

### Outcome Resolution
* **Critical Success (Two or more 6s)**: Full success + exceptional bonus or increased effect (+1 effect tier).
* **Full Success (Highest die is 6)**: The action succeeds cleanly without negative consequence.
* **Partial Success (Highest die is 4 or 5)**: The action succeeds, but a consequence occurs.
* **Bad Outcome / Failure (Highest die is 1, 2, or 3)**: The action fails or complications arise, and a consequence occurs.

---

## 2. Position & Effect Matrix

Every action roll has a **Position** (how dangerous it is) and an **Effect** (how much progress it achieves).

| Position | 6 (Full Success) | 4/5 (Partial Success) | 1-3 (Bad Outcome) |
| :--- | :--- | :--- | :--- |
| **Controlled** | Full effect, no consequence | Reduced effect OR minor complication OR take a riskier stance | Minor complication OR suffer 1 stress OR try another approach |
| **Risky** (Default) | Full effect, no consequence | Full effect + standard consequence (Level 2 harm, 2 heat, clock tick, reduced effect) | Standard consequence (Level 2 harm, clock tick, lost opportunity, severe complication) |
| **Desperate** | Full effect, no consequence | Full effect + severe consequence (Level 3 harm, catastrophic clock tick) | Severe consequence (Level 3 harm, catastrophic failure, lost opportunity) |

*XP Trigger*: An action roll in a **Desperate** position immediately marks **1 XP** in the attribute track associated with that action.

### Effect Levels
* **Great Effect**: 3 ticks on a clock, or exceptional narrative impact.
* **Standard Effect**: 2 ticks on a clock, or expected impact.
* **Limited Effect**: 1 tick on a clock, or minor impact.
* **Zero Effect**: 0 ticks on a clock until modified by push (+1 effect), fine gear, or teamwork setup.

---

## 3. Stress, Resistance & Armor

### Stress (0 to 9)
* Players can spend 2 stress to:
  1. Add +1d to their action roll.
  2. Increase their effect by +1 level.
  3. Perform a flashback action (cost: 0 stress for simple prep, 1 stress for complex, 2+ for intricate/unlikely).

### Trauma (0 to 4)
* When a scoundrel takes their 10th stress:
  1. Stress counter immediately resets to 0.
  2. The scoundrel is incapacitated or knocked out of the current score.
  3. Player chooses 1 permanent Trauma condition from:
     - `Cold`, `Haunted`, `Obsessed`, `Paranoid`, `Reckless`, `Soft`, `Unstable`, `Vicious`.
  4. Upon reaching 4 Trauma conditions, the scoundrel must be permanently retired.

### Resistance Rolls
* Players can resist any consequence announced by the GM.
* Resistance cannot fail; it always negates or reduces the consequence.
* Player rolls the associated **Attribute** pool:
  - The pool equals the scoundrel's **Attribute Rating** (the count of actions under that attribute with $\ge 1$ dot — the first column).
  - **Insight**: Hunt, Study, Survey, Tinker.
  - **Prowess**: Finesse, Prowl, Skirmish, Wreck.
  - **Resolve**: Attune, Command, Consort, Sway.
* **Stress Cost**: `6 - highest die`.
  - If critical (two 6s): **Clear 1 stress** instead of taking stress!
  - If rolling with 0 dots in attribute: Roll 2d, take lowest; cost is `6 - lowest die`.

### Armor
* **Standard Armor** (1 use per score): Downgrade incoming physical harm by 1 level (e.g. Level 3 -> Level 2).
* **Heavy Armor** (1 use per score, requires Heavy load): Downgrade an additional harm level.
* **Special Armor** (Playbook specific, 1 use per score): Resists a specific consequence without rolling or spending stress.

---

## 4. Harm Tracking System

Scoundrel harm is tracked in discrete slots:
* **Level 1 (Lesser)** — 2 slots: "-1d when penalty applies" (e.g. Sprained Ankle, Dazed).
* **Level 2 (Moderate)** — 2 slots: "-1d to ALL actions" (e.g. Broken Ribs, Exhausted, Concussed).
* **Level 3 (Severe)** — 1 slot: "Incapacitated" — cannot act without pushing yourself or receiving help (e.g. Skewered, Deep Puncture, Bleeding Out).
* **Level 4 (Fatal)** — Immediate death unless resisted or armored down.

*Harm Overfill Rule*: If a harm slot is already occupied and a scoundrel suffers that level again, the harm automatically upgrades to the next higher slot level.

---

## 5. Teamwork Actions

Scoundrels operating together can use 4 teamwork maneuvers:
1. **Assist**: Spend 1 stress to grant an ally +1d on their roll.
2. **Lead a Group Action**: Multiple scoundrels roll the same action; the leader suffers 1 stress for each roll that results in 1-3. The best result counts for everyone.
3. **Protect**: Suffer a consequence in place of a teammate (and can resist it normally).
4. **Setup**: Make an action roll that grants +1 effect or improved position (+1 step) to a teammate who follows up.
