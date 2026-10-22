import { DistrictFlavor, DistrictId, StreetTrait } from '@/types/blades';

/**
 * Street-Level Procedural Oracles (Epic 5.3)
 *
 * Improvisation tables for generating a single Doskvol street scene, organized
 * along the categories the Blades in the Dark GM section uses for random
 * streets and buildings (type, mood, impressions, use, details, encounters).
 * Entries are original flavor text written for this suite — they produce
 * fiction only and never alter dice math, position, or effect.
 */

// ---------------------------------------------------------------------------
// Street Names
// ---------------------------------------------------------------------------

export const STREET_NAME_PREFIXES = [
  'Ash', 'Bell', 'Bone', 'Candle', 'Chain', 'Cinder', 'Coil', 'Crane', 'Crook',
  'Drown', 'Eel', 'Gallows', 'Ghost', 'Gutter', 'Hook', 'Iron', 'Lamp', 'Lantern',
  'Leech', 'Mire', 'Needle', 'Oil', 'Rook', 'Rust', 'Salt', 'Shroud', 'Silk',
  'Slate', 'Smoke', 'Soot', 'Spark', 'Tallow', 'Thorn', 'Tide', 'Veil', 'Whale'
];

export const STREET_NAME_SUFFIXES = [
  'Alley', 'Arcade', 'Causeway', 'Close', 'Court', 'Cut', 'Gate', 'Lane',
  'Mews', 'Passage', 'Row', 'Stair', 'Steps', 'Street', 'Walk', 'Way', 'Wharf', 'Yard'
];

/** Historic / unique names occasionally used instead of prefix + suffix. */
export const STREET_UNIQUE_NAMES = [
  "Widow Kessa's Turn",
  'The Drowned Saint',
  'Old Barrier Line',
  "Hangman's Rookery",
  'The Weeping Steps',
  "Lord Strangford's Folly",
  'Nine Bells Crossing',
  'The Blind Canal',
  'Leviathan Rib Arch',
  'The Ninth Ward Gutter'
];

// ---------------------------------------------------------------------------
// Street Type / Layout
// ---------------------------------------------------------------------------

export const STREET_TYPES = [
  'Narrow alley barely shoulder-wide, choked with refuse',
  'Crooked lane of leaning tenements that nearly touch overhead',
  'Broad cobbled thoroughfare with rattling carriage traffic',
  'Canal-side towpath with mooring posts and slick stone',
  'Iron footbridge spanning a black canal',
  'Steep stairway street cut between terraces',
  'Covered arcade of shuttered stalls',
  'Dead-end courtyard ringed by balconies',
  'Rooftop catwalk strung between chimney stacks',
  'Sunken underpass beneath a rail viaduct',
  'Market square with a dry, cracked fountain',
  'Rubble-strewn lane where a building recently collapsed'
];

// ---------------------------------------------------------------------------
// Mood
// ---------------------------------------------------------------------------

export const STREET_MOODS = [
  'Tense — shutters slam as strangers approach',
  'Bustling — hawkers, porters, and pickpockets elbow through the crowd',
  'Desolate — not a soul in sight, too quiet',
  'Festive — a cheap street party spills from a tavern',
  'Mournful — a death-bell tolls and black ribbons hang from doors',
  'Watchful — eyes behind every curtain, someone is keeping count',
  'Feverish — a sickness or rumor has the street on edge',
  'Menacing — gang colors are painted fresh on the walls',
  'Weary — exhausted laborers trudge home in silence',
  'Eerie — the lamps gutter blue and the air tastes of ozone'
];

// ---------------------------------------------------------------------------
// Sensory Impressions
// ---------------------------------------------------------------------------

export const STREET_SIGHTS = [
  'Electroplasmic street-lamps flickering in a slow, dying rhythm',
  'Laundry lines strung window to window, sagging with soot-grey sheets',
  'A spirit-bottle shrine wedged into a wall niche, candles still lit',
  'Faded broadsheets announcing a curfew nobody obeys',
  'A dead goat hanging from a lamp-post with a warning carved in its hide',
  'Child lookouts perched on a gutter, whistling signals',
  'A shattered carriage abandoned with one wheel still spinning',
  'Rats swarming a pile of discarded fish heads',
  'A hulking iron lightning-rod tower humming overhead',
  'Bluecoat wanted posters, half torn away'
];

export const STREET_SOUNDS = [
  'The distant crackle of the lightning barrier',
  'A hurdy-gurdy grinding out a mournful dirge',
  'Steam whistles shrieking from a nearby works',
  'Dripping water echoing from the sewers below',
  'Drunken singing in a Skovlander dialect',
  'Iron-shod hooves and the creak of a heavy cart',
  'A baby wailing behind a boarded window',
  'Gondolier calls echoing off the canal walls',
  'The clank and hiss of a Sparkwright pump station',
  'Muffled shouting, then sudden silence'
];

export const STREET_SMELLS = [
  'Leviathan oil and rendered fat',
  'Coal smoke thick enough to taste',
  'Rotting fish and canal brine',
  'Sweet opium haze drifting from a doorway',
  'Ozone and scorched metal',
  'Wet stone, mildew, and old rain',
  'Roasting eel and burnt sugar from a street cart',
  'Tanning-yard chemicals that sting the eyes',
  'Incense masking something dead',
  'Spilled spirits and stale tobacco'
];

// ---------------------------------------------------------------------------
// Buildings & Architectural Oddities
// ---------------------------------------------------------------------------

export const STREET_BUILDINGS = [
  'Alchemical dispensary with cloudy bottles in the window',
  'Canal tollhouse with a rusted chain gate',
  'Tenement rookery packed six families to a floor',
  'Steam bathhouse leaking vapor from every seam',
  'Clandestine printing press behind a bookbinder front',
  'Pawnbroker stuffed with dead men’s belongings',
  'Gambling den with a doorman who never blinks',
  'Shuttered chapel of a forgotten saint',
  'Leech’s workshop reeking of reagents',
  'Cheap boarding house with rooms rented by the hour',
  'Warehouse with fresh padlocks and no signage',
  'Spirit Warden bell-station with a sealed iron door'
];

export const STREET_ODDITIES = [
  'Lightning-charred gargoyles with faces worn smooth',
  'Iron grates dripping yellow, sulfurous condensate',
  'A hidden rooftop bridge visible only from certain angles',
  'Occult ward inscriptions chalked fresh on every threshold',
  'A doorway bricked up from the outside',
  'Leviathan bones built into the façade as support beams',
  'A clock tower whose hands run backwards',
  'Windows painted black from the inside',
  'Ghost-iron spikes lining the gutters to deter spirits',
  'A collapsed section revealing an older street beneath',
  'Copper pipes that sing when the wind changes',
  'A statue whose face has been chiseled away'
];

// ---------------------------------------------------------------------------
// Street Encounters & Complications
// ---------------------------------------------------------------------------

export const STREET_ENCOUNTERS = [
  'A stray Whisper summoning sparks in a chalk circle',
  'A Bluecoat shakedown in progress against a street vendor',
  'A weeping beggar offering rumors for a coin',
  'A Spirit Warden carriage rolling past, bells muffled',
  'Two rival gang lookouts staring each other down',
  'A Gondolier arguing over an unpaid fare',
  'A noble’s servant lost and clutching a sealed letter',
  'A street preacher of the Church of Ecstasy decrying the flesh',
  'Children playing "hunt the ghost" with a stolen spirit-bottle',
  'A drunk Leviathan hunter flashing more coin than is wise',
  'An Inspector quietly sketching faces in a notebook',
  'A body under a tarp, already picked clean'
];

export const STREET_COMPLICATIONS = [
  'A rogue spirit is drawn to anyone carrying arcane items',
  'The street is part of a contested turf — trespassers are noticed',
  'A sudden curfew sweep is coming in minutes',
  'The ground is unstable; the old street beneath is hollow',
  'An informant here sells every sighting to the highest bidder',
  'A plague-quarantine chalk mark has sealed one end',
  'A faction is moving contraband through tonight',
  'Black rain begins, driving everyone indoors — or into hiding',
  'A local power owes the crew a debt, or thinks the crew owes them',
  'Nothing — for now. But someone saw you arrive.'
];

// ---------------------------------------------------------------------------
// District Flavor Pools (bias generation toward local color)
// ---------------------------------------------------------------------------

export const DISTRICT_FLAVORS: Record<DistrictId, DistrictFlavor> = {
  crows_foot: {
    districtId: 'crows_foot',
    streetTypes: ['Twisting alley under Lampblack-painted lamp-posts', 'Rooftop crossing between tavern garrets'],
    buildings: ['Red Sashes fencing academy with barred windows', 'Crumbling Crows-controlled tavern'],
    encounters: ['Lampblack and Red Sash toughs circling for a fight', 'A Crows bagman collecting protection money'],
    sights: ['Fresh blood washed half-heartedly from the cobbles']
  },
  the_docks: {
    districtId: 'the_docks',
    streetTypes: ['Pier walkway between towering leviathan hulls', 'Cargo lane stacked with crates and nets'],
    buildings: ['Dockers union hall with a guarded door', 'Whale-oil rendering shed'],
    encounters: ['Billhook butchers dragging a sack toward the water', 'Smugglers unloading under a lantern hood'],
    sights: ['A leviathan carcass winched up a slipway, still twitching']
  },
  silkshore: {
    districtId: 'silkshore',
    streetTypes: ['Lantern-lit canal walk lined with gondola moorings', 'Perfumed alley behind a pleasure house'],
    buildings: ['Velvet-draped opium parlor', 'Artist’s salon above a shuttered gallery'],
    encounters: ['A masked courtesan passing a note to a stranger', 'A Gondolier offering discreet passage'],
    sights: ['Silk lanterns reflected in still, oily water']
  },
  charterhall: {
    districtId: 'charterhall',
    streetTypes: ['Colonnaded avenue between stone courthouses', 'University cloister walk'],
    buildings: ['Archive annex of the Ministry of Preservation', 'Law office with a magistrate’s seal'],
    encounters: ['A student duel drawing a betting crowd', 'A clerk fleeing with a satchel of ledgers'],
    sights: ['Gaslit lecture halls glowing late into the night']
  },
  brightstone: {
    districtId: 'brightstone',
    streetTypes: ['Gilded boulevard with electric lamps', 'Private carriage lane behind wrought-iron gates'],
    buildings: ['Marble townhouse with liveried guards', 'Exclusive gentlemen’s club'],
    encounters: ['A Bluecoat patrol questioning anyone poorly dressed', 'An aristocrat’s carriage blocking the lane'],
    sights: ['Manicured courtyards behind spiked railings']
  },
  six_towers: {
    districtId: 'six_towers',
    streetTypes: ['Fog-drowned boulevard of silent estates', 'Overgrown garden path between ruined spires'],
    buildings: ['Decaying manor with a single lit window', 'Abandoned family chapel'],
    encounters: ['A Dimmer Sisters servant buying spirit-bottles', 'A ghost walking a familiar, endless route'],
    sights: ['Ivy strangling a once-grand façade']
  },
  coalridge: {
    districtId: 'coalridge',
    streetTypes: ['Rail-side lane shaking with every passing train', 'Soot-black foundry yard'],
    buildings: ['Thundering ironworks', 'Union meeting room above a soup kitchen'],
    encounters: ['Ulf Ironborn’s Skovlanders recruiting by force', 'A union agitator handing out pamphlets'],
    sights: ['Soot falling like black snow']
  },
  nightmarket: {
    districtId: 'nightmarket',
    streetTypes: ['Crowded bazaar aisle under bioluminescent moss', 'Covered spice lane'],
    buildings: ['Exotic import stall with Iruvian silks', 'Curio shop selling questionable relics'],
    encounters: ['A merchant haggling over a caged creature', 'A cutpurse working the crowd'],
    sights: ['Glowing moss lamps in a dozen eerie colors']
  },
  whitecrown: {
    districtId: 'whitecrown',
    streetTypes: ['Patrolled approach road to the Lord Governor’s estate', 'Garrison parade ground'],
    buildings: ['Imperial garrison barracks', 'Gatehouse with rifle-armed sentries'],
    encounters: ['Imperial soldiers demanding papers', 'A high-ranking courier under heavy escort'],
    sights: ['Imperial banners snapping in a cold wind']
  },
  dunslough: {
    districtId: 'dunslough',
    streetTypes: ['Mud track across the drainage flats', 'Quarry road lined with chain gangs'],
    buildings: ['Labor camp barracks', 'Pauper graveyard keeper’s hut'],
    encounters: ['Convicts working under clubs and whistles', 'A gravedigger selling fresh corpses'],
    sights: ['Shallow pauper graves marked with sticks']
  },
  barrowcleft: {
    districtId: 'barrowcleft',
    streetTypes: ['Wide cart road between grain silos', 'Livestock wharf with pens and troughs'],
    buildings: ['Fungus farm in a converted cellar', 'Slaughterhouse with a busy back door'],
    encounters: ['Farmers brawling over a spoiled shipment', 'A Ministry inspector tallying stock'],
    sights: ['Glowing fungus beds visible through cellar grates']
  },
  ironhook_prison: {
    districtId: 'ironhook_prison',
    streetTypes: ['Causeway approach watched from the walls', 'Visitors’ yard ringed with lightning rods'],
    buildings: ['Guard tower with searchlight lamps', 'Prisoner intake hall'],
    encounters: ['A bribed guard looking the other way', 'A transfer wagon rattling through the gate'],
    sights: ['Lightning rods crackling over the prison walls']
  }
};

/** Human-readable labels for each lockable street trait. */
export const STREET_TRAIT_LABELS: Record<StreetTrait, string> = {
  name: 'Street Name',
  streetType: 'Street Type',
  mood: 'Mood',
  sight: 'Sight',
  sound: 'Sound',
  smell: 'Smell',
  building: 'Building',
  oddity: 'Architectural Oddity',
  encounter: 'Street Encounter',
  complication: 'Complication'
};
