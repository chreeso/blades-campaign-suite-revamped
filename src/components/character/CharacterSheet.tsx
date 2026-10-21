'use client';

import React, { useState } from 'react';
import { Character, Crew, ActionName, AttributeName, LoadCategory, NPC, Faction, CharacterNpcRelation, CampaignRelationshipLabel } from '@/types/blades';
import { SYSTEM_RELATIONSHIP_BADGES, SCOUNDREL_PLAYBOOKS } from '@/lib/constants/playbooks';
import { ScoundrelPlaybook } from '@/types/blades';
import { DotRating } from '@/components/ui/DotRating';
import { StressBar } from '@/components/ui/StressBar';
import { HarmMatrix } from '@/components/ui/HarmMatrix';
import { Coins, Sparkles, Backpack, Award, ArrowRight, ArrowLeft, Dices, ShieldCheck, Users, Shield, Plus, Tag, EyeOff, Check, UserPlus, Link2, Pencil, AlertTriangle } from 'lucide-react';
import { QuickNpcModal, QuickNpcSubmitData } from '@/components/campaign/QuickNpcModal';

interface CharacterSheetProps {
  character: Character;
  crew?: Crew;
  onUpdateCharacter: (char: Character) => void;
  onRollAction?: (action: ActionName) => void;
  onRollResistance?: (attr: AttributeName) => void;
  readOnly?: boolean;
  npcs?: NPC[];
  factions?: Faction[];
  relations?: CharacterNpcRelation[];
  campaignLabels?: CampaignRelationshipLabel[];
  onUpdateRelation?: (updated: CharacterNpcRelation) => void;
  onCreateRelation?: (rel: Omit<CharacterNpcRelation, 'id' | 'created_at' | 'updated_at'>) => void;
  onCreateCampaignLabel?: (name: string, color: string) => void;
  onQuickCreateNpc?: (data: QuickNpcSubmitData) => void;
  isGm?: boolean;
}

const ATTRIBUTES: Record<AttributeName, { label: string; xpKey: 'insight_xp' | 'prowess_xp' | 'resolve_xp'; actions: ActionName[] }> = {
  insight: {
    label: 'Insight',
    xpKey: 'insight_xp',
    actions: ['hunt', 'study', 'survey', 'tinker']
  },
  prowess: {
    label: 'Prowess',
    xpKey: 'prowess_xp',
    actions: ['finesse', 'prowl', 'skirmish', 'wreck']
  },
  resolve: {
    label: 'Resolve',
    xpKey: 'resolve_xp',
    actions: ['attune', 'command', 'consort', 'sway']
  }
};

const LOAD_LIMITS: Record<LoadCategory, number> = {
  Light: 3,
  Normal: 5,
  Heavy: 6
};

export function CharacterSheet({
  character,
  crew,
  onUpdateCharacter,
  onRollAction,
  onRollResistance,
  readOnly = false,
  npcs = [],
  factions = [],
  relations = [],
  campaignLabels = [],
  onUpdateRelation,
  onCreateRelation,
  onCreateCampaignLabel,
  onQuickCreateNpc,
  isGm = false
}: CharacterSheetProps) {
  const hasMastery = crew?.upgrades?.some((u) => u.toLowerCase() === 'mastery') ?? false;
  const maxActionDots = hasMastery ? 4 : 3;

  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [advancingAttribute, setAdvancingAttribute] = useState<AttributeName | null>(null);
  const [levelUpTab, setLevelUpTab] = useState<'playbook' | 'veteran'>('playbook');
  const [veteranPlaybookFilter, setVeteranPlaybookFilter] = useState<string>('all');
  const [managingBadgesRelId, setManagingBadgesRelId] = useState<string | null>(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('amber');

  // Connect Contact Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectMode, setConnectMode] = useState<'create' | 'existing'>('existing');
  const [selectedExistingNpcId, setSelectedExistingNpcId] = useState('');
  const [existingScore, setExistingScore] = useState(50);
  const [existingBadges, setExistingBadges] = useState<string[]>([]);
  const [existingPublicNotes, setExistingPublicNotes] = useState('');
  const [existingPrivateNotes, setExistingPrivateNotes] = useState('');

  const unlinkedNpcs = npcs.filter((n) => !relations.some((r) => r.npc_id === n.id));

  const romanTier = (tier: number) => ['0', 'I', 'II', 'III', 'IV', 'V', 'VI'][tier] || tier;

  const getScoreTier = (score: number): { label: string; color: string; icon: string } => {
    if (score <= 20) return { label: 'Arch-Enemy', color: 'text-red-400 bg-red-950/60 border-red-800', icon: '▼' };
    if (score <= 40) return { label: 'Rival', color: 'text-rose-400 bg-rose-950/60 border-rose-800', icon: '▼' };
    if (score <= 60) return { label: 'Neutral', color: 'text-zinc-400 bg-zinc-900 border-zinc-700', icon: '●' };
    if (score <= 80) return { label: 'Ally', color: 'text-amber-400 bg-amber-950/60 border-amber-800', icon: '▲' };
    return { label: 'Devoted Friend', color: 'text-yellow-300 bg-yellow-950/60 border-yellow-600', icon: '▲' };
  };

  const toggleBadge = (rel: CharacterNpcRelation, badgeName: string) => {
    if (!onUpdateRelation) return;
    const exists = rel.badges.includes(badgeName);
    const updatedBadges = exists
      ? rel.badges.filter((b) => b !== badgeName)
      : [...rel.badges, badgeName];

    onUpdateRelation({
      ...rel,
      badges: updatedBadges,
      updated_at: new Date().toISOString()
    });
  };

  const handleAddNewLabelAndAssign = (rel: CharacterNpcRelation) => {
    if (!newLabelName.trim()) return;
    const trimmed = newLabelName.trim();
    if (onCreateCampaignLabel) {
      onCreateCampaignLabel(trimmed, newLabelColor);
    }
    if (onUpdateRelation && !rel.badges.includes(trimmed)) {
      onUpdateRelation({
        ...rel,
        badges: [...rel.badges, trimmed],
        updated_at: new Date().toISOString()
      });
    }
    setNewLabelName('');
  };

  const openConnectModal = () => {
    const defaultNpc = unlinkedNpcs[0]?.id || '';
    setSelectedExistingNpcId(defaultNpc);
    setExistingScore(50);
    setExistingBadges([]);
    setExistingPublicNotes('');
    setExistingPrivateNotes('');
    setConnectMode(unlinkedNpcs.length > 0 ? 'existing' : 'create');
    setShowConnectModal(true);
  };

  const handleConnectExistingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExistingNpcId || !onCreateRelation) return;

    onCreateRelation({
      campaign_id: character.campaign_id,
      character_id: character.id,
      npc_id: selectedExistingNpcId,
      score: existingScore,
      badges: existingBadges,
      public_notes: existingPublicNotes.trim() || undefined,
      private_notes: existingPrivateNotes.trim() || undefined
    });

    setShowConnectModal(false);
  };

  // Update handlers
  const updateDots = (action: ActionName, val: number) => {
    // In edit mode, cap dot setting at 3 unless crew has Mastery or user is GM
    const effectiveLimit = isGm || hasMastery ? 4 : 3;
    const clampedVal = Math.min(effectiveLimit, Math.max(0, val));
    onUpdateCharacter({
      ...character,
      action_dots: { ...character.action_dots, [action]: clampedVal },
      updated_at: new Date().toISOString()
    });
  };

  const updateAttributeXp = (xpKey: 'insight_xp' | 'prowess_xp' | 'resolve_xp', newXp: number) => {
    onUpdateCharacter({
      ...character,
      [xpKey]: Math.max(0, Math.min(6, newXp)),
      updated_at: new Date().toISOString()
    });
  };

  const updatePlaybookXp = (newXp: number) => {
    onUpdateCharacter({
      ...character,
      playbook_xp: Math.max(0, Math.min(8, newXp)),
      updated_at: new Date().toISOString()
    });
  };

  // Economy transactions
  const depositToStash = () => {
    if (character.coin <= 0 || character.stash >= 40) return;
    onUpdateCharacter({
      ...character,
      coin: character.coin - 1,
      stash: character.stash + 1,
      updated_at: new Date().toISOString()
    });
  };

  const withdrawFromStash = () => {
    // 2 Stash = 1 Coin rule per Blades SRD
    if (character.stash < 2 || character.coin >= 4) return;
    onUpdateCharacter({
      ...character,
      stash: character.stash - 2,
      coin: character.coin + 1,
      updated_at: new Date().toISOString()
    });
  };

  const toggleItemEquip = (itemId: string) => {
    const updatedInventory = character.inventory.map((item) =>
      item.id === itemId ? { ...item, equipped: !item.equipped } : item
    );
    onUpdateCharacter({
      ...character,
      inventory: updatedInventory,
      updated_at: new Date().toISOString()
    });
  };

  const unlockSpecialAbility = (abilityName: string) => {
    if (character.playbook_xp < 8) return;
    const updated = character.special_abilities.map((ab) =>
      ab.name === abilityName ? { ...ab, unlocked: true } : ab
    );
    onUpdateCharacter({
      ...character,
      special_abilities: updated,
      playbook_xp: Math.max(0, character.playbook_xp - 8),
      updated_at: new Date().toISOString()
    });
    setShowLevelUpModal(false);
  };

  const advanceAttributeAction = (action: ActionName) => {
    if (!advancingAttribute) return;
    const currentDots = character.action_dots[action] || 0;
    if (currentDots >= maxActionDots) return;
    const xpKey = ATTRIBUTES[advancingAttribute].xpKey;
    onUpdateCharacter({
      ...character,
      action_dots: {
        ...character.action_dots,
        [action]: currentDots + 1
      },
      [xpKey]: Math.max(0, character[xpKey] - 6),
      updated_at: new Date().toISOString()
    });
    setAdvancingAttribute(null);
  };

  const unlockVeteranAbility = (ability: { name: string; description: string }) => {
    if (character.playbook_xp < 8) return;
    const newAbility = {
      name: ability.name,
      description: ability.description,
      unlocked: true
    };
    onUpdateCharacter({
      ...character,
      special_abilities: [...character.special_abilities, newAbility],
      playbook_xp: Math.max(0, character.playbook_xp - 8),
      updated_at: new Date().toISOString()
    });
    setShowLevelUpModal(false);
  };

  const toggleAbilityManual = (abilityName: string) => {
    if (!isEditMode) return;
    const updated = character.special_abilities.map((ab) =>
      ab.name === abilityName ? { ...ab, unlocked: !ab.unlocked } : ab
    );
    onUpdateCharacter({
      ...character,
      special_abilities: updated,
      updated_at: new Date().toISOString()
    });
  };

  // Current equipped load calculation
  const currentLoad = character.inventory.reduce((acc, item) => (item.equipped ? acc + item.load : acc), 0);
  const maxLoad = LOAD_LIMITS[character.load_level];

  // Retirement Lifestyle Tier
  const getLifestyleTier = (stash: number) => {
    if (stash <= 10) return { label: 'Poor (Dunslough Slums)', color: 'text-zinc-500' };
    if (stash <= 20) return { label: 'Modest (Charhollow)', color: 'text-amber-400' };
    if (stash <= 30) return { label: 'Fine (Six Towers)', color: 'text-blue-400' };
    return { label: 'Luxurious (Brightstone Manor)', color: 'text-purple-400' };
  };

  const lifestyle = getLifestyleTier(character.stash);

  return (
    <div className="flex flex-col gap-5 text-zinc-100">
      {/* Scoundrel Header Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-amber-400 tracking-wide">{character.name}</h2>
            {character.alias && <span className="text-sm text-zinc-400 italic font-mono">&ldquo;{character.alias}&rdquo;</span>}
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800">
              {character.playbook}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-2">
            <span><strong>Heritage:</strong> {character.heritage || 'Unknown'}</span>
            <span>•</span>
            <span><strong>Background:</strong> {character.background || 'Unknown'}</span>
            <span>•</span>
            <span><strong>Vice:</strong> {character.vice || 'None'} ({character.vice_purveyor || 'Unknown Purveyor'})</span>
          </div>
        </div>

        {/* Playbook XP & Level Up */}
        <div className="flex items-center gap-3 bg-zinc-950/80 p-3 rounded-lg border border-zinc-800">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Playbook XP
            </span>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 8 }, (_, i) => {
                const boxNum = i + 1;
                const isMarked = boxNum <= character.playbook_xp;
                return (
                  <button
                    key={boxNum}
                    type="button"
                    disabled={readOnly}
                    onClick={() => updatePlaybookXp(boxNum === character.playbook_xp ? boxNum - 1 : boxNum)}
                    className={`w-3.5 h-3.5 rounded-xs border transition-all ${
                      isMarked
                        ? 'bg-amber-400 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                        : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {!readOnly && (
            <button
              onClick={() => setShowLevelUpModal(true)}
              disabled={character.playbook_xp < 8}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold uppercase tracking-wider shadow"
            >
              Advance
            </button>
          )}
        </div>
      </div>

      {/* Stress & Harm Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StressBar
          stress={character.stress}
          trauma={character.trauma}
          onUpdateStress={(s) => onUpdateCharacter({ ...character, stress: s })}
          onAddTrauma={(t) => onUpdateCharacter({ ...character, trauma: [...character.trauma, t] })}
          readOnly={readOnly}
        />
        <HarmMatrix
          harm={character.harm}
          armor={character.armor_used}
          onUpdateHarm={(h) => onUpdateCharacter({ ...character, harm: h })}
          onUpdateArmor={(a) => onUpdateCharacter({ ...character, armor_used: a })}
          readOnly={readOnly}
        />
      </div>

      {/* Action Ratings & Attribute XP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.entries(ATTRIBUTES) as [AttributeName, typeof ATTRIBUTES[AttributeName]][]).map(
          ([attrKey, attrData]) => {
            const attrRating = attrData.actions.filter((act) => (character.action_dots[act] || 0) > 0).length;

            return (
            <div
              key={attrKey}
              className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3 shadow"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm uppercase tracking-wider text-amber-400">
                    {attrData.label}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800"
                    title={`${attrData.label} Rating: ${attrRating}d (Dice pool for Resistance & Vice)`}
                  >
                    {attrRating}d
                  </span>
                  {onRollResistance && (
                    <button
                      type="button"
                      onClick={() => onRollResistance(attrKey)}
                      className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-semibold uppercase tracking-wider transition-colors"
                      title={`Roll ${attrData.label} Resistance (${attrRating}d)`}
                    >
                      <ShieldCheck className="w-3 h-3" /> Resist ({attrRating}d)
                    </button>
                  )}
                </div>

                {/* 6 Attribute XP Boxes & Advance Button */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono mr-1">XP</span>
                    {Array.from({ length: 6 }, (_, i) => {
                      const boxNum = i + 1;
                      const isMarked = boxNum <= character[attrData.xpKey];
                      return (
                        <button
                          key={boxNum}
                          type="button"
                          disabled={readOnly}
                          onClick={() => {
                            const nextXp = boxNum === character[attrData.xpKey] ? boxNum - 1 : boxNum;
                            updateAttributeXp(attrData.xpKey, nextXp);
                            if (nextXp >= 6) {
                              setAdvancingAttribute(attrKey);
                            }
                          }}
                          className={`w-3.5 h-3.5 rounded-xs border transition-all ${
                            isMarked
                              ? 'bg-amber-400 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                              : 'bg-zinc-950 border-zinc-700 hover:border-zinc-500'
                          }`}
                          title={`Mark ${boxNum} XP in ${attrData.label}`}
                        />
                      );
                    })}
                  </div>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => setAdvancingAttribute(attrKey)}
                      disabled={character[attrData.xpKey] < 6}
                      className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider shadow transition-all flex items-center gap-1 ${
                        character[attrData.xpKey] >= 6
                          ? 'bg-amber-500 hover:bg-amber-400 text-black animate-pulse cursor-pointer shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          : 'bg-zinc-800 text-zinc-500 opacity-40 cursor-not-allowed border border-zinc-700'
                      }`}
                      title={
                        character[attrData.xpKey] >= 6
                          ? `Advance ${attrData.label} (spend 6 XP)`
                          : `Requires 6 XP to advance (currently ${character[attrData.xpKey]}/6)`
                      }
                    >
                      <Sparkles className="w-3 h-3" /> Advance
                    </button>
                  )}
                </div>
              </div>
{/* Actions in this attribute */}
              <div className="flex flex-col gap-1">
                {attrData.actions.map((act) => {
                  const dots = character.action_dots[act] || 0;
                  return (
                    <div
                      key={act}
                      onClick={() => {
                        if (!isEditMode && onRollAction) {
                          onRollAction(act);
                        }
                      }}
                      className={`flex items-center gap-1 group rounded p-1 transition-colors ${
                        !isEditMode
                          ? 'cursor-pointer hover:bg-zinc-800/60'
                          : ''
                      }`}
                      title={!isEditMode ? `Click to roll ${act} (${dots}d)` : undefined}
                    >
                      {onRollAction && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRollAction(act);
                          }}
                          className="p-1 rounded text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                          title={`Roll ${act}`}
                        >
                          <Dices className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="flex-1">
                        <DotRating
                          label={act}
                          value={dots}
                          onChange={(val) => updateDots(act, val)}
                          readOnly={readOnly || !isEditMode}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Economy & Loadout Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scoundrel Economy */}
        <div className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3 shadow">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" /> Scoundrel Economy
            </span>
            <span className={`text-xs font-semibold ${lifestyle.color}`}>{lifestyle.label}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Purse (0-4 Coin) */}
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">Coin Purse (on hand)</span>
                <span className="text-xs font-mono font-bold text-amber-400">{character.coin} / 4</span>
              </div>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 4 }, (_, i) => {
                  const coinNum = i + 1;
                  const hasCoin = coinNum <= character.coin;
                  return (
                    <button
                      key={coinNum}
                      type="button"
                      disabled={readOnly}
                      onClick={() =>
                        onUpdateCharacter({
                          ...character,
                          coin: coinNum === character.coin ? coinNum - 1 : coinNum
                        })
                      }
                      className={`w-5 h-5 rounded-full border transition-all ${
                        hasCoin
                          ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : 'bg-zinc-900 border-zinc-700'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Stash (0-40 Coin) */}
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">Stash (Retirement)</span>
                <span className="text-xs font-mono font-bold text-amber-400">{character.stash} / 40</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={readOnly || character.coin <= 0 || character.stash >= 40}
                  onClick={depositToStash}
                  className="flex-1 flex items-center justify-center gap-1 text-[11px] py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200"
                >
                  <ArrowRight className="w-3 h-3" /> Deposit (1:1)
                </button>
                <button
                  type="button"
                  disabled={readOnly || character.stash < 2 || character.coin >= 4}
                  onClick={withdrawFromStash}
                  className="flex-1 flex items-center justify-center gap-1 text-[11px] py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200"
                >
                  <ArrowLeft className="w-3 h-3" /> Withdraw (2:1)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loadout & Gear */}
        <div className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3 shadow">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
              <Backpack className="w-4 h-4 text-amber-400" /> Equipment & Load
            </span>

            {/* Load selector */}
            <div className="flex items-center gap-1">
              {(['Light', 'Normal', 'Heavy'] as LoadCategory[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  disabled={readOnly}
                  onClick={() => onUpdateCharacter({ ...character, load_level: lvl })}
                  className={`text-xs px-2 py-0.5 rounded border ${
                    character.load_level === lvl
                      ? 'bg-amber-950/80 border-amber-600 text-amber-300 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                  }`}
                >
                  {lvl} ({LOAD_LIMITS[lvl]})
                </button>
              ))}
              <span
                className={`ml-2 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  currentLoad > maxLoad
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-zinc-950 text-zinc-300 border border-zinc-800'
                }`}
              >
                {currentLoad} / {maxLoad} Load
              </span>
            </div>
          </div>

          {/* Inventory Items List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {character.inventory.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={readOnly}
                onClick={() => toggleItemEquip(item.id)}
                className={`p-2 rounded border text-left flex items-center justify-between transition-all ${
                  item.equipped
                    ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                    : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{item.name}</span>
                  {item.description && <span className="text-[10px] text-zinc-500">{item.description}</span>}
                </div>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {item.load}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Special Abilities List */}
      <div className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3 shadow">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Playbook Special Abilities
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {character.special_abilities.map((ab) => (
            <div
              key={ab.name}
              className={`p-3 rounded-lg border flex flex-col gap-1 ${
                ab.unlocked
                  ? 'bg-zinc-950 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                  : 'bg-zinc-950/40 border-zinc-800/60 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${ab.unlocked ? 'text-amber-400' : 'text-zinc-500'}`}>
                  {ab.name}
                </span>
                {ab.unlocked ? (
                  <span className="text-[10px] text-amber-400 uppercase font-mono tracking-wider font-semibold">
                    ✓ Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-600 uppercase font-mono">Locked</span>
                )}
              </div>
              <p className="text-xs text-zinc-400 leading-snug">{ab.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Street Contacts & Relations (1-100 Grading Scale & Ties) */}
      <div className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3 shadow">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 flex-wrap gap-2">
          <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" /> Street Contacts & Relations
          </span>
          <div className="flex items-center gap-2.5">
            {!readOnly && (
              <button
                type="button"
                onClick={openConnectModal}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 transition-all shadow-xs"
              >
                <Plus className="w-3 h-3 text-amber-400" /> Connect / Add Contact
              </button>
            )}
            <span className="text-xs text-zinc-400 font-mono">
              {relations.length} {relations.length === 1 ? 'contact' : 'contacts'}
            </span>
          </div>
        </div>

        {relations.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-500 bg-zinc-950 rounded border border-zinc-800">
            No contacts recorded for this scoundrel yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relations.map((rel) => {
              const npc = npcs.find((n) => n.id === rel.npc_id);
              const affiliatedFaction = factions.find((f) => f.id === npc?.faction_id);
              const tier = getScoreTier(rel.score);

              return (
                <div
                  key={rel.id}
                  className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col gap-2.5 transition-all hover:border-zinc-700"
                >
                  {/* NPC Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-zinc-100 flex items-center gap-1">
                        {npc?.name || 'Street Contact'}
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        {affiliatedFaction ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-zinc-800 text-amber-300 border border-zinc-700/80 flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5 text-amber-400" />
                            {affiliatedFaction.name} (Tier {romanTier(affiliatedFaction.tier)})
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded text-zinc-500 bg-zinc-900 border border-zinc-800">
                            Independent
                          </span>
                        )}
                        {npc?.affiliation && (
                          <span className="text-xs text-zinc-400">
                            • {npc.affiliation}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tier Pill */}
                    <span className={`px-2 py-0.5 rounded border text-[11px] font-bold flex items-center gap-1 shrink-0 ${tier.color}`}>
                      <span>{tier.icon}</span>
                      <span>{tier.label}</span>
                    </span>
                  </div>

                  {npc?.quirk && (
                    <p className="text-[11px] text-zinc-400 italic bg-zinc-900/60 p-1.5 rounded border border-zinc-800/60">
                      &ldquo;{npc.quirk}&rdquo;
                    </p>
                  )}

                  {/* 1-100 Relationship Slider */}
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 uppercase font-bold tracking-wider text-[10px]">
                        Sentiment (1 = Foe, 100 = Friend)
                      </span>
                      <span className="font-mono font-bold text-amber-400">
                        {rel.score} / 100
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={readOnly || rel.score <= 1}
                        onClick={() =>
                          onUpdateRelation &&
                          onUpdateRelation({
                            ...rel,
                            score: Math.max(1, rel.score - 5),
                            updated_at: new Date().toISOString()
                          })
                        }
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-xs text-zinc-300 font-mono"
                        title="Decrease relation score by 5"
                      >
                        -5
                      </button>

                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={rel.score}
                        disabled={readOnly}
                        onChange={(e) =>
                          onUpdateRelation &&
                          onUpdateRelation({
                            ...rel,
                            score: parseInt(e.target.value),
                            updated_at: new Date().toISOString()
                          })
                        }
                        className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                      />

                      <button
                        type="button"
                        disabled={readOnly || rel.score >= 100}
                        onClick={() =>
                          onUpdateRelation &&
                          onUpdateRelation({
                            ...rel,
                            score: Math.min(100, rel.score + 5),
                            updated_at: new Date().toISOString()
                          })
                        }
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-xs text-zinc-300 font-mono"
                        title="Increase relation score by 5"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  {/* Narrative Notes */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <input
                      type="text"
                      placeholder="Public narrative note (shared with crew)..."
                      value={rel.public_notes || ''}
                      disabled={readOnly}
                      onChange={(e) =>
                        onUpdateRelation &&
                        onUpdateRelation({
                          ...rel,
                          public_notes: e.target.value,
                          updated_at: new Date().toISOString()
                        })
                      }
                      className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none focus:border-amber-500"
                    />

                    {/* GM Secret Note */}
                    {isGm && (
                      <div className="flex items-center gap-1">
                        <EyeOff className="w-3 h-3 text-purple-400 shrink-0" />
                        <input
                          type="text"
                          placeholder="GM Secret plot hook note..."
                          value={rel.private_notes || ''}
                          disabled={readOnly}
                          onChange={(e) =>
                            onUpdateRelation &&
                            onUpdateRelation({
                              ...rel,
                              private_notes: e.target.value,
                              updated_at: new Date().toISOString()
                            })
                          }
                          className="flex-1 bg-purple-950/40 border border-purple-800/60 rounded px-2 py-0.5 text-xs text-purple-200 outline-none focus:border-purple-500 font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Badges Display & Manage Button */}
                  <div className="flex items-center justify-between gap-1 flex-wrap pt-2 border-t border-zinc-900 mt-0.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      {rel.badges.length === 0 ? (
                        <span className="text-[10px] text-zinc-600 italic">No badges assigned</span>
                      ) : (
                        rel.badges.map((b) => (
                          <span
                            key={b}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-amber-300 border border-zinc-700 flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5 text-amber-400" />
                            {b}
                          </span>
                        ))
                      )}
                    </div>

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => setManagingBadgesRelId(rel.id)}
                        className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-amber-400" /> Badges ({rel.badges.length})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Badge Management Modal */}
      {managingBadgesRelId && (() => {
        const activeRel = relations.find((r) => r.id === managingBadgesRelId);
        if (!activeRel) return null;
        const activeNpc = npcs.find((n) => n.id === activeRel.npc_id);

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <h3 className="font-serif text-sm font-bold text-amber-400">
                    Relationship Badges • {activeNpc?.name || 'Contact'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setManagingBadgesRelId(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-200"
                >
                  ✕
                </button>
              </div>

              {/* System Badges */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
                  Systemwide Relationship Badges
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SYSTEM_RELATIONSHIP_BADGES.map((b) => {
                    const isSelected = activeRel.badges.includes(b.name);

                    return (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => toggleBadge(activeRel, b.name)}
                        className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 transition-all ${
                          isSelected
                            ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-xs'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-zinc-200">{b.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <span className="text-[10px] text-zinc-500 leading-snug">{b.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campaign Exclusive Labels */}
              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
                  Campaign-Exclusive Labels
                </span>

                {campaignLabels.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">
                    No custom campaign labels defined yet. Create one below!
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {campaignLabels.map((l) => {
                      const isSelected = activeRel.badges.includes(l.name);

                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => toggleBadge(activeRel, l.name)}
                          className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-xs'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <span className="font-semibold text-xs text-zinc-200">{l.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Create New Campaign Label Form */}
                <div className="mt-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col gap-2">
                  <span className="text-xs font-bold text-zinc-300">Create New Campaign Label</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Label name (e.g. Smuggling Partner, Blood Oath)..."
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-100 outline-none focus:border-amber-500"
                    />
                    <select
                      value={newLabelColor}
                      onChange={(e) => setNewLabelColor(e.target.value)}
                      className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 outline-none"
                    >
                      <option value="amber">Amber</option>
                      <option value="emerald">Emerald</option>
                      <option value="rose">Rose</option>
                      <option value="purple">Purple</option>
                      <option value="cyan">Cyan</option>
                      <option value="blue">Blue</option>
                      <option value="pink">Pink</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAddNewLabelAndAssign(activeRel)}
                      disabled={!newLabelName.trim()}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-semibold text-xs rounded shadow"
                    >
                      Add & Assign
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setManagingBadgesRelId(null)}
                  className="px-4 py-1.5 text-xs font-semibold rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Attribute Advancement Modal */}
      {advancingAttribute && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-zinc-900 border border-amber-500 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-serif text-base font-bold text-amber-400 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> {ATTRIBUTES[advancingAttribute].label} Advancement
              </h3>
              <button
                type="button"
                onClick={() => setAdvancingAttribute(null)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              You have accumulated 6 {ATTRIBUTES[advancingAttribute].label} XP! Choose an action within {ATTRIBUTES[advancingAttribute].label} to advance by +1 dot (standard max 3 dots, or 4 with Mastery):
            </p>

            {/* Action Cap & Mastery Banner */}
            <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
              hasMastery
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400'
            }`}>
              <div>
                <span className="font-bold uppercase tracking-wider">
                  Action Rating Cap: {maxActionDots} Dots
                </span>
                <p className="text-[11px] text-zinc-500">
                  {hasMastery
                    ? 'Crew possesses Mastery upgrade. Action ratings can advance up to 4 dots.'
                    : 'Standard cap is 3 dots. Advancing to 4 dots requires the Crew Mastery upgrade.'}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                hasMastery ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {hasMastery ? 'Mastery Active' : 'No Mastery (Cap: 3)'}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {ATTRIBUTES[advancingAttribute].actions.map((act) => {
                const currentDots = character.action_dots[act] || 0;
                const isMax = currentDots >= maxActionDots;
                const needsMastery = currentDots === 3 && !hasMastery;

                return (
                  <button
                    key={act}
                    disabled={isMax}
                    onClick={() => advanceAttributeAction(act)}
                    className="p-3 rounded-lg bg-zinc-950 hover:bg-amber-950/40 border border-zinc-800 hover:border-amber-500 transition-all flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed group text-left"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold capitalize text-zinc-200 group-hover:text-amber-400">
                        {act}
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Current rating: {currentDots} / {maxActionDots} dots {needsMastery && '(Requires Crew Mastery to reach 4)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 4 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-xs border ${
                              i < currentDots
                                ? 'bg-amber-400 border-amber-300'
                                : i === currentDots && !isMax
                                ? 'bg-amber-500/30 border-dashed border-amber-400 animate-pulse'
                                : 'bg-zinc-900 border-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded border transition-colors ${
                        isMax
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400 group-hover:bg-amber-500 group-hover:text-black'
                      }`}>
                        {isMax ? (needsMastery ? 'Needs Mastery' : 'Maxed') : '+1 Dot'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setAdvancingAttribute(null)}
                className="px-3 py-1.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level-Up Modal */}
      {showLevelUpModal && (() => {
        const otherPlaybooks = (Object.keys(SCOUNDREL_PLAYBOOKS) as ScoundrelPlaybook[]).filter(
          (pb) => pb !== character.playbook
        );

        const existingAbilityNames = new Set(character.special_abilities.map((a) => a.name));

        const veteranAbilitiesList: { playbook: ScoundrelPlaybook; name: string; description: string }[] = [];
        otherPlaybooks.forEach((pb) => {
          SCOUNDREL_PLAYBOOKS[pb].specialAbilities.forEach((ab) => {
            if (!existingAbilityNames.has(ab.name)) {
              veteranAbilitiesList.push({ playbook: pb, name: ab.name, description: ab.description });
            }
          });
        });

        const filteredVeteranAbilities =
          veteranPlaybookFilter === 'all'
            ? veteranAbilitiesList
            : veteranAbilitiesList.filter((a) => a.playbook === veteranPlaybookFilter);

        const availablePlaybookAbilities = character.special_abilities.filter((ab) => !ab.unlocked);

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="w-full max-w-2xl bg-zinc-900 border border-amber-500 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100 my-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="font-serif text-base font-bold text-amber-400">
                    Scoundrel Advancement (8 Playbook XP)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLevelUpModal(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-200"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-zinc-300 leading-snug">
                You have accumulated 8 Playbook XP! According to the Blades in the Dark SRD (p. 48), Playbook XP allows you to unlock an additional Special Ability from your playbook or select a Veteran ability from another playbook. (Action dots are advanced via Attribute XP tracks).
              </p>

              {/* 3 Navigation Tabs */}
              <div className="grid grid-cols-2 gap-2 border-b border-zinc-800 pb-2">
                <button
                  type="button"
                  onClick={() => setLevelUpTab('playbook')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    levelUpTab === 'playbook'
                      ? 'bg-amber-500 text-black shadow'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Playbook Special Ability ({availablePlaybookAbilities.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLevelUpTab('veteran')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    levelUpTab === 'veteran'
                      ? 'bg-amber-500 text-black shadow'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  Veteran Special Ability
                </button>
              </div>

              {/* Tab 1: Playbook Ability */}
              {levelUpTab === 'playbook' && (
                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto p-1">
                  {availablePlaybookAbilities.length === 0 ? (
                    <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 text-center text-xs text-zinc-400">
                      All special abilities for {character.playbook} are already unlocked! Check the Veteran Ability or Action Dot tabs.
                    </div>
                  ) : (
                    availablePlaybookAbilities.map((ab) => (
                      <button
                        key={ab.name}
                        type="button"
                        onClick={() => unlockSpecialAbility(ab.name)}
                        className="text-left p-3 rounded-lg bg-zinc-950 hover:bg-amber-950/40 border border-zinc-800 hover:border-amber-500 transition-all flex flex-col gap-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                            {ab.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 uppercase font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                            {character.playbook}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400 leading-snug">{ab.description}</span>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Veteran Ability */}
              {levelUpTab === 'veteran' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-zinc-400 uppercase font-bold mr-1">Filter Playbook:</span>
                    <button
                      type="button"
                      onClick={() => setVeteranPlaybookFilter('all')}
                      className={`text-[10px] px-2 py-0.5 rounded border ${
                        veteranPlaybookFilter === 'all'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      All
                    </button>
                    {otherPlaybooks.map((pb) => (
                      <button
                        key={pb}
                        type="button"
                        onClick={() => setVeteranPlaybookFilter(pb)}
                        className={`text-[10px] px-2 py-0.5 rounded border ${
                          veteranPlaybookFilter === pb
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {pb}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto p-1">
                    {filteredVeteranAbilities.map((ab) => (
                      <button
                        key={ab.name}
                        type="button"
                        onClick={() => unlockVeteranAbility(ab)}
                        className="text-left p-3 rounded-lg bg-zinc-950 hover:bg-amber-950/40 border border-zinc-800 hover:border-amber-500 transition-all flex flex-col gap-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                            {ab.name}
                          </span>
                          <span className="text-[10px] text-amber-400/80 uppercase font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">
                            Veteran: {ab.playbook}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400 leading-snug">{ab.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowLevelUpModal(false)}
                  className="px-4 py-1.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Connect / Add Contact Modal */}
      {showConnectModal && (
        connectMode === 'create' ? (
          <QuickNpcModal
            factions={factions}
            characters={[character]}
            campaignLabels={campaignLabels}
            preselectedCharacterId={character.id}
            isGm={isGm}
            onSubmit={(data) => {
              if (onQuickCreateNpc) onQuickCreateNpc(data);
              setShowConnectModal(false);
            }}
            onClose={() => setShowConnectModal(false)}
          />
        ) : (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <form
              onSubmit={handleConnectExistingSubmit}
              className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100 my-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-amber-400" />
                  <h3 className="font-serif text-sm font-bold text-amber-400">
                    Connect Street Contact • {character.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-200"
                >
                  ✕
                </button>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => setConnectMode('existing')}
                  className="flex-1 py-1.5 rounded font-semibold text-center transition-all bg-amber-500/20 text-amber-300 border border-amber-500/50"
                >
                  Connect Existing NPC
                </button>
                <button
                  type="button"
                  onClick={() => setConnectMode('create')}
                  className="flex-1 py-1.5 rounded font-semibold text-center transition-all text-zinc-400 hover:text-zinc-200 border border-transparent"
                >
                  + Create Brand New NPC
                </button>
              </div>

              {unlinkedNpcs.length === 0 ? (
                <div className="p-4 bg-zinc-950 rounded border border-zinc-800 flex flex-col items-center gap-2 text-center text-xs text-zinc-400">
                  <span>All campaign NPCs are already connected to {character.name}.</span>
                  <button
                    type="button"
                    onClick={() => setConnectMode('create')}
                    className="px-3 py-1 bg-amber-500 text-black font-semibold rounded text-xs"
                  >
                    Create New NPC Instead
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Select NPC */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase font-medium text-zinc-400">
                      Select Campaign NPC
                    </label>
                    <select
                      value={selectedExistingNpcId}
                      onChange={(e) => setSelectedExistingNpcId(e.target.value)}
                      className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-2 text-xs text-zinc-100 outline-none focus:border-amber-500"
                    >
                      {unlinkedNpcs.map((n) => {
                        const fac = factions.find((f) => f.id === n.faction_id);
                        return (
                          <option key={n.id} value={n.id}>
                            {n.name} {fac ? `(${fac.name})` : '(Independent)'} {n.affiliation ? `• ${n.affiliation}` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* 1-100 Score Slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 text-[11px]">Sentiment Score (1=Foe, 100=Friend)</span>
                      <span className="font-mono font-bold text-amber-400">{existingScore} / 100</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExistingScore((s) => Math.max(1, s - 5))}
                        className="px-2 py-0.5 rounded bg-zinc-800 text-xs text-zinc-300 font-mono"
                      >
                        -5
                      </button>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={existingScore}
                        onChange={(e) => setExistingScore(parseInt(e.target.value))}
                        className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => setExistingScore((s) => Math.min(100, s + 5))}
                        className="px-2 py-0.5 rounded bg-zinc-800 text-xs text-zinc-300 font-mono"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  {/* Badges Toggles */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-400" /> Relationship Badges (Optional)
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {SYSTEM_RELATIONSHIP_BADGES.map((b) => {
                        const isSelected = existingBadges.includes(b.name);
                        return (
                          <button
                            key={b.name}
                            type="button"
                            onClick={() =>
                              setExistingBadges((prev) =>
                                prev.includes(b.name) ? prev.filter((x) => x !== b.name) : [...prev, b.name]
                              )
                            }
                            className={`px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 transition-all ${
                              isSelected
                                ? 'bg-amber-500 text-black border-amber-400 font-bold'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                            {b.name}
                          </button>
                        );
                      })}
                      {campaignLabels.map((l) => {
                        const isSelected = existingBadges.includes(l.name);
                        return (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() =>
                              setExistingBadges((prev) =>
                                prev.includes(l.name) ? prev.filter((x) => x !== l.name) : [...prev, l.name]
                              )
                            }
                            className={`px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 transition-all ${
                              isSelected
                                ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                            {l.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Narrative Notes */}
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      placeholder="Public narrative connection..."
                      value={existingPublicNotes}
                      onChange={(e) => setExistingPublicNotes(e.target.value)}
                      className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-100 outline-none focus:border-amber-500"
                    />
                    {isGm && (
                      <div className="flex items-center gap-1">
                        <EyeOff className="w-3 h-3 text-purple-400 shrink-0" />
                        <input
                          type="text"
                          placeholder="Secret GM plot hook note..."
                          value={existingPrivateNotes}
                          onChange={(e) => setExistingPrivateNotes(e.target.value)}
                          className="flex-1 bg-purple-950/40 border border-purple-800/60 rounded px-2 py-1 text-xs text-purple-200 outline-none focus:border-purple-500 font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-3 py-1.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                >
                  Cancel
                </button>
                {unlinkedNpcs.length > 0 && (
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold rounded bg-amber-500 hover:bg-amber-400 text-black shadow"
                  >
                    Connect Contact
                  </button>
                )}
              </div>
            </form>
          </div>
        )
      )}
    </div>
  );
}
