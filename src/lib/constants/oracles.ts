export interface ScoreOracle {
  client: string;
  target: string;
  work: string;
  twist: string;
  location: string;
  connectedFaction: string;
  rewardTier: string;
}

export const ORACLE_CLIENTS = [
  'A desperate academic from Charterhall University',
  'A disgraced noble aristocrat from Brightstone',
  'A corrupt Bluecoat captain seeking extra coin',
  'A high-ranking occult priest of the Forgotten Gods',
  'A fearful merchant whose warehouse is under extortion',
  'A rogue Gondolier courier marked for death',
  'A factory foreman seeking leverage against union agitators',
  'An enigmatic Spirit Warden operating off the books',
  'A rival crew lieutenant seeking to orchestrate a coup',
  'A leviathan hunter captain smuggling illicit whale fluids'
];

export const ORACLE_TARGETS = [
  'An elite security vault in Charterhall Bank',
  'A secret opium den operated by the Fog Hounds in Silkshore',
  'A heavily guarded private carriage crossing Brightstone bridge',
  'A hidden electroplasmic laboratory in Coalridge factory',
  'An eccentric collector holding cursed Deathlands relics',
  'A luxury steam yacht moored at the Docks',
  'A City Watch precinct evidence lockup in Crow’s Foot',
  'A hidden shrine of the Weeping Lady in Six Towers',
  'A high-stakes clandestine gambling parlor in Nightmarket',
  'A fortified warehouse guarded by Sparkwright automatons'
];

export const ORACLE_WORKS = [
  'Burglarize a secured ledger without leaving trace of entry',
  'Assassinate a key witness before the Magistrate inquiry',
  'Sabotage a competitor’s steam pipes to shut down production',
  'Smuggle volatile refined ghost-essence across lightning barrier',
  'Kidnap a wealthy heir and secure them in a temporary safehouse',
  'Extort monthly tribute from a defiant shopkeepers guild',
  'Frame an innocent rival gang for an arson attack on City Watch',
  'Extract an imprisoned hacker or locksmith from holding cells',
  'Recover a stolen occult grimoire before midnight ritual',
  'Intercept and hijack a tax collector’s armored wagon'
];

export const ORACLE_TWISTS = [
  'A rival scoundrel crew is already inside executing a score of their own',
  'The client plans to betray and silence the crew the moment the job finishes',
  'The target site is haunted by an enraged ghost bound by iron wards',
  'City Watch patrols in the district are at double strength due to curfew',
  'The item or person to be extracted is far more dangerous than described',
  'A key insider contact was discovered and murdered 1 hour ago',
  'The target building is rigged with volatile spark-oil incendiary traps',
  'An unexpected torrential rain of black ghost-water floods the sewers',
  'A powerful third-party faction is secretly monitoring the target',
  'The target offers twice the reward if the crew turns against the client'
];

export const ORACLE_LOCATIONS = [
  'Crow’s Foot — Tangled canals and rooftop crossings',
  'The Docks — Creaking leviathan piers and salt mist',
  'Silkshore — Gaslit pleasure parlors and narrow alleys',
  'Charterhall — Imposing stone libraries and magistrate courts',
  'Brightstone — Gilded mansions, wrought iron, and clockwork lanterns',
  'Six Towers — Crumbling grand spires wrapped in perpetual fog',
  'Coalridge — Choking black smoke, soot, and clanking foundries',
  'Nightmarket — Crowded bazaar beneath iridescent bioluminescent glow',
  'Dunslough — Barren mud flats and grim penal labor quarries',
  'Barrowcleft — Bustling food wharves and livestock corrals'
];

export function generateRandomScore(availableFactions: string[] = []): ScoreOracle {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const defaultFactions = [
    'The Lampblacks',
    'The Red Sashes',
    'The Crows',
    'The Billhooks',
    'City Watch (Bluecoats)',
    'The Sparkwrights',
    'The Dimmer Sisters',
    'The Hive'
  ];

  const factionPool = availableFactions.length > 0 ? availableFactions : defaultFactions;

  const rewardCoins = [4, 6, 8, 10];
  const coin = pick(rewardCoins);
  const heat = coin <= 4 ? 2 : coin <= 6 ? 3 : 4;

  return {
    client: pick(ORACLE_CLIENTS),
    target: pick(ORACLE_TARGETS),
    work: pick(ORACLE_WORKS),
    twist: pick(ORACLE_TWISTS),
    location: pick(ORACLE_LOCATIONS),
    connectedFaction: pick(factionPool),
    rewardTier: `${coin} Coin payoff / +${heat} Estimated Heat`
  };
}
