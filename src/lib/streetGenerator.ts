import { DistrictId, ProceduralStreet, StreetTrait } from '@/types/blades';
import {
  DISTRICT_FLAVORS,
  STREET_BUILDINGS,
  STREET_COMPLICATIONS,
  STREET_ENCOUNTERS,
  STREET_MOODS,
  STREET_NAME_PREFIXES,
  STREET_NAME_SUFFIXES,
  STREET_ODDITIES,
  STREET_SIGHTS,
  STREET_SMELLS,
  STREET_SOUNDS,
  STREET_TYPES,
  STREET_UNIQUE_NAMES
} from '@/lib/constants/streetOracles';

/** Random source returning a float in [0, 1). Injectable for deterministic tests. */
export type RandomSource = () => number;

/** Probability that a trait with a district-specific pool draws from that pool. */
export const DISTRICT_BIAS = 0.5;

/** Probability that a street receives a unique historic name instead of prefix + suffix. */
const UNIQUE_NAME_CHANCE = 0.15;

export const ALL_STREET_TRAITS: StreetTrait[] = [
  'name',
  'streetType',
  'mood',
  'sight',
  'sound',
  'smell',
  'building',
  'oddity',
  'encounter',
  'complication'
];

export interface GenerateStreetOptions {
  districtId: DistrictId;
  /** Previous street whose locked traits should be preserved. */
  previous?: ProceduralStreet;
  /** Traits to keep from `previous` (ignored if `previous` is absent or from another district for district-biased traits). */
  locked?: StreetTrait[];
  rng?: RandomSource;
}

function pick<T>(arr: readonly T[], rng: RandomSource): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Picks from the district pool with `DISTRICT_BIAS` probability, otherwise from the general table. */
function pickBiased(general: readonly string[], local: readonly string[] | undefined, rng: RandomSource): string {
  if (local && local.length > 0 && rng() < DISTRICT_BIAS) {
    return pick(local, rng);
  }
  return pick(general, rng);
}

function generateStreetName(rng: RandomSource): string {
  if (rng() < UNIQUE_NAME_CHANCE) {
    return pick(STREET_UNIQUE_NAMES, rng);
  }
  return `${pick(STREET_NAME_PREFIXES, rng)} ${pick(STREET_NAME_SUFFIXES, rng)}`;
}

/** Rolls a single trait for the given district. */
export function rollStreetTrait(trait: StreetTrait, districtId: DistrictId, rng: RandomSource = Math.random): string {
  const flavor = DISTRICT_FLAVORS[districtId];
  switch (trait) {
    case 'name':
      return generateStreetName(rng);
    case 'streetType':
      return pickBiased(STREET_TYPES, flavor?.streetTypes, rng);
    case 'mood':
      return pick(STREET_MOODS, rng);
    case 'sight':
      return pickBiased(STREET_SIGHTS, flavor?.sights, rng);
    case 'sound':
      return pick(STREET_SOUNDS, rng);
    case 'smell':
      return pick(STREET_SMELLS, rng);
    case 'building':
      return pickBiased(STREET_BUILDINGS, flavor?.buildings, rng);
    case 'oddity':
      return pick(STREET_ODDITIES, rng);
    case 'encounter':
      return pickBiased(STREET_ENCOUNTERS, flavor?.encounters, rng);
    case 'complication':
      return pick(STREET_COMPLICATIONS, rng);
  }
}

/**
 * Generates a complete street scene. Traits listed in `locked` are copied from
 * `previous`; every other trait is freshly rolled with district bias.
 */
export function generateProceduralStreet({
  districtId,
  previous,
  locked = [],
  rng = Math.random
}: GenerateStreetOptions): ProceduralStreet {
  const lockedSet = new Set(previous ? locked : []);
  const street = { districtId } as ProceduralStreet;
  for (const trait of ALL_STREET_TRAITS) {
    street[trait] = lockedSet.has(trait) && previous ? previous[trait] : rollStreetTrait(trait, districtId, rng);
  }
  return street;
}

/** Rerolls a single trait, leaving the rest of the street untouched. */
export function rerollStreetTrait(
  street: ProceduralStreet,
  trait: StreetTrait,
  rng: RandomSource = Math.random
): ProceduralStreet {
  return { ...street, [trait]: rollStreetTrait(trait, street.districtId, rng) };
}

/** Formats a street scene as Markdown-ish text for the campaign journal. */
export function formatStreetForJournal(street: ProceduralStreet, districtName: string): string {
  return [
    `**${street.name}** — ${districtName}`,
    `*${street.streetType}*`,
    '',
    `- **Mood:** ${street.mood}`,
    `- **Sight:** ${street.sight}`,
    `- **Sound:** ${street.sound}`,
    `- **Smell:** ${street.smell}`,
    `- **Building:** ${street.building}`,
    `- **Oddity:** ${street.oddity}`,
    `- **Encounter:** ${street.encounter}`,
    `- **Complication:** ${street.complication}`
  ].join('\n');
}
