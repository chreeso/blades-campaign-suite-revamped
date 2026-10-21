---
name: blades-rules
description: Validates and guides the implementation of Blades in the Dark SRD rules, mechanics, character creation, and downtime systems.
---

# Blades in the Dark Rules Arbiter Skill

## Purpose
This skill ensures that all application logic, database schemas, validation functions, and user interactions strictly adhere to the official Blades in the Dark ruleset (John Harper).

## When to Use
- Implementing or updating action roll calculation, position, effect, and consequence resolution.
- Enforcing stress tracks (0-9), trauma acquisition (at 10th stress), and the 4-trauma retirement rule.
- Calculating harm tiers (Level 1, 2, 3, 4) and applying automatic roll penalties or incapacitation.
- Validating playbook-specific starting dots, special abilities, and load limits (Light, Normal, Heavy).
- Implementing Crew sheets, Tier calculation, Hold (Weak/Strong), Rep, Turf, and Vault capacities.
- Processing Downtime phases: Payoff, Heat rollover at 9 into Wanted Level, Entanglements, and Vice Overindulgence.

## Core Rules Checklist
1. **Dice Pool Mechanics**:
   - 0 action dots = roll 2d6, take the lowest die.
   - Highest 6 = Full Success; 4/5 = Partial; 1-3 = Bad outcome; Two or more 6s = Critical.
   - Pushing yourself costs 2 stress (+1d or +1 effect).
   - Resistance roll stress cost is `6 - highest die` (Insight, Prowess, or Resolve); Critical clears 1 stress.
2. **Harm Overfill**:
   - If a harm slot at a given level is full and another harm of that level is taken, it automatically cascades to the next higher level.
3. **Purse & Stash Economy**:
   - Scoundrel purse max is 4 Coin.
   - Stash holds up to 40 Coin with 4 retirement lifestyles.
   - Withdrawing from Stash to Purse costs 2 Stash per 1 Coin.
4. **Knowledge Cross-Reference**:
   - Consult `.agent/knowledge/core_mechanics.md` for dice resolution and harm.
   - Consult `.agent/knowledge/character_playbooks.md` for the 7 scoundrel playbooks.
   - Consult `.agent/knowledge/crew_playbooks.md` for the 6 crew types.
   - Consult `.agent/knowledge/downtime_and_economy.md` for scores, downtime, and economy.
   - Consult `.agent/knowledge/clocks_and_progress.md` for linear progress clocks.
