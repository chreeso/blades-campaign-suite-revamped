'use client';

import React, { useState } from 'react';
import { Character, ScoundrelPlaybook, ActionName, SpecialAbility, InventoryItem } from '@/types/blades';
import { SCOUNDREL_PLAYBOOKS, STANDARD_ITEMS, PlaybookContact } from '@/lib/constants/playbooks';
import { UserPlus, Sparkles, Check, Users, Plus, AlertCircle } from 'lucide-react';

export interface CharacterContactSelection {
  friend: PlaybookContact;
  foe: PlaybookContact;
  neutral: PlaybookContact[];
}

interface CharacterCreatorProps {
  campaignId: string;
  onCharacterCreated: (character: Character, contacts: CharacterContactSelection) => void;
  onCancel: () => void;
}

const HERITAGES = ['Akoros', 'Skovlan', 'Iruvia', 'Severos', 'The Dagger Isles', 'Tycheros'];
const BACKGROUNDS = ['Academic', 'Labor', 'Law', 'Trade', 'Military', 'Noble', 'Underworld'];
const VICES = ['Faith', 'Gambler', 'Luxury', 'Obligation', 'Pleasure', 'Stupor', 'Weird'];

export function CharacterCreator({
  campaignId,
  onCharacterCreated,
  onCancel
}: CharacterCreatorProps) {
  const [selectedPlaybook, setSelectedPlaybook] = useState<ScoundrelPlaybook>('Cutter');
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [heritage, setHeritage] = useState('Akoros');
  const [background, setBackground] = useState('Underworld');
  const [vice, setVice] = useState('Pleasure');
  const [vicePurveyor, setVicePurveyor] = useState('');
  const [selectedAbilityIndex, setSelectedAbilityIndex] = useState(0);

  // Playbook Contacts: 1 Friend and 1 Foe strictly required by Blades in the Dark rules
  const [friendName, setFriendName] = useState<string | null>(null);
  const [foeName, setFoeName] = useState<string | null>(null);
  const [customContacts, setCustomContacts] = useState<PlaybookContact[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customFaction, setCustomFaction] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [contactError, setContactError] = useState<string | null>(null);

  const playbookData = SCOUNDREL_PLAYBOOKS[selectedPlaybook];
  const allContacts = [...playbookData.contacts, ...customContacts];

  const handlePlaybookChange = (pb: ScoundrelPlaybook) => {
    setSelectedPlaybook(pb);
    setFriendName(null);
    setFoeName(null);
    setContactError(null);
  };

  const toggleFriend = (cName: string) => {
    setContactError(null);
    if (friendName === cName) {
      setFriendName(null);
    } else {
      setFriendName(cName);
      if (foeName === cName) setFoeName(null);
    }
  };

  const toggleFoe = (cName: string) => {
    setContactError(null);
    if (foeName === cName) {
      setFoeName(null);
    } else {
      setFoeName(cName);
      if (friendName === cName) setFriendName(null);
    }
  };

  const handleAddCustomContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newContact: PlaybookContact = {
      name: customName.trim(),
      description: customDesc.trim() || 'A contact from the streets',
      suggestedFaction: customFaction.trim() || 'Independent',
      suggestedRole: customRole.trim() || 'Associate'
    };
    setCustomContacts((prev) => [...prev, newContact]);
    setCustomName('');
    setCustomDesc('');
    setCustomFaction('');
    setCustomRole('');
    setShowAddCustom(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Strict validation: must pick 1 Friend and 1 Foe
    if (!friendName || !foeName) {
      setContactError('Blades in the Dark rule requirement: You must choose 1 Close Friend (▲) and 1 Rival/Foe (▼) to create a scoundrel.');
      return;
    }

    const friendContact = allContacts.find((c) => c.name === friendName);
    const foeContact = allContacts.find((c) => c.name === foeName);

    if (!friendContact || !foeContact) {
      setContactError('Selected contacts could not be found.');
      return;
    }

    const neutralContacts = allContacts.filter((c) => c.name !== friendName && c.name !== foeName);

    // Build baseline action dots
    const actionDots: Record<ActionName, number> = {
      hunt: 0,
      study: 0,
      survey: 0,
      tinker: 0,
      finesse: 0,
      prowl: 0,
      skirmish: 0,
      wreck: 0,
      attune: 0,
      command: 0,
      consort: 0,
      sway: 0
    };

    // Apply playbook default starting dots
    Object.entries(playbookData.defaultActions).forEach(([action, dots]) => {
      actionDots[action as ActionName] = dots;
    });

    // Special abilities list with chosen ability unlocked
    const abilities: SpecialAbility[] = playbookData.specialAbilities.map((ab, idx) => ({
      name: ab.name,
      description: ab.description,
      unlocked: idx === selectedAbilityIndex
    }));

    // Inventory items (playbook unique + standard items)
    const inventory: InventoryItem[] = [
      ...playbookData.uniqueInventory.map((item, idx) => ({
        id: `unique_${idx}`,
        name: item.name,
        load: item.load,
        description: item.description,
        equipped: false
      })),
      ...STANDARD_ITEMS.map((item, idx) => ({
        id: `std_${idx}`,
        name: item.name,
        load: item.load,
        description: item.description,
        equipped: false
      }))
    ];

    const newCharacter: Character = {
      id: crypto.randomUUID(),
      campaign_id: campaignId,
      user_id: 'current_user',
      name: name.trim(),
      alias: alias.trim() || undefined,
      playbook: selectedPlaybook,
      heritage,
      background,
      vice,
      vice_purveyor: vicePurveyor.trim() || undefined,
      stress: 0,
      trauma: [],
      harm: {
        level1: ['', ''],
        level2: ['', ''],
        level3: ''
      },
      armor_used: {
        standard: false,
        heavy: false,
        special: false
      },
      action_dots: actionDots,
      playbook_xp: 0,
      insight_xp: 0,
      prowess_xp: 0,
      resolve_xp: 0,
      coin: 0,
      stash: 0,
      load_level: 'Normal',
      special_abilities: abilities,
      inventory,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onCharacterCreated(newCharacter, {
      friend: friendContact,
      foe: foeContact,
      neutral: neutralContacts
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-zinc-900 border border-zinc-700 rounded-xl p-6 shadow-2xl flex flex-col gap-5 text-zinc-100 my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-lg font-bold text-amber-400">Scoundrel Character Creator</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* 1. Playbook Selection Pills */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold tracking-wider text-zinc-400">
            1. Select Scoundrel Playbook
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {(Object.keys(SCOUNDREL_PLAYBOOKS) as ScoundrelPlaybook[]).map((pb) => (
              <button
                key={pb}
                type="button"
                onClick={() => handlePlaybookChange(pb)}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-all ${
                  selectedPlaybook === pb
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span>{pb}</span>
              </button>
            ))}
          </div>
          <div className="p-3 bg-zinc-950 rounded border border-zinc-800 text-xs flex flex-col gap-1">
            <span className="font-medium text-amber-400 italic">&ldquo;{playbookData.tagline}&rdquo;</span>
            <span className="text-zinc-400">
              <strong className="text-zinc-300">XP Trigger:</strong> {playbookData.xpTrigger}
            </span>
          </div>
        </div>

        {/* 2. Identity & Background */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-medium text-zinc-400">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Corvo, Sean, Valik..."
              className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-medium text-zinc-400">Alias (Street Moniker)</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="e.g. 'The Silver Ghost', 'Rook', 'Nails'..."
              className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-medium text-zinc-400">Heritage</label>
            <select
              value={heritage}
              onChange={(e) => setHeritage(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-2 text-xs text-zinc-100 outline-none"
            >
              {HERITAGES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-medium text-zinc-400">Background</label>
            <select
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-2 text-xs text-zinc-100 outline-none"
            >
              {BACKGROUNDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-medium text-zinc-400">Vice</label>
            <select
              value={vice}
              onChange={(e) => setVice(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-2 text-xs text-zinc-100 outline-none"
            >
              {VICES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-medium text-zinc-400">Vice Purveyor</label>
            <input
              type="text"
              value={vicePurveyor}
              onChange={(e) => setVicePurveyor(e.target.value)}
              placeholder="e.g. Master Vane, Silkshore Den..."
              className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-2 text-xs text-zinc-100 outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* 3. Starting Special Ability */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 2. Choose Starting Special Ability
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
            {playbookData.specialAbilities.map((ab, idx) => {
              const isSelected = selectedAbilityIndex === idx;
              return (
                <button
                  key={ab.name}
                  type="button"
                  onClick={() => setSelectedAbilityIndex(idx)}
                  className={`text-left p-2.5 rounded-lg border flex flex-col gap-1 transition-all ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-amber-400">{ab.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-snug">{ab.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Playbook Contacts & Relations (Mandatory SRD Rule: Choose 1 Friend & 1 Foe) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-300">
                3. Choose 1 Friend (▲) and 1 Foe / Rival (▼)
              </label>
            </div>
            <button
              type="button"
              onClick={() => setShowAddCustom((prev) => !prev)}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
            >
              <Plus className="w-3 h-3" /> {showAddCustom ? 'Close Custom Contact' : 'Add Custom Contact'}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className={`px-2.5 py-1 rounded border flex items-center gap-1.5 text-xs ${
              friendName ? 'bg-amber-950/60 border-amber-500/70 text-amber-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}>
              <span className="font-bold">▲ Friend:</span>
              <span>{friendName || 'None selected'}</span>
            </div>
            <div className={`px-2.5 py-1 rounded border flex items-center gap-1.5 text-xs ${
              foeName ? 'bg-rose-950/60 border-rose-500/70 text-rose-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}>
              <span className="font-bold">▼ Foe:</span>
              <span>{foeName || 'None selected'}</span>
            </div>
          </div>

          {/* Custom Contact Form */}
          {showAddCustom && (
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-700 flex flex-col gap-2.5">
              <span className="text-xs font-bold text-zinc-300">Create Custom Street Contact</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Role / Profession"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Suggested Faction"
                  value={customFaction}
                  onChange={(e) => setCustomFaction(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Short Description"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddCustomContact}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded"
                >
                  Add to Contacts
                </button>
              </div>
            </div>
          )}

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
            {allContacts.map((contact) => {
              const isFriend = friendName === contact.name;
              const isFoe = foeName === contact.name;

              return (
                <div
                  key={contact.name}
                  className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 transition-all ${
                    isFriend
                      ? 'bg-amber-950/30 border-amber-500/80 shadow-sm'
                      : isFoe
                      ? 'bg-rose-950/30 border-rose-500/80 shadow-sm'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-zinc-200">{contact.name}</span>
                      <span className="text-[10px] text-zinc-400">({contact.description})</span>
                    </div>
                    <span className="text-[10px] text-amber-400/80 mt-0.5 truncate">
                      {contact.suggestedFaction} • {contact.suggestedRole}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      title="Set as Close Friend (▲)"
                      onClick={() => toggleFriend(contact.name)}
                      className={`px-2 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                        isFriend
                          ? 'bg-amber-500 text-black shadow'
                          : 'bg-zinc-900 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
                      }`}
                    >
                      ▲ Friend
                    </button>
                    <button
                      type="button"
                      title="Set as Rival / Foe (▼)"
                      onClick={() => toggleFoe(contact.name)}
                      className={`px-2 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                        isFoe
                          ? 'bg-rose-600 text-white shadow'
                          : 'bg-zinc-900 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800'
                      }`}
                    >
                      ▼ Foe
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Validation Warning Alert */}
          {contactError && (
            <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{contactError}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-black shadow-lg"
          >
            Create Scoundrel
          </button>
        </div>
      </form>
    </div>
  );
}
