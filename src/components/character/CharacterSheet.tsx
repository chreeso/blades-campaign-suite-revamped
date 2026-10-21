'use client';

import React, { useState } from 'react';
import { Character, ActionName, AttributeName, LoadCategory, NPC, Faction, CharacterNpcRelation, CampaignRelationshipLabel } from '@/types/blades';
import { SYSTEM_RELATIONSHIP_BADGES } from '@/lib/constants/playbooks';
import { DotRating } from '@/components/ui/DotRating';
import { StressBar } from '@/components/ui/StressBar';
import { HarmMatrix } from '@/components/ui/HarmMatrix';
import { Coins, Sparkles, Backpack, Award, ArrowRight, ArrowLeft, Dices, ShieldCheck, Users, Shield, Plus, Tag, EyeOff, Check } from 'lucide-react';

interface CharacterSheetProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  onRollAction?: (action: ActionName) => void;
  onRollResistance?: (attr: AttributeName) => void;
  readOnly?: boolean;
  npcs?: NPC[];
  factions?: Faction[];
  relations?: CharacterNpcRelation[];
  campaignLabels?: CampaignRelationshipLabel[];
  onUpdateRelation?: (updated: CharacterNpcRelation) => void;
  onCreateCampaignLabel?: (name: string, color: string) => void;
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
  onUpdateCharacter,
  onRollAction,
  onRollResistance,
  readOnly = false,
  npcs = [],
  factions = [],
  relations = [],
  campaignLabels = [],
  onUpdateRelation,
  onCreateCampaignLabel,
  isGm = false
}: CharacterSheetProps) {
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [managingBadgesRelId, setManagingBadgesRelId] = useState<string | null>(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('amber');

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

  // Update handlers
  const updateDots = (action: ActionName, val: number) => {
    onUpdateCharacter({
      ...character,
      action_dots: { ...character.action_dots, [action]: val },
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
      playbook_xp: 0, // Reset XP upon leveling up
      updated_at: new Date().toISOString()
    });
    setShowLevelUpModal(false);
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
          ([attrKey, attrData]) => (
            <div
              key={attrKey}
              className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-3 shadow"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm uppercase tracking-wider text-amber-400">
                    {attrData.label}
                  </span>
                  {onRollResistance && (
                    <button
                      type="button"
                      onClick={() => onRollResistance(attrKey)}
                      className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-semibold uppercase tracking-wider"
                      title={`Roll ${attrData.label} Resistance`}
                    >
                      <ShieldCheck className="w-3 h-3" /> Resist
                    </button>
                  )}
                </div>

                {/* 6 Attribute XP Boxes */}
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
                        onClick={() =>
                          updateAttributeXp(
                            attrData.xpKey,
                            boxNum === character[attrData.xpKey] ? boxNum - 1 : boxNum
                          )
                        }
                        className={`w-3 h-3 rounded-xs border transition-all ${
                          isMarked
                            ? 'bg-amber-400 border-amber-300'
                            : 'bg-zinc-950 border-zinc-700 hover:border-zinc-500'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Actions in this attribute */}
              <div className="flex flex-col gap-1">
                {attrData.actions.map((act) => (
                  <div key={act} className="flex items-center gap-1 group">
                    {onRollAction && (
                      <button
                        type="button"
                        onClick={() => onRollAction(act)}
                        className="p-1 rounded text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                        title={`Roll ${act}`}
                      >
                        <Dices className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="flex-1">
                      <DotRating
                        label={act}
                        value={character.action_dots[act] || 0}
                        onChange={(val) => updateDots(act, val)}
                        readOnly={readOnly}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
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
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" /> Street Contacts & Relations
          </span>
          <span className="text-xs text-zinc-400 font-mono">
            {relations.length} {relations.length === 1 ? 'contact' : 'contacts'}
          </span>
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

      {/* Level-Up Modal */}
      {showLevelUpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-zinc-900 border border-amber-500 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-serif text-base font-bold text-amber-400 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> Scoundrel Advancement (Level Up)
              </h3>
              <button
                type="button"
                onClick={() => setShowLevelUpModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              You have accumulated 8 Playbook XP! Choose a new Special Ability to unlock:
            </p>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto p-1">
              {character.special_abilities
                .filter((ab) => !ab.unlocked)
                .map((ab) => (
                  <button
                    key={ab.name}
                    onClick={() => unlockSpecialAbility(ab.name)}
                    className="text-left p-3 rounded-lg bg-zinc-950 hover:bg-amber-950/40 border border-zinc-800 hover:border-amber-500 transition-all flex flex-col gap-1"
                  >
                    <span className="text-xs font-bold text-amber-400">{ab.name}</span>
                    <span className="text-xs text-zinc-400">{ab.description}</span>
                  </button>
                ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowLevelUpModal(false)}
                className="px-3 py-1.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
