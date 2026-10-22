export type CampaignRole = 'gm' | 'player';
export type ContentVisibility = 'gm_only' | 'campaign_public' | 'character_private';
export type ClockKind = 'obstacle' | 'danger' | 'project' | 'tug_of_war';
export type HoldLevel = 'Weak' | 'Strong';
export type LoadCategory = 'Light' | 'Normal' | 'Heavy';
export type RollPosition = 'Controlled' | 'Risky' | 'Desperate';
export type RollEffect = 'None' | 'Limited' | 'Standard' | 'Great';
export type RollType = 'action' | 'resistance' | 'fortune' | 'engagement';

export type OperationPlanType =
  | 'Assault'
  | 'Deception'
  | 'Stealth'
  | 'Occult'
  | 'Social'
  | 'Transport';

export interface EngagementRollFactors {
  planType: OperationPlanType;
  detail: string;
  targetFactionId?: string;
  targetFactionName?: string;
  crewTier: number;
  targetTier: number;
  isBold: boolean;
  exposesVulnerability: boolean;
  contactAssistance: boolean;
  priorSetup: boolean;
  isTargetFortified: boolean;
  isHostileDistrict: boolean;
  inclementWeather: boolean;
}

export interface EngagementRollResult {
  dice: number[];
  chosenDie: number;
  isZeroDice: boolean;
  isCritical: boolean;
  startingPosition: RollPosition;
  outcome: 'critical' | 'full_success' | 'partial_success' | 'bad_outcome';
  narrative: string;
  initialObstaclePrompt: string;
  finalDicePool: number;
  factors: EngagementRollFactors;
}

export interface RollResult {
  dice: number[];
  chosenDie: number;
  isZeroDice: boolean;
  isCritical: boolean;
  outcome: 'critical' | 'full_success' | 'partial_success' | 'bad_outcome';
  narrative: string;
  ticks: number;
  stressCost?: number;
}

export type ActionName =
  | 'hunt'
  | 'study'
  | 'survey'
  | 'tinker'
  | 'finesse'
  | 'prowl'
  | 'skirmish'
  | 'wreck'
  | 'attune'
  | 'command'
  | 'consort'
  | 'sway';

export type AttributeName = 'insight' | 'prowess' | 'resolve';

export type TraumaCondition =
  | 'Cold'
  | 'Haunted'
  | 'Obsessed'
  | 'Paranoid'
  | 'Reckless'
  | 'Soft'
  | 'Unstable'
  | 'Vicious';

export type ScoundrelPlaybook =
  | 'Cutter'
  | 'Hound'
  | 'Leech'
  | 'Lurk'
  | 'Slide'
  | 'Spider'
  | 'Whisper';

export type CrewPlaybook =
  | 'Assassins'
  | 'Bravos'
  | 'Cult'
  | 'Hawkers'
  | 'Shadows'
  | 'Smugglers';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignMember {
  id: string;
  campaign_id: string;
  user_id: string;
  role: CampaignRole;
  joined_at: string;
}

export interface SpecialAbility {
  name: string;
  description: string;
  unlocked: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  load: number;
  equipped: boolean;
  description?: string;
}

export interface HarmState {
  level1: [string, string];
  level2: [string, string];
  level3: string;
}

export interface ArmorState {
  standard: boolean;
  heavy: boolean;
  special: boolean;
}

export interface Character {
  id: string;
  campaign_id: string;
  user_id: string;
  crew_id?: string;
  name: string;
  alias?: string;
  playbook: ScoundrelPlaybook;
  heritage?: string;
  background?: string;
  vice?: string;
  vice_purveyor?: string;
  stress: number; // 0 to 9
  trauma: TraumaCondition[]; // max 4
  harm: HarmState;
  healing_clock: number; // 0 to 4 (Recovery project)
  armor_used: ArmorState;
  action_dots: Record<ActionName, number>;
  playbook_xp: number; // 0 to 8
  insight_xp: number; // 0 to 6
  prowess_xp: number; // 0 to 6
  resolve_xp: number; // 0 to 6
  coin: number; // 0 to 4 (Purse)
  stash: number; // 0 to 40
  load_level: LoadCategory;
  special_abilities: SpecialAbility[];
  inventory: InventoryItem[];
  created_at: string;
  updated_at: string;
}

export interface Clock {
  id: string;
  campaign_id: string;
  name: string;
  description?: string;
  clock_type: ClockKind;
  max_segments: 4 | 6 | 8 | 12;
  current_segments: number;
  visibility: ContentVisibility;
  color_theme?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Faction {
  id: string;
  campaign_id: string;
  name: string;
  tier: number;
  hold: HoldLevel;
  status: number; // -3 to +3
  description?: string;
  goals?: string;
  clock_id?: string;
  visibility: ContentVisibility;
  created_at: string;
  updated_at: string;
}

export interface NPC {
  id: string;
  campaign_id: string;
  name: string;
  faction_id?: string;
  affiliation?: string;
  quirk?: string;
  notes?: string;
  visibility: ContentVisibility;
  created_at: string;
  updated_at: string;
}

export type SystemRelationshipBadge =
  | 'Mentor'
  | 'Protégé'
  | 'Debtor'
  | 'Creditor'
  | 'Lover'
  | 'Family'
  | 'Blackmailer'
  | 'Former Partner'
  | 'Confidant';

export interface CampaignRelationshipLabel {
  id: string;
  campaign_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface CharacterNpcRelation {
  id: string;
  campaign_id: string;
  character_id: string;
  npc_id: string;
  score: number; // 1 to 100 (1=Arch-Enemy, 50=Neutral, 100=Devoted Friend)
  badges: string[]; // SystemRelationshipBadge | CampaignRelationshipLabel.name
  public_notes?: string;
  private_notes?: string; // Secret / GM plot hooks
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  campaign_id: string;
  author_id: string;
  title: string;
  content: string;
  entry_type: 'session' | 'character_note' | 'gm_secret' | 'score_log';
  visibility: ContentVisibility;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  campaign_id: string;
  character_id?: string;
  crew_id?: string;
  amount: number;
  currency_target: 'purse' | 'stash' | 'crew_vault' | 'rep' | 'heat';
  reason: string;
  created_at: string;
}

export type CohortKind = 'gang' | 'expert';
export type CohortHarm = 'healthy' | 'impaired' | 'broken';

export interface Cohort {
  id: string;
  name: string;
  kind: CohortKind;
  description?: string;
  quality: number; // Tier rating
  scale: number; // Gang scale (0=1-2, 1=3-6, 2=10-12, etc.)
  edges: string[]; // Fearsome, Independent, Loyal, Tenacious
  flaws: string[]; // Principled, Savage, Unreliable, Wild
  harm: CohortHarm;
  armor_used: boolean;
}

export interface Crew {
  id: string;
  campaign_id: string;
  name: string;
  playbook: CrewPlaybook;
  rep: number; // 0 to 12
  xp: number; // 0 to 8 (Crew advancement track)
  tier: number; // 0 to 5
  hold: HoldLevel;
  heat: number; // 0 to 9
  wanted_level: number; // 0 to 4
  coin_vault: number;
  vault_capacity: number;
  hunting_grounds?: string;
  lair?: string;
  special_abilities: SpecialAbility[];
  upgrades: string[];
  claims: string[];
  cohorts?: Cohort[];
  created_at: string;
  updated_at: string;
}

export interface SetupBonus {
  id: string;
  sourceCharacterName: string;
  bonusType: 'effect' | 'position';
  detail: string;
  createdAt: string;
}

export interface GroupParticipantRoll {
  characterId: string;
  characterName: string;
  dots: number;
  dice: number[];
  chosenDie: number;
  outcome: RollResult['outcome'];
  isZeroDice: boolean;
  isLeader: boolean;
  failed: boolean;
}

export interface GroupActionResult {
  leaderId: string;
  leaderName: string;
  leaderStressCost: number;
  bestOutcome: RollResult['outcome'];
  bestDie: number;
  isCritical: boolean;
  overallTicks: number;
  narrative: string;
  participantRolls: GroupParticipantRoll[];
}

export interface IncarcerationOutcome {
  dice: number[];
  chosenDie: number;
  isZeroDice: boolean;
  isCritical: boolean;
  outcome: 'critical' | 'full_success' | 'partial_success' | 'bad_outcome';
  title: string;
  narrative: string;
  suggestedConsequences: string[];
  prisonClaimsAvailable?: string[];
}

// ---------------------------------------------------------------------------
// Street-Level Procedural Generator & Map Landmarks (Epic 5.3)
// ---------------------------------------------------------------------------

/** Canonical Doskvol district identifiers used by the map and street generator. */
export type DistrictId =
  | 'crows_foot'
  | 'the_docks'
  | 'silkshore'
  | 'charterhall'
  | 'brightstone'
  | 'six_towers'
  | 'coalridge'
  | 'nightmarket'
  | 'whitecrown'
  | 'dunslough'
  | 'barrowcleft'
  | 'ironhook_prison';

export type DistrictWealth = 'Poor' | 'Moderate' | 'Wealthy';

/** Lockable / rerollable fields of a generated street scene. */
export type StreetTrait =
  | 'name'
  | 'streetType'
  | 'mood'
  | 'sight'
  | 'sound'
  | 'smell'
  | 'building'
  | 'oddity'
  | 'encounter'
  | 'complication';

export interface ProceduralStreet {
  districtId: DistrictId;
  name: string;
  streetType: string;
  mood: string;
  sight: string;
  sound: string;
  smell: string;
  building: string;
  oddity: string;
  encounter: string;
  complication: string;
}

/** District-specific flavor pools that bias generation toward local color. */
export interface DistrictFlavor {
  districtId: DistrictId;
  streetTypes: string[];
  buildings: string[];
  encounters: string[];
  sights: string[];
}

export type MapPinCategory = 'landmark' | 'hideout' | 'hazard' | 'shop' | 'rumor';

/** Persistent campaign marker dropped on the Doskvol map. */
export interface MapPin {
  id: string;
  campaign_id: string;
  district_id: DistrictId | null;
  x: number;
  y: number;
  title: string;
  category: MapPinCategory;
  notes: string;
  visibility: ContentVisibility;
  street?: ProceduralStreet;
  created_by: string;
  created_at: string;
  updated_at: string;
}
