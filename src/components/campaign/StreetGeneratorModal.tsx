'use client';

import React, { useState } from 'react';
import { DistrictId, ProceduralStreet, StreetTrait } from '@/types/blades';
import { DOSKVOL_DISTRICTS, getDistrictById } from '@/lib/constants/districts';
import { STREET_TRAIT_LABELS } from '@/lib/constants/streetOracles';
import { generateProceduralStreet, rerollStreetTrait } from '@/lib/streetGenerator';
import { playClockTickSound } from '@/lib/audio';
import {
  AlertTriangle,
  Building2,
  Check,
  Ear,
  Eye,
  Landmark,
  Lock,
  MapPin,
  RefreshCw,
  ScrollText,
  Sparkles,
  Unlock,
  Users,
  Wind
} from 'lucide-react';

interface StreetGeneratorModalProps {
  initialDistrictId: DistrictId;
  /** When provided, the district is fixed (e.g. a pin dropped at a specific map point). */
  lockDistrict?: boolean;
  onLogStreet: (street: ProceduralStreet, districtName: string) => void;
  /** Optional: persist the generated street as a map landmark. */
  onSaveAsPin?: (street: ProceduralStreet) => void;
  onClose: () => void;
}

const TRAIT_ICONS: Record<StreetTrait, React.ComponentType<{ className?: string }>> = {
  name: Landmark,
  streetType: MapPin,
  mood: Sparkles,
  sight: Eye,
  sound: Ear,
  smell: Wind,
  building: Building2,
  oddity: Landmark,
  encounter: Users,
  complication: AlertTriangle
};

const SENSORY_TRAITS: StreetTrait[] = ['sight', 'sound', 'smell'];
const FEATURE_TRAITS: StreetTrait[] = ['building', 'oddity', 'encounter', 'complication'];

export function StreetGeneratorModal({
  initialDistrictId,
  lockDistrict = false,
  onLogStreet,
  onSaveAsPin,
  onClose
}: StreetGeneratorModalProps) {
  const [districtId, setDistrictId] = useState<DistrictId>(initialDistrictId);
  const [street, setStreet] = useState<ProceduralStreet>(() =>
    generateProceduralStreet({ districtId: initialDistrictId })
  );
  const [locked, setLocked] = useState<StreetTrait[]>([]);
  const [logged, setLogged] = useState(false);
  const [saved, setSaved] = useState(false);

  const district = getDistrictById(districtId);

  const resetStatus = () => {
    setLogged(false);
    setSaved(false);
  };

  const handleRollAll = () => {
    setStreet((prev) => generateProceduralStreet({ districtId, previous: prev, locked }));
    playClockTickSound();
    resetStatus();
  };

  const handleDistrictChange = (id: DistrictId) => {
    setDistrictId(id);
    setStreet((prev) => generateProceduralStreet({ districtId: id, previous: prev, locked }));
    resetStatus();
  };

  const handleReroll = (trait: StreetTrait) => {
    setStreet((prev) => rerollStreetTrait(prev, trait));
    resetStatus();
  };

  const toggleLock = (trait: StreetTrait) => {
    setLocked((prev) => (prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]));
  };

  const handleLog = () => {
    onLogStreet(street, district.name);
    setLogged(true);
  };

  const handleSavePin = () => {
    onSaveAsPin?.(street);
    setSaved(true);
  };

  const renderTraitControls = (trait: StreetTrait) => {
    const isLocked = locked.includes(trait);
    return (
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => toggleLock(trait)}
          className={`p-1 rounded hover:bg-zinc-800 ${isLocked ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          title={isLocked ? `Unlock ${STREET_TRAIT_LABELS[trait]}` : `Lock ${STREET_TRAIT_LABELS[trait]}`}
          aria-pressed={isLocked}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => handleReroll(trait)}
          className="text-zinc-500 hover:text-amber-400 p-1 rounded hover:bg-zinc-800"
          title={`Reroll ${STREET_TRAIT_LABELS[trait]}`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  const renderTraitCard = (trait: StreetTrait, accent: string) => {
    const Icon = TRAIT_ICONS[trait];
    const isLocked = locked.includes(trait);
    return (
      <div
        className={`p-3 rounded-xl bg-zinc-950 border flex items-start justify-between gap-2 shadow ${
          isLocked ? 'border-amber-500/50' : 'border-zinc-800'
        }`}
      >
        <div className="flex flex-col gap-0.5">
          <span className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${accent}`}>
            <Icon className="w-3 h-3" /> {STREET_TRAIT_LABELS[trait]}
          </span>
          <p className="text-xs text-zinc-200 leading-snug">{street[trait]}</p>
        </div>
        {renderTraitControls(trait)}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="street-generator-title"
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-zinc-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 id="street-generator-title" className="font-serif text-lg font-bold text-zinc-100">
                Street-Level Generator
              </h3>
              <p className="text-xs text-zinc-400">Improvise a Doskvol street — lock what you like, reroll the rest</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRollAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs shadow transition-all hover:scale-105"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Roll New Street
            </button>
            <button
              onClick={onClose}
              className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1.5 rounded-lg bg-zinc-800"
              aria-label="Close street generator"
            >
              ✕
            </button>
          </div>
        </div>

        {/* District Selector */}
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="street-district" className="uppercase font-bold tracking-wider text-zinc-400 text-[10px]">
            District
          </label>
          <select
            id="street-district"
            value={districtId}
            disabled={lockDistrict}
            onChange={(e) => handleDistrictChange(e.target.value as DistrictId)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-zinc-200 disabled:opacity-60"
          >
            {DOSKVOL_DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.wealth})
              </option>
            ))}
          </select>
          {locked.length > 0 && (
            <span className="text-[10px] text-amber-400 font-mono">{locked.length} locked</span>
          )}
        </div>

        {/* Street Name & Type */}
        <div
          className={`p-4 rounded-xl bg-zinc-950 border shadow flex flex-col gap-2 ${
            locked.includes('name') || locked.includes('streetType') ? 'border-amber-500/50' : 'border-zinc-800'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400">
                {district.name}
              </span>
              <h4 className="font-serif text-xl font-black text-zinc-100">{street.name}</h4>
            </div>
            {renderTraitControls('name')}
          </div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs italic text-zinc-400">{street.streetType}</p>
            {renderTraitControls('streetType')}
          </div>
          <div className="flex items-start justify-between gap-2 pt-2 border-t border-zinc-800/80">
            <p className="text-xs text-zinc-300">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 mr-1.5">Mood</span>
              {street.mood}
            </p>
            {renderTraitControls('mood')}
          </div>
        </div>

        {/* Sensory Impressions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SENSORY_TRAITS.map((t) => (
            <React.Fragment key={t}>{renderTraitCard(t, 'text-cyan-400')}</React.Fragment>
          ))}
        </div>

        {/* Features & Encounters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURE_TRAITS.map((t) => (
            <React.Fragment key={t}>
              {renderTraitCard(t, t === 'encounter' || t === 'complication' ? 'text-red-400' : 'text-amber-400')}
            </React.Fragment>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800 flex-wrap">
          {onSaveAsPin && (
            <button
              onClick={handleSavePin}
              disabled={saved}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-bold text-xs disabled:opacity-60"
            >
              {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <MapPin className="w-3.5 h-3.5" />}
              {saved ? 'Pinned to Map' : 'Save as Map Pin'}
            </button>
          )}
          <button
            onClick={handleLog}
            disabled={logged}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs disabled:opacity-60"
          >
            {logged ? <Check className="w-3.5 h-3.5" /> : <ScrollText className="w-3.5 h-3.5" />}
            {logged ? 'Logged to Journal' : 'Log to Campaign Journal'}
          </button>
        </div>
      </div>
    </div>
  );
}
