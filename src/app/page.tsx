'use client';

import React, { useState } from 'react';
import {
  Campaign,
  CampaignRole,
  Character,
  Crew,
  Clock,
  Faction,
  NPC,
  JournalEntry,
  Transaction,
  ActionName,
  AttributeName,
  CharacterNpcRelation,
  CampaignRelationshipLabel,
  RollPosition,
  OperationPlanType,
  EngagementRollResult,
  SetupBonus
} from '@/types/blades';
import { DOSKVOL_FACTIONS } from '@/lib/constants/doskvol';
import { SCOUNDREL_PLAYBOOKS } from '@/lib/constants/playbooks';
import { CampaignSwitcher } from '@/components/ui/CampaignSwitcher';
import { CharacterSheet } from '@/components/character/CharacterSheet';
import { CharacterCreator, CharacterContactSelection } from '@/components/character/CharacterCreator';
import { QuickNpcModal, QuickNpcSubmitData } from '@/components/campaign/QuickNpcModal';
import { ClocksManager } from '@/components/campaign/ClocksManager';
import { FactionsTracker } from '@/components/campaign/FactionsTracker';
import { NpcTracker } from '@/components/campaign/NpcTracker';
import { JournalLedger } from '@/components/campaign/JournalLedger';
import { CrewSheet } from '@/components/campaign/CrewSheet';
import { DiceRoller } from '@/components/roller/DiceRoller';
import { EngagementRollModal } from '@/components/roller/EngagementRollModal';
import { DowntimeWizard } from '@/components/downtime/DowntimeWizard';
import { EndOfSessionModal } from '@/components/campaign/EndOfSessionModal';
import { IncarcerationModal } from '@/components/campaign/IncarcerationModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { CampaignInviteModal } from '@/components/campaign/CampaignInviteModal';
import { useCampaignSync } from '@/lib/supabase/useCampaignSync';
import {
  User,
  Users,
  Clock as ClockIcon,
  Shield,
  BookOpen,
  Plus,
  Compass,
  Dices,
  Hourglass,
  Server,
  UserPlus,
  UserCheck,
  Swords,
  Lock,
  Award
} from 'lucide-react';

// Baseline initial data
const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_crows_foot',
    name: 'Shadows of Crow’s Foot',
    description: 'A grim gang war between the Lampblacks and Red Sashes tearing Crow’s Foot apart.',
    created_by: 'gm_user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'camp_docks_smugglers',
    name: 'Leviathan Mist Couriers',
    description: 'Smuggling arcane contraband out of the Docks and through the Deathlands barrier.',
    created_by: 'gm_user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_CREW: Crew = {
  id: 'crew_crow_shadows',
  campaign_id: 'camp_crows_foot',
  name: 'The Obsidian Veil',
  playbook: 'Shadows',
  rep: 4,
  xp: 2,
  tier: 1,
  hold: 'Strong',
  heat: 3,
  wanted_level: 1,
  coin_vault: 3,
  vault_capacity: 4,
  hunting_grounds: 'Crow’s Foot (Espionage & Burglary)',
  lair: 'Abandoned canal cistern beneath Silkshore bridge',
  special_abilities: [
    { name: 'Everyone Steals', description: 'Each PC gains +1 action dot in Prowl or Finesse.', unlocked: true }
  ],
  upgrades: ['Lair Security', 'Fine Shadow Cloaks'],
  claims: ['Turf (Crow’s Foot canal junction)'],
  cohorts: [
    {
      id: 'coh_skulks',
      name: 'The Night Skulks',
      kind: 'gang',
      description: 'Street urchins and pickpockets who keep watch and slip through grates.',
      quality: 1,
      scale: 1,
      edges: ['Fearsome', 'Loyal'],
      flaws: ['Unreliable'],
      harm: 'healthy',
      armor_used: false
    }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'char_corvo',
    campaign_id: 'camp_crows_foot',
    user_id: 'current_user',
    name: 'Corvo Valik',
    alias: 'The Rook',
    playbook: 'Cutter',
    heritage: 'Akoros',
    background: 'Military',
    vice: 'Luxury',
    vice_purveyor: 'Madam Tess in Brightstone',
    stress: 3,
    trauma: [],
    harm: {
      level1: ['Sprained Wrist', ''],
      level2: ['Bruised Ribs', ''],
      level3: ''
    },
    healing_clock: 1,
    armor_used: { standard: false, heavy: false, special: false },
    action_dots: {
      hunt: 1,
      study: 0,
      survey: 1,
      tinker: 0,
      finesse: 1,
      prowl: 1,
      skirmish: 2,
      wreck: 1,
      attune: 0,
      command: 1,
      consort: 0,
      sway: 0
    },
    playbook_xp: 3,
    insight_xp: 1,
    prowess_xp: 2,
    resolve_xp: 0,
    coin: 2,
    stash: 6,
    load_level: 'Normal',
    special_abilities: SCOUNDREL_PLAYBOOKS['Cutter'].specialAbilities.map((ab, i) => ({
      ...ab,
      unlocked: i === 0 // Battleborn unlocked
    })),
    inventory: [
      { id: '1', name: 'Fine hand weapon', load: 1, equipped: true },
      { id: '2', name: 'Light Armor', load: 2, equipped: true },
      { id: '3', name: 'Throwing Knives', load: 1, equipped: false }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'char_tessa',
    campaign_id: 'camp_crows_foot',
    user_id: 'current_user',
    name: 'Tessa Drake',
    alias: 'The Silk',
    playbook: 'Slide',
    heritage: 'Iruvia',
    background: 'Noble',
    vice: 'Pleasure',
    vice_purveyor: 'The Silver Swan on Canal Row',
    stress: 2,
    trauma: [],
    harm: {
      level1: ['', ''],
      level2: ['', ''],
      level3: ''
    },
    healing_clock: 0,
    armor_used: { standard: false, heavy: false, special: false },
    action_dots: {
      hunt: 0,
      study: 1,
      survey: 1,
      tinker: 0,
      finesse: 1,
      prowl: 2,
      skirmish: 0,
      wreck: 0,
      attune: 0,
      command: 0,
      consort: 2,
      sway: 2
    },
    playbook_xp: 2,
    insight_xp: 2,
    prowess_xp: 1,
    resolve_xp: 3,
    coin: 3,
    stash: 8,
    load_level: 'Light',
    special_abilities: SCOUNDREL_PLAYBOOKS['Slide'].specialAbilities.map((ab, i) => ({
      ...ab,
      unlocked: i === 0 // Rook's Gambit
    })),
    inventory: [
      { id: 't1', name: 'Fine clothes and disguise', load: 1, equipped: true },
      { id: 't2', name: 'Concealed palm pistol', load: 1, equipped: true }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_CLOCKS: Clock[] = [
  {
    id: 'clk_bluecoats_alert',
    campaign_id: 'camp_crows_foot',
    name: 'Bluecoat Patrol Infiltration Alert',
    description: 'City watch surrounds the sector if alert reaches max.',
    clock_type: 'danger',
    max_segments: 6,
    current_segments: 4,
    visibility: 'campaign_public',
    color_theme: 'red',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'clk_master_vault',
    campaign_id: 'camp_crows_foot',
    name: 'Crack Red Sash Academy Vault',
    description: 'Disarm the clockwork lockpins and glyph wards.',
    clock_type: 'obstacle',
    max_segments: 8,
    current_segments: 5,
    visibility: 'campaign_public',
    color_theme: 'emerald',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'clk_gm_inquisition',
    campaign_id: 'camp_crows_foot',
    name: 'Inspectorate Secret Inquiry',
    description: 'Inspectors gathering evidence against the crew.',
    clock_type: 'danger',
    max_segments: 12,
    current_segments: 3,
    visibility: 'gm_only',
    color_theme: 'red',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_FACTIONS: Faction[] = DOSKVOL_FACTIONS.map((df, i) => ({
  id: `fac_${i}`,
  campaign_id: 'camp_crows_foot',
  name: df.name,
  tier: df.tier,
  hold: df.hold,
  status: df.defaultStatus,
  description: df.description,
  visibility: 'campaign_public',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

const INITIAL_NPCS: NPC[] = [
  {
    id: 'npc_bazso',
    campaign_id: 'camp_crows_foot',
    name: 'Bazso Baz',
    faction_id: INITIAL_FACTIONS.find((f) => f.name === 'The Lampblacks')?.id,
    affiliation: 'Leader, The Lampblacks',
    quirk: 'Never drinks alcohol; incessantly cleans his nails with a stiletto.',
    notes: 'Proposes an alliance against the Red Sashes. Promises turf in Crow’s Foot.',
    visibility: 'campaign_public',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'npc_mylera',
    campaign_id: 'camp_crows_foot',
    name: 'Mylera Klev',
    faction_id: INITIAL_FACTIONS.find((f) => f.name === 'The Red Sashes')?.id,
    affiliation: 'Master, Red Sashes',
    quirk: 'Cold demeanor, perfectionist duelist with an Iruvian honor code.',
    notes: 'Suspects the crew robbed her courier on Silkshore canal.',
    visibility: 'campaign_public',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'npc_traitor_clerk',
    campaign_id: 'camp_crows_foot',
    name: 'Darmont (Bluecoat Clerk)',
    faction_id: INITIAL_FACTIONS.find((f) => f.name === 'Bluecoats')?.id,
    affiliation: 'City Watch informant',
    quirk: 'Shifty eyes, gambling addict.',
    notes: 'GM SECRET: Darmont is also being blackmailed by the Unseen.',
    visibility: 'gm_only',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_CAMPAIGN_LABELS: CampaignRelationshipLabel[] = [
  {
    id: 'lbl_smuggling_contact',
    campaign_id: 'camp_crows_foot',
    name: 'Smuggling Partner',
    color: 'emerald',
    created_at: new Date().toISOString()
  },
  {
    id: 'lbl_blood_oath',
    campaign_id: 'camp_crows_foot',
    name: 'Blood Oath',
    color: 'rose',
    created_at: new Date().toISOString()
  }
];

const INITIAL_CHARACTER_RELATIONS: CharacterNpcRelation[] = [
  {
    id: 'rel_corvo_bazso',
    campaign_id: 'camp_crows_foot',
    character_id: 'char_corvo',
    npc_id: 'npc_bazso',
    score: 85,
    badges: ['Confidant', 'Debtor'],
    public_notes: 'Fought alongside Bazso in the docks riot. He owes Corvo a favor.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rel_corvo_mylera',
    campaign_id: 'camp_crows_foot',
    character_id: 'char_corvo',
    npc_id: 'npc_mylera',
    score: 20,
    badges: ['Creditor'],
    public_notes: 'Mylera blames Corvo for an intercepted shipment of fine steel rapiers.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_JOURNAL: JournalEntry[] = [
  {
    id: 'jrn_1',
    campaign_id: 'camp_crows_foot',
    author_id: 'current_user',
    title: 'Score 1: Breaking into the Coalridge Foundry',
    content: 'Successfully extracted the electroplasmic blueprint cylinder for Bazso Baz. Suffered 3 Heat due to firearm discharges.',
    entry_type: 'score_log',
    visibility: 'campaign_public',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    campaign_id: 'camp_crows_foot',
    amount: 4,
    currency_target: 'crew_vault',
    reason: 'Payoff from Foundry Score',
    created_at: new Date().toISOString()
  },
  {
    id: 'tx_2',
    campaign_id: 'camp_crows_foot',
    amount: -1,
    currency_target: 'purse',
    reason: 'Bribe to Bluecoat gate guard in Nightmarket',
    created_at: new Date().toISOString()
  }
];

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [activeCampaignId, setActiveCampaignId] = useState<string>(INITIAL_CAMPAIGNS[0].id);
  const [userRole, setUserRole] = useState<CampaignRole>('player');

  const [crew, setCrew] = useState<Crew>(INITIAL_CREW);
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [activeCharacterId, setActiveCharacterId] = useState<string>(INITIAL_CHARACTERS[0].id);
  const [showCreator, setShowCreator] = useState(false);

  const [clocks, setClocks] = useState<Clock[]>(INITIAL_CLOCKS);
  const [factions, setFactions] = useState<Faction[]>(INITIAL_FACTIONS);
  const [npcs, setNpcs] = useState<NPC[]>(INITIAL_NPCS);
  const [characterRelations, setCharacterRelations] = useState<CharacterNpcRelation[]>(INITIAL_CHARACTER_RELATIONS);
  const [campaignLabels, setCampaignLabels] = useState<CampaignRelationshipLabel[]>(INITIAL_CAMPAIGN_LABELS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  const [activeTab, setActiveTab] = useState<'character' | 'crew' | 'clocks' | 'factions' | 'npcs' | 'journal'>('character');

  // Dice Roller State
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [rollAction, setRollAction] = useState<ActionName>('skirmish');
  const [rollAttribute, setRollAttribute] = useState<AttributeName>('prowess');
  const [rollMode, setRollMode] = useState<'action' | 'resistance'>('action');
  const [rollerInitialPosition, setRollerInitialPosition] = useState<RollPosition | undefined>(undefined);
  const [rollerInitialNarrative, setRollerInitialNarrative] = useState<string | undefined>(undefined);

  // Engagement Roll State
  const [showEngagementModal, setShowEngagementModal] = useState(false);

  // Downtime Wizard State
  const [showDowntimeWizard, setShowDowntimeWizard] = useState(false);

  // End of Session & Incarceration Modals
  const [showEndOfSession, setShowEndOfSession] = useState(false);
  const [showIncarceration, setShowIncarceration] = useState(false);
  const [activeSetupBonus, setActiveSetupBonus] = useState<SetupBonus | null>(null);

  // Auth & Invite Modals State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQuickNpcModal, setShowQuickNpcModal] = useState(false);

  // Live Supabase Realtime Sync
  const { syncStatus, broadcastChange } = useCampaignSync({
    campaignId: activeCampaignId,
    onClockEvent: (payload) => {
      const updatedClock = payload as Clock;
      if (updatedClock && updatedClock.id) {
        setClocks((prev) => prev.map((c) => (c.id === updatedClock.id ? updatedClock : c)));
      }
    },
    onFactionEvent: (payload) => {
      const updatedFaction = payload as Faction;
      if (updatedFaction && updatedFaction.id) {
        setFactions((prev) => prev.map((f) => (f.id === updatedFaction.id ? updatedFaction : f)));
      }
    },
    onJournalEvent: (payload) => {
      const newEntry = payload as JournalEntry;
      if (newEntry && newEntry.id) {
        setJournalEntries((prev) => [newEntry, ...prev.filter((e) => e.id !== newEntry.id)]);
      }
    }
  });

  const activeCharacter = characters.find((c) => c.id === activeCharacterId) || characters[0];
  const isGm = userRole === 'gm';

  const handleJoinByCode = (token: string) => {
    try {
      const decoded = JSON.parse(atob(token));
      if (decoded.campaignId && decoded.name) {
        const existing = campaigns.find((c) => c.id === decoded.campaignId);
        if (!existing) {
          const joined: Campaign = {
            id: decoded.campaignId,
            name: decoded.name,
            created_by: 'invited_user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setCampaigns((prev) => [...prev, joined]);
        }
        setActiveCampaignId(decoded.campaignId);
        if (decoded.role) {
          setUserRole(decoded.role as CampaignRole);
        }
      }
    } catch {
      alert('Invalid campaign invite token.');
    }
  };

  const handleCommitDowntime = (updates: {
    crew: Crew;
    character: Character;
    clocks: Clock[];
    newJournalEntry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>;
    newTransactions: Omit<Transaction, 'id' | 'created_at'>[];
  }) => {
    setCrew(updates.crew);
    setCharacters((prev) => prev.map((c) => (c.id === updates.character.id ? updates.character : c)));
    setClocks(updates.clocks);
    handleAddJournalEntry(updates.newJournalEntry);
    updates.newTransactions.forEach(handleAddTransaction);
  };

  const handleRollAction = (action: ActionName) => {
    setRollAction(action);
    setRollMode('action');
    setShowDiceRoller(true);
  };

  const handleRollResistance = (attr: AttributeName) => {
    setRollAttribute(attr);
    setRollMode('resistance');
    setShowDiceRoller(true);
  };

  // Toggle user role
  const handleToggleRole = () => {
    setUserRole((prev) => (prev === 'gm' ? 'player' : 'gm'));
  };

  // Create Campaign
  const handleCreateCampaign = (name: string, description: string) => {
    const newCamp: Campaign = {
      id: `camp_${Date.now()}`,
      name,
      description,
      created_by: 'current_user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCampaigns((prev) => [...prev, newCamp]);
    setActiveCampaignId(newCamp.id);
  };

  // Update Scoundrel
  const handleUpdateCharacter = (updated: Character) => {
    setCharacters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleUpdateOtherCharacter = (characterId: string, updates: Partial<Character>) => {
    setCharacters((prev) =>
      prev.map((c) =>
        c.id === characterId ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
      )
    );
  };

  const handleCommitSessionXp = (
    updatedCharacters: Character[],
    updatedCrew: Crew,
    summaryLog: string
  ) => {
    setCharacters(updatedCharacters);
    setCrew(updatedCrew);

    const newEntry: JournalEntry = {
      id: `jrn_session_${Date.now()}`,
      campaign_id: activeCampaignId,
      author_id: 'current_user',
      title: 'End of Session XP Review',
      content: summaryLog,
      entry_type: 'score_log',
      visibility: 'campaign_public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setJournalEntries((prev) => [newEntry, ...prev]);
    broadcastChange('journal_update', newEntry);
  };

  const handleCommitIncarceration = (
    updatedCrew: Crew,
    updatedCharacter?: Character,
    summaryLog?: string
  ) => {
    setCrew(updatedCrew);
    if (updatedCharacter) {
      setCharacters((prev) =>
        prev.map((c) => (c.id === updatedCharacter.id ? updatedCharacter : c))
      );
    }
    if (summaryLog) {
      const newEntry: JournalEntry = {
        id: `jrn_prison_${Date.now()}`,
        campaign_id: activeCampaignId,
        author_id: 'current_user',
        title: 'Ironhook Prison Incarceration',
        content: summaryLog,
        entry_type: 'score_log',
        visibility: 'campaign_public',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setJournalEntries((prev) => [newEntry, ...prev]);
      broadcastChange('journal_update', newEntry);
    }
  };

  // Add Scoundrel with Contacts & Relations
  const handleCharacterCreated = (newChar: Character, contacts: CharacterContactSelection) => {
    setCharacters((prev) => [...prev, newChar]);
    setActiveCharacterId(newChar.id);

    const contactsToProcess = [
      { contact: contacts.friend, score: 85 },
      { contact: contacts.foe, score: 15 },
      ...contacts.neutral.map((c) => ({ contact: c, score: 50 }))
    ];

    const newNpcsToAdd: NPC[] = [];
    const newRelationsToAdd: CharacterNpcRelation[] = [];

    contactsToProcess.forEach(({ contact, score }) => {
      // Look for existing NPC by name in the campaign
      let targetNpc = npcs.find((n) => n.name.toLowerCase() === contact.name.toLowerCase()) ||
        newNpcsToAdd.find((n) => n.name.toLowerCase() === contact.name.toLowerCase());

      if (!targetNpc) {
        const matchingFaction = factions.find(
          (f) => f.name.toLowerCase() === contact.suggestedFaction.toLowerCase()
        );

        targetNpc = {
          id: `npc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          campaign_id: activeCampaignId,
          name: contact.name,
          faction_id: matchingFaction?.id,
          affiliation: contact.suggestedFaction !== 'Independent' ? `${contact.suggestedRole}, ${contact.suggestedFaction}` : contact.suggestedRole,
          quirk: contact.description,
          visibility: 'campaign_public',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        newNpcsToAdd.push(targetNpc);
      }

      newRelationsToAdd.push({
        id: `rel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        campaign_id: activeCampaignId,
        character_id: newChar.id,
        npc_id: targetNpc.id,
        score,
        badges: [],
        public_notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });

    if (newNpcsToAdd.length > 0) {
      setNpcs((prev) => [...prev, ...newNpcsToAdd]);
    }
    setCharacterRelations((prev) => [...prev, ...newRelationsToAdd]);
    setShowCreator(false);
  };

  // Relations & Labels Handlers
  const handleUpdateRelation = (updated: CharacterNpcRelation) => {
    setCharacterRelations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleCreateRelation = (relData: Omit<CharacterNpcRelation, 'id' | 'created_at' | 'updated_at'>) => {
    const newRel: CharacterNpcRelation = {
      ...relData,
      id: `rel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCharacterRelations((prev) => [...prev, newRel]);
  };

  const handleCreateCampaignLabel = (name: string, color: string) => {
    const newLabel: CampaignRelationshipLabel = {
      id: `lbl_${Date.now()}`,
      campaign_id: activeCampaignId,
      name,
      color,
      created_at: new Date().toISOString()
    };
    setCampaignLabels((prev) => [...prev, newLabel]);
  };

  // Clocks
  const handleUpdateClock = (updated: Clock) => {
    setClocks((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    broadcastChange('clock_update', updated);
  };

  const handleDeleteClock = (clockId: string) => {
    setClocks((prev) => prev.filter((c) => c.id !== clockId));
  };

  const handleCreateClock = (clockData: Omit<Clock, 'id' | 'created_at' | 'updated_at'>) => {
    const newClock: Clock = {
      ...clockData,
      id: `clk_${Date.now()}`,
      campaign_id: activeCampaignId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setClocks((prev) => [...prev, newClock]);
    broadcastChange('clock_update', newClock);
  };

  // Factions
  const handleUpdateFaction = (updated: Faction) => {
    setFactions((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    broadcastChange('faction_update', updated);
  };

  const handleCreateFaction = (facData: Omit<Faction, 'id' | 'created_at' | 'updated_at'>) => {
    const newFaction: Faction = {
      ...facData,
      id: `fac_${Date.now()}`,
      campaign_id: activeCampaignId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setFactions((prev) => [...prev, newFaction]);
  };

  // NPCs
  const handleUpdateNpc = (updated: NPC) => {
    setNpcs((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleCreateNpc = (npcData: Omit<NPC, 'id' | 'created_at' | 'updated_at'>) => {
    const newNpc: NPC = {
      ...npcData,
      id: `npc_${Date.now()}`,
      campaign_id: activeCampaignId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setNpcs((prev) => [...prev, newNpc]);
  };

  const handleDeleteNpc = (npcId: string) => {
    setNpcs((prev) => prev.filter((n) => n.id !== npcId));
  };

  // Quick Mid-Session NPC Creator
  const handleQuickNpcSubmit = (data: QuickNpcSubmitData) => {
    let targetFactionId = data.factionId;

    if (data.newFactionName) {
      const newFac: Faction = {
        id: `fac_${Date.now()}`,
        campaign_id: activeCampaignId,
        name: data.newFactionName,
        tier: 1,
        hold: 'Strong',
        status: 0,
        description: 'Street faction encountered during campaign score',
        visibility: 'campaign_public',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setFactions((prev) => [...prev, newFac]);
      targetFactionId = newFac.id;
    }

    const newNpc: NPC = {
      id: `npc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      campaign_id: activeCampaignId,
      name: data.name,
      faction_id: targetFactionId,
      affiliation: data.role,
      quirk: data.quirk,
      visibility: data.visibility,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setNpcs((prev) => [newNpc, ...prev]);

    if (data.relation) {
      const newRel: CharacterNpcRelation = {
        id: `rel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        campaign_id: activeCampaignId,
        character_id: data.relation.characterId,
        npc_id: newNpc.id,
        score: data.relation.score,
        badges: data.relation.badges,
        public_notes: data.relation.publicNotes,
        private_notes: data.relation.privateNotes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setCharacterRelations((prev) => [...prev, newRel]);
    }

    setShowQuickNpcModal(false);
  };

  // Journal & Transactions
  const handleAddJournalEntry = (entryData: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>) => {
    const newEntry: JournalEntry = {
      ...entryData,
      id: `jrn_${Date.now()}`,
      campaign_id: activeCampaignId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setJournalEntries((prev) => [newEntry, ...prev]);
  };

  const handleAddTransaction = (txData: Omit<Transaction, 'id' | 'created_at'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}`,
      campaign_id: activeCampaignId,
      created_at: new Date().toISOString()
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Engagement Roll Handlers
  const handleLaunchFirstActionFromEngagement = (
    position: RollPosition,
    planType: OperationPlanType,
    detail: string
  ) => {
    setRollerInitialPosition(position);
    setRollerInitialNarrative(
      `${planType} Plan ("${detail}"): Starting in ${position.toUpperCase()} position!`
    );
    setRollMode('action');
    setShowEngagementModal(false);
    setShowDiceRoller(true);
  };

  const handleLogScoreFromEngagement = (result: EngagementRollResult) => {
    const advList: string[] = [];
    if (result.factors.isBold) advList.push('Bold/Daring (+1d)');
    if (result.factors.exposesVulnerability) advList.push('Exposes Vulnerability (+1d)');
    if (result.factors.contactAssistance) advList.push('Contact Assistance (+1d)');
    if (result.factors.priorSetup) advList.push('Prior Setup/Turf (+1d)');

    const disadvList: string[] = [];
    if (result.factors.isTargetFortified) disadvList.push('Target Fortified/High Alert (-1d)');
    if (result.factors.isHostileDistrict) disadvList.push('Hostile District/War (-1d)');
    if (result.factors.inclementWeather) disadvList.push('Supernatural/Weather Hazard (-1d)');

    const logContent = `## Plan: ${result.factors.planType}
**Detail**: ${result.factors.detail}
**Target**: ${result.factors.targetFactionName || 'Independent'} (Tier ${result.factors.targetTier})
**Crew Tier**: ${result.factors.crewTier}

### Circumstances & Modifiers:
- **Advantages**: ${advList.length > 0 ? advList.join(', ') : 'None'}
- **Disadvantages**: ${disadvList.length > 0 ? disadvList.join(', ') : 'None'}
- **Calculated Pool**: ${result.finalDicePool <= 0 ? '0d (took lowest of 2d)' : `${result.finalDicePool}d`} [Dice: ${result.dice.join(', ')}]
- **Chosen Die**: ${result.chosenDie}

### Initial Engagement Position:
**${result.startingPosition.toUpperCase()}** ${result.isCritical ? '(Critical Success!)' : ''}
${result.narrative}

*Opening Friction*: ${result.initialObstaclePrompt}`;

    const newScoreLog: JournalEntry = {
      id: `jrn_score_${Date.now()}`,
      campaign_id: activeCampaignId,
      author_id: 'current_user',
      title: `Score Launch: ${result.factors.planType} vs. ${result.factors.targetFactionName || 'Target'}`,
      content: logContent,
      entry_type: 'score_log',
      visibility: 'campaign_public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setJournalEntries((prev) => [newScoreLog, ...prev]);
    broadcastChange('journal_update', newScoreLog);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-serif font-black text-lg">
              ⚔
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold tracking-wide text-zinc-100 flex items-center gap-2">
                Blades Campaign Suite
              </h1>
              <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                Doskvol Underworld Operating Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Score Plan / Engagement Roll Button */}
            <button
              onClick={() => setShowEngagementModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-600/70 hover:bg-red-900/80 text-xs text-red-200 font-bold transition-all shadow-xs hover:scale-105"
              title="Launch the Engagement Roll to establish operation plan and starting position"
            >
              <Swords className="w-3.5 h-3.5 text-red-400" /> Plan Score
            </button>

            {/* Quick Add NPC Button */}
            <button
              onClick={() => setShowQuickNpcModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-xs text-amber-300 font-semibold transition-all shadow-xs"
              title="Quick-create an NPC or street contact mid-session"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" /> + NPC
            </button>

            {/* Invite Button */}
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-300 font-medium transition-all"
              title="Share campaign invite code"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" /> Invite
            </button>

            {/* Live Sync Status / Auth Launcher */}
            <button
              onClick={() => setShowAuthModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all ${
                syncStatus === 'connected'
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
              title="Supabase Authentication & Live Connection"
            >
              <Server className="w-3.5 h-3.5 text-amber-400" />
              {syncStatus === 'connected' ? 'Live Sync' : 'Local Mode'}
            </button>

            {/* Campaign & Role Switcher */}
            <CampaignSwitcher
              campaigns={campaigns}
              activeCampaignId={activeCampaignId}
              userRole={userRole}
              onSelectCampaign={setActiveCampaignId}
              onToggleRole={handleToggleRole}
              onCreateCampaign={handleCreateCampaign}
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
          <nav className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('character')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'character'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Scoundrel Sheet
            </button>
            <button
              onClick={() => setActiveTab('crew')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'crew'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Crew Sheet
            </button>
            <button
              onClick={() => setActiveTab('clocks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'clocks'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ClockIcon className="w-3.5 h-3.5" /> Progress Clocks
            </button>
            <button
              onClick={() => setActiveTab('factions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'factions'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Factions & Status
            </button>
            <button
              onClick={() => setActiveTab('npcs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'npcs'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> NPCs & Contacts
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'journal'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Journal & Ledger
            </button>
          </nav>

          {/* Action triggers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDowntimeWizard(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-600 text-purple-200 font-bold text-xs shadow transition-all hover:scale-105"
            >
              <Hourglass className="w-3.5 h-3.5 text-purple-400" /> Downtime Phase
            </button>

            <button
              onClick={() => setShowEndOfSession(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600 text-emerald-200 font-bold text-xs shadow transition-all hover:scale-105"
              title="Review Session XP triggers for Scoundrels & Crew"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" /> End Session XP
            </button>

            <button
              onClick={() => setShowIncarceration(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-600 text-red-200 font-bold text-xs shadow transition-all hover:scale-105"
              title="Serve time in Ironhook Prison to clear Heat"
            >
              <Lock className="w-3.5 h-3.5 text-red-400" /> Incarceration
            </button>

            {activeTab === 'character' && (
              <div className="flex items-center gap-2">
                <select
                  value={activeCharacterId}
                  onChange={(e) => setActiveCharacterId(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 outline-none"
                >
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.playbook})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowCreator(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> New Character
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'character' && activeCharacter && (
          <CharacterSheet
            character={activeCharacter}
            crew={crew}
            npcs={npcs}
            factions={factions}
            relations={characterRelations.filter((r) => r.character_id === activeCharacter.id)}
            campaignLabels={campaignLabels}
            onUpdateCharacter={handleUpdateCharacter}
            onUpdateRelation={handleUpdateRelation}
            onCreateRelation={handleCreateRelation}
            onCreateCampaignLabel={handleCreateCampaignLabel}
            onQuickCreateNpc={handleQuickNpcSubmit}
            onRollAction={handleRollAction}
            onRollResistance={handleRollResistance}
            isGm={isGm}
            readOnly={false}
          />
        )}

        {activeTab === 'crew' && (
          <CrewSheet
            crew={crew}
            isGm={isGm}
            onUpdateCrew={setCrew}
            onOpenEndOfSession={() => setShowEndOfSession(true)}
            onOpenIncarceration={() => setShowIncarceration(true)}
          />
        )}

        {activeTab === 'clocks' && (
          <ClocksManager
            clocks={clocks}
            isGm={isGm}
            onUpdateClock={handleUpdateClock}
            onDeleteClock={handleDeleteClock}
            onCreateClock={handleCreateClock}
          />
        )}

        {activeTab === 'factions' && (
          <FactionsTracker
            factions={factions}
            clocks={clocks}
            isGm={isGm}
            onUpdateFaction={handleUpdateFaction}
            onUpdateClock={handleUpdateClock}
            onCreateFaction={handleCreateFaction}
          />
        )}

        {activeTab === 'npcs' && (
          <NpcTracker
            npcs={npcs}
            factions={factions}
            characters={characters}
            characterRelations={characterRelations}
            isGm={isGm}
            onUpdateNpc={handleUpdateNpc}
            onCreateNpc={handleCreateNpc}
            onDeleteNpc={handleDeleteNpc}
          />
        )}

        {activeTab === 'journal' && (
          <JournalLedger
            entries={journalEntries}
            transactions={transactions}
            isGm={isGm}
            onAddEntry={handleAddJournalEntry}
            onAddTransaction={handleAddTransaction}
          />
        )}
      </main>

      {/* Floating Dice Roll Button */}
      <button
        onClick={() => {
          setRollMode('action');
          setShowDiceRoller(true);
        }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-black text-sm shadow-2xl transition-all hover:scale-105"
      >
        <Dices className="w-5 h-5" /> Roll Dice
      </button>

      {/* Dice Roller Modal */}
      {showDiceRoller && activeCharacter && (
        <DiceRoller
          character={activeCharacter}
          allCharacters={characters}
          clocks={clocks}
          defaultAction={rollAction}
          defaultAttribute={rollAttribute}
          initialMode={rollMode}
          initialPosition={rollerInitialPosition}
          initialNarrative={rollerInitialNarrative}
          activeSetupBonus={activeSetupBonus}
          onConsumeSetupBonus={() => setActiveSetupBonus(null)}
          onRegisterSetupBonus={(bonus) => setActiveSetupBonus(bonus)}
          onUpdateCharacter={handleUpdateCharacter}
          onUpdateOtherCharacter={handleUpdateOtherCharacter}
          onUpdateClock={handleUpdateClock}
          onClose={() => {
            setShowDiceRoller(false);
            setRollerInitialPosition(undefined);
            setRollerInitialNarrative(undefined);
          }}
        />
      )}

      {/* Engagement Roll Modal */}
      {showEngagementModal && (
        <EngagementRollModal
          crew={crew}
          factions={factions}
          onLaunchFirstAction={handleLaunchFirstActionFromEngagement}
          onLogScore={handleLogScoreFromEngagement}
          onClose={() => setShowEngagementModal(false)}
        />
      )}

      {/* Downtime Wizard Modal */}
      {showDowntimeWizard && activeCharacter && (
        <DowntimeWizard
          campaignId={activeCampaignId}
          crew={crew}
          character={activeCharacter}
          factions={factions}
          clocks={clocks}
          onCommitDowntime={handleCommitDowntime}
          onClose={() => setShowDowntimeWizard(false)}
        />
      )}

      {/* End-of-Session XP Review Modal */}
      {showEndOfSession && (
        <EndOfSessionModal
          characters={characters}
          activeCharacterId={activeCharacterId}
          crew={crew}
          onCommitXp={handleCommitSessionXp}
          onClose={() => setShowEndOfSession(false)}
        />
      )}

      {/* Ironhook Incarceration Modal */}
      {showIncarceration && (
        <IncarcerationModal
          crew={crew}
          characters={characters}
          onCommitIncarceration={handleCommitIncarceration}
          onClose={() => setShowIncarceration(false)}
        />
      )}

      {/* Character Creator Modal */}
      {showCreator && (
        <CharacterCreator
          campaignId={activeCampaignId}
          onCharacterCreated={handleCharacterCreated}
          onCancel={() => setShowCreator(false)}
        />
      )}

      {/* Auth & Connection Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* Campaign Invite & Join Modal */}
      {showInviteModal && (
        <CampaignInviteModal
          campaign={campaigns.find((c) => c.id === activeCampaignId) || campaigns[0]}
          onJoinByCode={handleJoinByCode}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {/* Quick Mid-Session NPC Modal */}
      {showQuickNpcModal && (
        <QuickNpcModal
          factions={factions}
          characters={characters}
          campaignLabels={campaignLabels}
          preselectedCharacterId={userRole === 'player' ? activeCharacterId : undefined}
          isGm={isGm}
          onSubmit={handleQuickNpcSubmit}
          onClose={() => setShowQuickNpcModal(false)}
        />
      )}
    </div>
  );
}
