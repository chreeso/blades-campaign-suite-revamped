import { HoldLevel } from '@/types/blades';

export interface DefaultFaction {
  name: string;
  tier: number;
  hold: HoldLevel;
  defaultStatus: number;
  description: string;
  category: 'institutions' | 'underworld' | 'labor_occult';
}

export const DOSKVOL_FACTIONS: DefaultFaction[] = [
  // Institutions
  {
    name: 'City Council',
    tier: 5,
    hold: 'Strong',
    defaultStatus: 0,
    description: 'The ruling nobility and treasury heads governing the industrial wealth of Doskvol.',
    category: 'institutions'
  },
  {
    name: 'Spirit Wardens',
    tier: 4,
    hold: 'Strong',
    defaultStatus: 0,
    description: 'Masked hunters and keepers of the electroplasmic death bells and crematoriums.',
    category: 'institutions'
  },
  {
    name: 'Bluecoats',
    tier: 3,
    hold: 'Strong',
    defaultStatus: -1,
    description: 'The corrupt and brutal city watch policing the streets, prone to bribes and extortion.',
    category: 'institutions'
  },
  {
    name: 'Inspectors',
    tier: 3,
    hold: 'Strong',
    defaultStatus: 0,
    description: 'Imperial criminal investigators seeking the truth behind major crimes and corruption.',
    category: 'institutions'
  },

  // Underworld
  {
    name: 'The Lampblacks',
    tier: 2,
    hold: 'Weak',
    defaultStatus: 0,
    description: 'Former lamplighters turned street gang led by Bazso Baz, locked in a brutal gang war.',
    category: 'underworld'
  },
  {
    name: 'The Red Sashes',
    tier: 2,
    hold: 'Weak',
    defaultStatus: 0,
    description: 'Iruvian sword-fighters and fencing academy duelists led by Mylera Klev.',
    category: 'underworld'
  },
  {
    name: 'The Crows',
    tier: 2,
    hold: 'Weak',
    defaultStatus: 0,
    description: 'Historic ruling gang of Crow’s Foot, vulnerable since the assassination of Roric.',
    category: 'underworld'
  },
  {
    name: 'The Billhooks',
    tier: 2,
    hold: 'Strong',
    defaultStatus: -1,
    description: 'Fierce butchers and extortionists armed with meat cleavers and billhooks.',
    category: 'underworld'
  },
  {
    name: 'The Dimmer Sisters',
    tier: 2,
    hold: 'Strong',
    defaultStatus: 0,
    description: 'Reclusive sisters residing in Six Towers, whispering to the dead and trading in secrets.',
    category: 'underworld'
  },
  {
    name: 'Lord Scurlock',
    tier: 3,
    hold: 'Strong',
    defaultStatus: 0,
    description: 'An ancient, aristocratic vampire with deep sorcerous ties and inscrutable schemes.',
    category: 'underworld'
  },
  {
    name: 'The Silver Nails',
    tier: 2,
    hold: 'Strong',
    defaultStatus: 0,
    description: 'Severosi ghost-hunting mercenaries and cavalrymen fighting the restless dead.',
    category: 'underworld'
  },

  // Labor & Occult
  {
    name: 'Dockers',
    tier: 3,
    hold: 'Strong',
    defaultStatus: 0,
    description: 'Tough, unionized maritime workers controlling cargo logistics and harbor warehouses.',
    category: 'labor_occult'
  },
  {
    name: 'Gondoliers',
    tier: 3,
    hold: 'Strong',
    defaultStatus: 1,
    description: 'Canal boatmen who hold ancient compacts with canal spirits and guide safe transit.',
    category: 'labor_occult'
  },
  {
    name: 'Sparkwrights',
    tier: 4,
    hold: 'Strong',
    defaultStatus: 0,
    description: 'Inventors and guild engineers maintaining the lightning barriers and electroplasmic tech.',
    category: 'labor_occult'
  }
];

export const DOSKVOL_DISTRICTS = [
  'Crow’s Foot',
  'The Docks',
  'Charhollow',
  'Coalridge',
  'Nightmarket',
  'Six Towers',
  'Brightstone',
  'Charterhall',
  'Dunslough',
  'Silkshore',
  'The Lost District'
];
