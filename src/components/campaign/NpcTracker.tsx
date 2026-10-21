'use client';

import React, { useState } from 'react';
import { NPC, Faction, ContentVisibility, Character, CharacterNpcRelation } from '@/types/blades';
import { Users, Plus, EyeOff, Eye, UserCheck, Shield, Edit2, Search, Filter } from 'lucide-react';

interface NpcTrackerProps {
  npcs: NPC[];
  factions?: Faction[];
  characters?: Character[];
  characterRelations?: CharacterNpcRelation[];
  isGm: boolean;
  onUpdateNpc?: (updated: NPC) => void;
  onCreateNpc?: (npc: Omit<NPC, 'id' | 'created_at' | 'updated_at'>) => void;
  onDeleteNpc?: (npcId: string) => void;
}

export function NpcTracker({
  npcs,
  factions = [],
  characters = [],
  characterRelations = [],
  isGm,
  onUpdateNpc,
  onCreateNpc,
  onDeleteNpc
}: NpcTrackerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNpc, setEditingNpc] = useState<NPC | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [factionId, setFactionId] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [quirk, setQuirk] = useState('');
  const [notes, setNotes] = useState('');
  const [visibility, setVisibility] = useState<ContentVisibility>('campaign_public');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFactionId, setFilterFactionId] = useState('all');
  const [filterCharacterId, setFilterCharacterId] = useState('all');
  const [filterBadge, setFilterBadge] = useState('all');

  // Unique badges across all relations
  const allPresentBadges = Array.from(new Set(characterRelations.flatMap((r) => r.badges)));

  // Filter NPCs based on GM visibility & active filters
  const visibleNpcs = npcs.filter((npc) => {
    if (!isGm && npc.visibility === 'gm_only') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = npc.name.toLowerCase().includes(q);
      const matchAffil = npc.affiliation?.toLowerCase().includes(q);
      const matchQuirk = npc.quirk?.toLowerCase().includes(q);
      const matchNotes = isGm && npc.notes?.toLowerCase().includes(q);
      if (!matchName && !matchAffil && !matchQuirk && !matchNotes) return false;
    }

    // Faction filter
    if (filterFactionId === 'independent' && npc.faction_id) return false;
    if (filterFactionId !== 'all' && filterFactionId !== 'independent' && npc.faction_id !== filterFactionId) return false;

    // Character tie filter
    if (filterCharacterId !== 'all') {
      const hasTie = characterRelations.some(
        (r) => r.npc_id === npc.id && r.character_id === filterCharacterId
      );
      if (!hasTie) return false;
    }

    // Badge filter
    if (filterBadge !== 'all') {
      const hasBadge = characterRelations.some(
        (r) => r.npc_id === npc.id && r.badges.includes(filterBadge)
      );
      if (!hasBadge) return false;
    }

    return true;
  });

  const openCreateModal = () => {
    setName('');
    setFactionId('');
    setAffiliation('');
    setQuirk('');
    setNotes('');
    setVisibility('campaign_public');
    setEditingNpc(null);
    setShowCreateModal(true);
  };

  const openEditModal = (npc: NPC) => {
    setName(npc.name);
    setFactionId(npc.faction_id || '');
    setAffiliation(npc.affiliation || '');
    setQuirk(npc.quirk || '');
    setNotes(npc.notes || '');
    setVisibility(npc.visibility);
    setEditingNpc(npc);
    setShowCreateModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingNpc && onUpdateNpc) {
      onUpdateNpc({
        ...editingNpc,
        name: name.trim(),
        faction_id: factionId || undefined,
        affiliation: affiliation.trim() || undefined,
        quirk: quirk.trim() || undefined,
        notes: notes.trim() || undefined,
        visibility,
        updated_at: new Date().toISOString()
      });
    } else if (onCreateNpc) {
      onCreateNpc({
        campaign_id: '',
        name: name.trim(),
        faction_id: factionId || undefined,
        affiliation: affiliation.trim() || undefined,
        quirk: quirk.trim() || undefined,
        notes: notes.trim() || undefined,
        visibility
      });
    }

    setShowCreateModal(false);
    setEditingNpc(null);
  };

  const romanTier = (tier: number) => ['0', 'I', 'II', 'III', 'IV', 'V', 'VI'][tier] || tier;

  const getScoreTier = (score: number): { label: string; color: string; icon: string } => {
    if (score <= 20) return { label: 'Arch-Enemy', color: 'text-red-400 bg-red-950/60 border-red-800', icon: '▼' };
    if (score <= 40) return { label: 'Rival', color: 'text-rose-400 bg-rose-950/60 border-rose-800', icon: '▼' };
    if (score <= 60) return { label: 'Neutral', color: 'text-zinc-400 bg-zinc-900 border-zinc-700', icon: '●' };
    if (score <= 80) return { label: 'Ally', color: 'text-amber-400 bg-amber-950/60 border-amber-800', icon: '▲' };
    return { label: 'Devoted Friend', color: 'text-yellow-300 bg-yellow-950/60 border-yellow-600', icon: '▲' };
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          <h3 className="font-serif text-lg font-bold text-zinc-100">NPCs, Contacts & Affiliations</h3>
        </div>

        {isGm && onCreateNpc && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow"
          >
            <Plus className="w-4 h-4" /> Add NPC
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between flex-wrap gap-3 text-xs">
        {/* Search */}
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search NPCs by name, role, quirk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-zinc-100 outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-zinc-300">
              ✕
            </button>
          )}
        </div>

        {/* Faction Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={filterFactionId}
            onChange={(e) => setFilterFactionId(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 outline-none"
          >
            <option value="all">All Factions</option>
            <option value="independent">Independent only</option>
            {factions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Character Ties Filter */}
        {characters.length > 0 && (
          <select
            value={filterCharacterId}
            onChange={(e) => setFilterCharacterId(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 outline-none"
          >
            <option value="all">All Scoundrel Ties</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                Tied to {c.name}
              </option>
            ))}
          </select>
        )}

        {/* Badge Filter */}
        {allPresentBadges.length > 0 && (
          <select
            value={filterBadge}
            onChange={(e) => setFilterBadge(e.target.value)}
            className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 outline-none"
          >
            <option value="all">All Badges</option>
            {allPresentBadges.map((b) => (
              <option key={b} value={b}>
                Badge: {b}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* NPCs Grid */}
      {visibleNpcs.length === 0 ? (
        <div className="p-8 text-center bg-zinc-900/50 rounded-lg border border-zinc-800 text-zinc-500 text-sm">
          No NPC records found matching current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleNpcs.map((npc) => {
            const affiliatedFaction = factions.find((f) => f.id === npc.faction_id);
            const relationsForNpc = characterRelations.filter((r) => r.npc_id === npc.id);

            return (
              <div
                key={npc.id}
                className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between gap-3 shadow transition-all hover:border-zinc-700"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-amber-400" />
                        {npc.name}
                      </span>

                      {/* Faction and Role Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {affiliatedFaction ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-zinc-800 text-amber-300 border border-zinc-700/80 flex items-center gap-1">
                            <Shield className="w-2.5 h-2.5 text-amber-400" />
                            {affiliatedFaction.name} (Tier {romanTier(affiliatedFaction.tier)})
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded text-zinc-500 bg-zinc-950 border border-zinc-800">
                            Independent
                          </span>
                        )}
                        {npc.affiliation && (
                          <span className="text-xs text-zinc-300 font-medium">
                            • {npc.affiliation}
                          </span>
                        )}
                      </div>
                    </div>

                    {npc.visibility === 'gm_only' ? (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-mono">
                        <EyeOff className="w-3 h-3" /> GM
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                        <Eye className="w-3 h-3" /> Public
                      </span>
                    )}
                  </div>

                  {npc.quirk && (
                    <div className="mt-2 text-xs italic text-zinc-400 bg-zinc-950 p-2 rounded border border-zinc-800/80">
                      &ldquo;{npc.quirk}&rdquo;
                    </div>
                  )}

                  {npc.notes && (
                    <p className="text-xs text-zinc-300 mt-2 leading-relaxed whitespace-pre-wrap">
                      {npc.notes}
                    </p>
                  )}

                  {/* Scoundrel Connections */}
                  {relationsForNpc.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-amber-400" /> Scoundrel Connections ({relationsForNpc.length})
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {relationsForNpc.map((rel) => {
                          const char = characters.find((c) => c.id === rel.character_id);
                          const tier = getScoreTier(rel.score);

                          return (
                            <div
                              key={rel.id}
                              className="p-1.5 rounded bg-zinc-950/70 border border-zinc-800/90 text-xs flex flex-col gap-1"
                            >
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <span className="font-semibold text-zinc-200">
                                  {char?.name || 'Unknown Scoundrel'}
                                  {char?.alias && (
                                    <span className="text-zinc-400 text-[11px] font-normal">
                                      {' '}
                                      &ldquo;{char.alias}&rdquo;
                                    </span>
                                  )}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 ${tier.color}`}>
                                  <span>{tier.icon}</span>
                                  <span>{rel.score}/100</span>
                                  <span className="opacity-80">({tier.label})</span>
                                </span>
                              </div>

                              {rel.badges.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {rel.badges.map((b) => (
                                    <span
                                      key={b}
                                      className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-800 text-amber-300/90 border border-zinc-700/60"
                                    >
                                      {b}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {rel.public_notes && (
                                <p className="text-[11px] text-zinc-400 italic">
                                  &ldquo;{rel.public_notes}&rdquo;
                                </p>
                              )}

                              {isGm && rel.private_notes && (
                                <div className="text-[10px] text-purple-300 bg-purple-950/50 p-1 rounded border border-purple-800/60 font-mono">
                                  <EyeOff className="w-2.5 h-2.5 inline mr-1" />
                                  GM Secret: {rel.private_notes}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {isGm && (
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                    {onUpdateNpc ? (
                      <button
                        onClick={() => openEditModal(npc)}
                        className="text-[11px] text-zinc-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    ) : <div />}

                    {onDeleteNpc && (
                      <button
                        onClick={() => onDeleteNpc(npc.id)}
                        className="text-[11px] text-red-400 hover:text-red-300"
                      >
                        Delete NPC
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit NPC Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-serif text-base font-bold text-amber-400">
                {editingNpc ? 'Edit NPC / Contact' : 'Add NPC / Contact'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingNpc(null);
                }}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bazso Baz, Mylera Klev, Nyryx..."
                className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Faction Affiliation</label>
              <select
                value={factionId}
                onChange={(e) => setFactionId(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-100 outline-none focus:border-amber-500"
              >
                <option value="">Independent / Unaligned</option>
                {factions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Tier {romanTier(f.tier)}, {f.hold})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Role / Title within Faction</label>
              <input
                type="text"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="e.g. Gang Boss, Lieutenant, Enforcer, Fence..."
                className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Quirk / Mannerism</label>
              <input
                type="text"
                value={quirk}
                onChange={(e) => setQuirk(e.target.value)}
                placeholder="e.g. Speaks in whispers, taps an ivory cane..."
                className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Notes & Secrets</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Debts, loyalties, or leverage..."
                className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-100 outline-none focus:border-amber-500 resize-none"
              />
            </div>

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
                  <Eye className="w-3 h-3" /> Public
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
                  <EyeOff className="w-3 h-3" /> GM Only
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingNpc(null);
                }}
                className="px-3 py-1.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-black shadow"
              >
                {editingNpc ? 'Update NPC' : 'Save NPC'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
