'use client';

import React, { useState } from 'react';
import { Faction, Character, ContentVisibility, CampaignRelationshipLabel } from '@/types/blades';
import { SYSTEM_RELATIONSHIP_BADGES } from '@/lib/constants/playbooks';
import { Users, UserCheck, Shield, Plus, Eye, EyeOff, Check, Tag } from 'lucide-react';

export interface QuickNpcSubmitData {
  name: string;
  role?: string;
  quirk?: string;
  factionId?: string;
  newFactionName?: string;
  visibility: ContentVisibility;
  relation?: {
    characterId: string;
    score: number;
    badges: string[];
    publicNotes?: string;
    privateNotes?: string;
  };
}

interface QuickNpcModalProps {
  factions: Faction[];
  characters: Character[];
  campaignLabels?: CampaignRelationshipLabel[];
  preselectedCharacterId?: string;
  isGm: boolean;
  onSubmit: (data: QuickNpcSubmitData) => void;
  onClose: () => void;
}

export function QuickNpcModal({
  factions,
  characters,
  campaignLabels = [],
  preselectedCharacterId,
  isGm,
  onSubmit,
  onClose
}: QuickNpcModalProps) {
  // NPC Fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [quirk, setQuirk] = useState('');
  const [factionMode, setFactionMode] = useState<'existing' | 'new' | 'independent'>('existing');
  const [selectedFactionId, setSelectedFactionId] = useState<string>(factions[0]?.id || '');
  const [newFactionName, setNewFactionName] = useState('');
  const [visibility, setVisibility] = useState<ContentVisibility>('campaign_public');

  // Optional Relation Fields
  const [linkRelation, setLinkRelation] = useState(Boolean(preselectedCharacterId));
  const [targetCharacterId, setTargetCharacterId] = useState<string>(
    preselectedCharacterId || characters[0]?.id || ''
  );
  const [relationScore, setRelationScore] = useState<number>(50);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [publicNotes, setPublicNotes] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');

  const romanTier = (tier: number) => ['0', 'I', 'II', 'III', 'IV', 'V', 'VI'][tier] || tier;

  const getScoreTier = (score: number): { label: string; color: string; icon: string } => {
    if (score <= 20) return { label: 'Arch-Enemy', color: 'text-red-400 bg-red-950/60 border-red-800', icon: '▼' };
    if (score <= 40) return { label: 'Rival', color: 'text-rose-400 bg-rose-950/60 border-rose-800', icon: '▼' };
    if (score <= 60) return { label: 'Neutral', color: 'text-zinc-400 bg-zinc-900 border-zinc-700', icon: '●' };
    if (score <= 80) return { label: 'Ally', color: 'text-amber-400 bg-amber-950/60 border-amber-800', icon: '▲' };
    return { label: 'Devoted Friend', color: 'text-yellow-300 bg-yellow-950/60 border-yellow-600', icon: '▲' };
  };

  const toggleBadge = (badgeName: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badgeName) ? prev.filter((b) => b !== badgeName) : [...prev, badgeName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let factionId: string | undefined;
    let newFacName: string | undefined;

    if (factionMode === 'existing') {
      factionId = selectedFactionId || undefined;
    } else if (factionMode === 'new') {
      newFacName = newFactionName.trim() || undefined;
    }

    const submitData: QuickNpcSubmitData = {
      name: name.trim(),
      role: role.trim() || undefined,
      quirk: quirk.trim() || undefined,
      factionId,
      newFactionName: newFacName,
      visibility,
      relation: linkRelation && targetCharacterId ? {
        characterId: targetCharacterId,
        score: relationScore,
        badges: selectedBadges,
        publicNotes: publicNotes.trim() || undefined,
        privateNotes: privateNotes.trim() || undefined
      } : undefined
    };

    onSubmit(submitData);
  };

  const tier = getScoreTier(relationScore);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100 my-6 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-serif text-base font-bold text-amber-400">
                Quick-Create NPC / Street Contact
              </h3>
              <p className="text-[11px] text-zinc-400">
                Register a new character mid-session or mid-score
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* Section 1: NPC Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-medium text-zinc-400">
              Name <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Inspector Hox, Old Meg, Grin..."
              className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-medium text-zinc-400">Role / Profession</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Warehouse Guard, Spirit Medium, Fence..."
              className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Quirk / Encounter Context */}
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase font-medium text-zinc-400">
            Quirk / First Encounter Context
          </label>
          <input
            type="text"
            value={quirk}
            onChange={(e) => setQuirk(e.target.value)}
            placeholder="e.g. Smells of ozone, nervous stutter, owes the Red Sashes money..."
            className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-100 outline-none focus:border-amber-500"
          />
        </div>

        {/* Faction Assignment */}
        <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-zinc-950/70 border border-zinc-800">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> Faction Affiliation
            </label>
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setFactionMode('existing')}
                className={`px-2 py-0.5 rounded border ${
                  factionMode === 'existing'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                Existing
              </button>
              <button
                type="button"
                onClick={() => setFactionMode('independent')}
                className={`px-2 py-0.5 rounded border ${
                  factionMode === 'independent'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                Independent
              </button>
              <button
                type="button"
                onClick={() => setFactionMode('new')}
                className={`px-2 py-0.5 rounded border ${
                  factionMode === 'new'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                + New Faction
              </button>
            </div>
          </div>

          {factionMode === 'existing' && (
            <select
              value={selectedFactionId}
              onChange={(e) => setSelectedFactionId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-amber-500 mt-1"
            >
              {factions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} (Tier {romanTier(f.tier)}, {f.hold})
                </option>
              ))}
            </select>
          )}

          {factionMode === 'new' && (
            <div className="flex flex-col gap-1 mt-1">
              <input
                type="text"
                placeholder="New Faction Name (e.g. Coalridge Ironworkers, Fog Hounds)..."
                value={newFactionName}
                onChange={(e) => setNewFactionName(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-zinc-500">
                Will be automatically registered as a new campaign faction record.
              </span>
            </div>
          )}

          {factionMode === 'independent' && (
            <span className="text-xs text-zinc-500 italic mt-0.5">
              Unaligned street contact; does not belong to any formal faction.
            </span>
          )}
        </div>

        {/* Visibility (GM Only vs Public) */}
        {isGm && (
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-medium text-zinc-400">Visibility</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVisibility('campaign_public')}
                className={`flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded border ${
                  visibility === 'campaign_public'
                    ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-semibold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                }`}
              >
                <Eye className="w-3 h-3" /> Public (Visible to Crew)
              </button>
              <button
                type="button"
                onClick={() => setVisibility('gm_only')}
                className={`flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded border ${
                  visibility === 'gm_only'
                    ? 'bg-purple-950/80 border-purple-600 text-purple-200 font-semibold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                }`}
              >
                <EyeOff className="w-3 h-3" /> GM Only (Secret)
              </button>
            </div>
          </div>
        )}

        {/* Section 2: Optional Initial Relation Link */}
        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="linkRelationCheckbox"
                checked={linkRelation}
                onChange={(e) => setLinkRelation(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <label
                htmlFor="linkRelationCheckbox"
                className="text-xs uppercase font-bold tracking-wider text-amber-400 cursor-pointer flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" /> Link Relationship to a Scoundrel
              </label>
            </div>

            {linkRelation && (
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 ${tier.color}`}>
                <span>{tier.icon}</span>
                <span>{tier.label}</span>
              </span>
            )}
          </div>

          {linkRelation && (
            <div className="flex flex-col gap-3 pt-2 border-t border-zinc-900">
              {/* Target Scoundrel */}
              {characters.length > 0 && (
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-zinc-400">Target Scoundrel</label>
                  <select
                    value={targetCharacterId}
                    onChange={(e) => setTargetCharacterId(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
                  >
                    {characters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.alias ? `("${c.alias}")` : ''} — {c.playbook}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 1-100 Sentiment Score Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 text-[11px]">Sentiment Score (1=Foe, 100=Friend)</span>
                  <span className="font-mono font-bold text-amber-400">{relationScore} / 100</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRelationScore((s) => Math.max(1, s - 5))}
                    className="px-2 py-0.5 rounded bg-zinc-800 text-xs text-zinc-300 font-mono"
                  >
                    -5
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={relationScore}
                    onChange={(e) => setRelationScore(parseInt(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setRelationScore((s) => Math.min(100, s + 5))}
                    className="px-2 py-0.5 rounded bg-zinc-800 text-xs text-zinc-300 font-mono"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Quick Badge Toggles */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-amber-400" /> Initial Badges (Optional)
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {SYSTEM_RELATIONSHIP_BADGES.map((b) => {
                    const isSelected = selectedBadges.includes(b.name);
                    return (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => toggleBadge(b.name)}
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
                    const isSelected = selectedBadges.includes(l.name);
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => toggleBadge(l.name)}
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

              {/* Public & Private Notes */}
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Public relation note (e.g. He saved me in Silkshore)..."
                  value={publicNotes}
                  onChange={(e) => setPublicNotes(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-100 outline-none focus:border-amber-500"
                />
                {isGm && (
                  <div className="flex items-center gap-1">
                    <EyeOff className="w-3 h-3 text-purple-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Secret GM plot hook note..."
                      value={privateNotes}
                      onChange={(e) => setPrivateNotes(e.target.value)}
                      className="flex-1 bg-purple-950/40 border border-purple-800/60 rounded px-2 py-1 text-xs text-purple-200 outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-bold rounded bg-amber-500 hover:bg-amber-400 text-black shadow-lg"
          >
            Create NPC
          </button>
        </div>
      </form>
    </div>
  );
}
