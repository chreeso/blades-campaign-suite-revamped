import { ENTANGLEMENTS_TABLE, EntanglementInfo } from './constants/entanglements';

export type ScoreScale = 'minor' | 'standard' | 'major' | 'spectacular';

export interface PayoffResult {
  coin: number;
  rep: number;
  tithe: number;
  netCoin: number;
}

export function calculatePayoff(
  crewTier: number,
  targetTier: number,
  scale: ScoreScale,
  customCoin?: number,
  tithe: number = 0
): PayoffResult {
  let coin = 6;
  if (customCoin !== undefined) {
    coin = customCoin;
  } else {
    switch (scale) {
      case 'minor':
        coin = 2;
        break;
      case 'standard':
        coin = 6;
        break;
      case 'major':
        coin = 8;
        break;
      case 'spectacular':
        coin = 10;
        break;
    }
  }

  let rep = 2;
  if (targetTier > crewTier) {
    rep = 2 + (targetTier - crewTier);
  } else if (targetTier < crewTier) {
    rep = 1;
  } else {
    rep = 2;
  }

  const netCoin = Math.max(0, coin - tithe);

  return {
    coin,
    rep,
    tithe,
    netCoin
  };
}

export interface HeatCalculationResult {
  baseHeat: number;
  killingModifier: number;
  districtModifier: number;
  totalAddedHeat: number;
  newHeat: number;
  newWantedLevel: number;
  wantedLevelRolledOver: boolean;
}

export function calculateHeatRollover(
  currentHeat: number,
  currentWanted: number,
  baseHeat: number,
  anyoneKilled: boolean,
  districtAlert: number = 0
): HeatCalculationResult {
  const killingModifier = anyoneKilled ? 2 : 0;
  const districtModifier = districtAlert;
  const totalAddedHeat = baseHeat + killingModifier + districtModifier;

  const totalHeat = currentHeat + totalAddedHeat;
  let newWanted = currentWanted;
  let newHeat = totalHeat;

  if (totalHeat >= 9) {
    const additionalWanted = Math.floor(totalHeat / 9);
    newWanted = Math.min(4, currentWanted + additionalWanted);
    newHeat = totalHeat % 9;
  }

  return {
    baseHeat,
    killingModifier,
    districtModifier,
    totalAddedHeat,
    newHeat,
    newWantedLevel: newWanted,
    wantedLevelRolledOver: newWanted > currentWanted
  };
}

export interface EntanglementRollResult {
  dice: number[];
  chosenDie: number;
  bracket: '1-3' | '4-5' | '6';
  entanglement: EntanglementInfo;
}

export function rollEntanglement(wantedLevel: number): EntanglementRollResult {
  const isZeroDice = wantedLevel <= 0;
  const diceCount = isZeroDice ? 2 : wantedLevel;
  const dice = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);

  const chosenDie = isZeroDice ? Math.min(...dice) : Math.max(...dice);

  const tierKey: 'low' | 'medium' | 'high' =
    wantedLevel <= 1 ? 'low' : wantedLevel <= 3 ? 'medium' : 'high';

  let bracket: '1-3' | '4-5' | '6' = '1-3';
  if (chosenDie >= 6) {
    bracket = '6';
  } else if (chosenDie >= 4) {
    bracket = '4-5';
  } else {
    bracket = '1-3';
  }

  const entanglement = ENTANGLEMENTS_TABLE[tierKey][bracket];

  return {
    dice,
    chosenDie,
    bracket,
    entanglement
  };
}

export interface ViceRollResult {
  dice: number[];
  chosenDie: number;
  clearedStress: number;
  newStress: number;
  overindulged: boolean;
}

export function resolveViceRoll(
  lowestAttrRating: number,
  currentStress: number
): ViceRollResult {
  const isZeroDice = lowestAttrRating <= 0;
  const diceCount = isZeroDice ? 2 : lowestAttrRating;
  const dice = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);

  const chosenDie = isZeroDice ? Math.min(...dice) : Math.max(...dice);
  const overindulged = chosenDie > currentStress;
  const newStress = Math.max(0, currentStress - chosenDie);

  return {
    dice,
    chosenDie,
    clearedStress: Math.min(currentStress, chosenDie),
    newStress,
    overindulged
  };
}

export function resolveReduceHeatRoll(dicePool: number): {
  dice: number[];
  chosenDie: number;
  heatCleared: number;
} {
  const isZero = dicePool <= 0;
  const count = isZero ? 2 : dicePool;
  const dice = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
  const chosenDie = isZero ? Math.min(...dice) : Math.max(...dice);
  const sixCount = dice.filter((d) => d === 6).length;

  let heatCleared = 1;
  if (sixCount >= 2) {
    heatCleared = 5;
  } else if (chosenDie === 6) {
    heatCleared = 3;
  } else if (chosenDie >= 4) {
    heatCleared = 2;
  } else {
    heatCleared = 1;
  }

  return {
    dice,
    chosenDie,
    heatCleared
  };
}
