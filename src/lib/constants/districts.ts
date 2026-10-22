import { DistrictId, DistrictWealth } from '@/types/blades';

/** Canonical Doskvol districts rendered on the cartography map (shared with the street generator). */
export interface DistrictInfo {
  id: DistrictId;
  name: string;
  wealth: DistrictWealth;
  description: string;
  mood: string;
  factions: string[];
  path: string; // SVG path
  center: { x: number; y: number };
}

export const DOSKVOL_DISTRICTS: DistrictInfo[] = [
  {
    id: 'crows_foot',
    name: "Crow's Foot",
    wealth: 'Poor',
    description: 'A cramped, filthy district crisscrossed by narrow canals and volatile gang wars.',
    mood: 'Paranoid sentries on rooftops, smoke-filled alleys, and sudden brawls.',
    factions: ['The Lampblacks', 'The Red Sashes', 'The Crows'],
    path: 'M 220 280 L 320 260 L 350 340 L 260 370 Z',
    center: { x: 285, y: 310 }
  },
  {
    id: 'the_docks',
    name: 'The Docks',
    wealth: 'Poor',
    description: 'Towering leviathan hunter ships, stench of whale oil and salt mist, rough taverns.',
    mood: 'Heavy iron chains, burly dockers, rowdy sailors, and fog horns.',
    factions: ['The Fog Hounds', 'The Grinders', 'Gondoliers'],
    path: 'M 320 260 L 440 230 L 460 320 L 350 340 Z',
    center: { x: 390, y: 285 }
  },
  {
    id: 'silkshore',
    name: 'Silkshore',
    wealth: 'Moderate',
    description: 'Canal-threaded pleasure district filled with artists, courtesans, and opium parlors.',
    mood: 'Silk lanterns, vaporous lounges, laughter, and clandestine whispers.',
    factions: ['The Dimmer Sisters', 'The Silver Nails', 'The Hive'],
    path: 'M 260 370 L 350 340 L 380 430 L 280 440 Z',
    center: { x: 315, y: 395 }
  },
  {
    id: 'charterhall',
    name: 'Charterhall',
    wealth: 'Moderate',
    description: 'Stone courts, municipal offices, libraries, and the grand Imperial University.',
    mood: 'Echoing halls, gaslit lecture rooms, hurried clerks clutching ledgers.',
    factions: ['City Watch (Bluecoats)', 'Ministry of Preservation', 'The Sparkwrights'],
    path: 'M 140 270 L 220 280 L 260 370 L 160 360 Z',
    center: { x: 195, y: 320 }
  },
  {
    id: 'brightstone',
    name: 'Brightstone',
    wealth: 'Wealthy',
    description: 'Gilded avenues, lavish stone mansions, private guards, and gleaming electric lights.',
    mood: 'Arrogant aristocrats in carriages, manicured courtyards, absolute security.',
    factions: ['The Hive', 'Spirit Wardens', 'City Council'],
    path: 'M 140 180 L 260 170 L 270 250 L 150 260 Z',
    center: { x: 205, y: 215 }
  },
  {
    id: 'six_towers',
    name: 'Six Towers',
    wealth: 'Wealthy',
    description: 'Decaying grand estates from former glory, silent boulevards draped in cold mist.',
    mood: 'Gothic spires, lonely bells tolling, impoverished noble families clinging to prestige.',
    factions: ['The Dimmer Sisters', 'Forgotten Gods Cult', 'Deathlands Scavengers'],
    path: 'M 260 170 L 390 150 L 410 230 L 270 250 Z',
    center: { x: 335, y: 200 }
  },
  {
    id: 'coalridge',
    name: 'Coalridge',
    wealth: 'Poor',
    description: 'Choking smoke, thundering iron foundries, railway lines, and restless laborers.',
    mood: 'Soot rain, steam whistles, exhausted workers, and revolutionary union plots.',
    factions: ['The Billhooks', 'The Grinders', 'The Sparkwrights'],
    path: 'M 380 430 L 510 390 L 530 490 L 400 500 Z',
    center: { x: 455, y: 450 }
  },
  {
    id: 'nightmarket',
    name: 'Nightmarket',
    wealth: 'Moderate',
    description: 'A bustling indoor bazaar lit by bioluminescent moss; rare spices and occult wares.',
    mood: 'Exotic smells, haggling merchants, masked buyers, and eerie alchemical glows.',
    factions: ['The Hive', 'The Weeping Lady', 'The Red Sashes'],
    path: 'M 160 360 L 260 370 L 280 440 L 170 450 Z',
    center: { x: 215, y: 405 }
  },
  {
    id: 'whitecrown',
    name: 'Whitecrown',
    wealth: 'Wealthy',
    description: 'The walled seat of the Lord Governor, garrison fortresses, and high aristocracy.',
    mood: 'Heavy iron gates, elite Lord Governor guards with rifles, absolute exclusion.',
    factions: ['Imperial Military', 'Spirit Wardens', 'City Council'],
    path: 'M 270 70 L 380 60 L 390 150 L 260 170 Z',
    center: { x: 325, y: 110 }
  },
  {
    id: 'dunslough',
    name: 'Dunslough',
    wealth: 'Poor',
    description: 'Grim labor camps, sewage drainage flats, and stone quarries for convicts.',
    mood: 'Guards with heavy clubs, clinking ankle chains, bleak misery.',
    factions: ['Ironhook Inmates', 'City Watch (Bluecoats)'],
    path: 'M 30 400 L 150 390 L 160 480 L 40 490 Z',
    center: { x: 95, y: 440 }
  },
  {
    id: 'barrowcleft',
    name: 'Barrowcleft',
    wealth: 'Moderate',
    description: 'Food production hub, fungus farms, livestock wharves, and giant grain silos.',
    mood: 'Smell of soil and compost, broad flat carts, honest hard-working commoners.',
    factions: ['Ministry of Preservation', 'The Grinders'],
    path: 'M 350 340 L 460 320 L 510 390 L 380 430 Z',
    center: { x: 425, y: 370 }
  },
  {
    id: 'ironhook_prison',
    name: 'Ironhook Prison',
    wealth: 'Poor',
    description: 'Colossal stone fortress jutting into the cold waters, ringed by lightning rods.',
    mood: 'Iron bars, screams from the solitary cells, steam wardens patrol.',
    factions: ['Ironhook Wardens', 'Bluecoats', 'The Billhooks'],
    path: 'M 440 100 L 520 90 L 530 170 L 450 180 Z',
    center: { x: 485, y: 135 }
  }
];

export function getDistrictById(id: DistrictId): DistrictInfo {
  return DOSKVOL_DISTRICTS.find((d) => d.id === id) ?? DOSKVOL_DISTRICTS[0];
}

/** Parses a simple polygon SVG path ("M x y L x y ... Z") into points. */
export function parsePolygonPath(path: string): { x: number; y: number }[] {
  const nums = path.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    points.push({ x: nums[i], y: nums[i + 1] });
  }
  return points;
}

/** Ray-casting point-in-polygon test. */
function pointInPolygon(x: number, y: number, poly: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/** Returns the district containing the given map coordinate, or null for open ground / river. */
export function findDistrictAtPoint(x: number, y: number): DistrictInfo | null {
  return DOSKVOL_DISTRICTS.find((d) => pointInPolygon(x, y, parsePolygonPath(d.path))) ?? null;
}

/** Returns the district whose center is closest to the given map coordinate. */
export function findNearestDistrict(x: number, y: number): DistrictInfo {
  return DOSKVOL_DISTRICTS.reduce((best, d) =>
    Math.hypot(d.center.x - x, d.center.y - y) < Math.hypot(best.center.x - x, best.center.y - y) ? d : best
  );
}
