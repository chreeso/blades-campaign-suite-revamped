'use client';

import React, { useState } from 'react';
import { ContentVisibility, MapPin, MapPinCategory, ProceduralStreet } from '@/types/blades';
import { MAP_PIN_CATEGORIES, MapPinDraft } from '@/lib/mapPins';
import { MapPin as MapPinIcon, Save, Sparkles, Trash2, X } from 'lucide-react';

interface MapPinEditorProps {
  /** Existing pin when editing; omitted when creating a new pin at `point`. */
  pin?: MapPin;
  point: { x: number; y: number };
  districtId: MapPin['district_id'];
  districtName: string;
  isGm: boolean;
  /** Street scene attached from the generator (overrides the pin's stored street). */
  attachedStreet?: ProceduralStreet;
  onSave: (draft: MapPinDraft) => void;
  onDelete?: () => void;
  onGenerateStreet: () => void;
  onCancel: () => void;
}

export function MapPinEditor({
  pin,
  point,
  districtId,
  districtName,
  isGm,
  attachedStreet,
  onSave,
  onDelete,
  onGenerateStreet,
  onCancel
}: MapPinEditorProps) {
  const [title, setTitle] = useState(pin?.title ?? '');
  const [category, setCategory] = useState<MapPinCategory>(pin?.category ?? 'landmark');
  const [notes, setNotes] = useState(pin?.notes ?? '');
  const [visibility, setVisibility] = useState<ContentVisibility>(pin?.visibility ?? 'campaign_public');

  const street = attachedStreet ?? pin?.street;
  const effectiveTitle = title.trim() || street?.name || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveTitle) return;
    onSave({
      district_id: districtId,
      x: point.x,
      y: point.y,
      title: effectiveTitle,
      category,
      notes: notes.trim(),
      visibility: isGm ? visibility : visibility === 'gm_only' ? 'campaign_public' : visibility,
      street
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400">
            {pin ? 'Edit Landmark' : 'New Landmark'} · {districtName}
          </span>
          <h3 className="font-serif text-lg font-black text-zinc-100 flex items-center gap-1.5">
            <MapPinIcon className="w-4 h-4 text-amber-400" /> {effectiveTitle || 'Unnamed Pin'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          aria-label="Close landmark editor"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <label className="flex flex-col gap-1 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={street?.name ?? 'e.g. The Leaky Bucket tavern'}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs normal-case font-normal tracking-normal text-zinc-200"
        />
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Category</span>
        <div className="flex flex-wrap gap-1.5">
          {MAP_PIN_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className={`text-[11px] px-2 py-1 rounded-lg border font-semibold ${
                category === c.id
                  ? `bg-zinc-800 border-zinc-500 ${c.textClass}`
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
        Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Who runs it, what the crew learned here…"
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs normal-case font-normal tracking-normal text-zinc-200 resize-y"
        />
      </label>

      <label className="flex flex-col gap-1 text-[10px] uppercase font-bold tracking-wider text-zinc-400">
        Visibility
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as ContentVisibility)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs normal-case font-normal tracking-normal text-zinc-200"
        >
          <option value="campaign_public">Public to the table</option>
          {isGm && <option value="gm_only">GM only (secret)</option>}
        </select>
      </label>

      {/* Attached street scene */}
      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs flex flex-col gap-1.5">
        {street ? (
          <>
            <span className="font-serif font-bold text-zinc-100">{street.name}</span>
            <span className="italic text-zinc-400">{street.streetType}</span>
            <span className="text-zinc-300">
              <b className="text-amber-400">Building:</b> {street.building}
            </span>
            <span className="text-zinc-300">
              <b className="text-red-400">Encounter:</b> {street.encounter}
            </span>
          </>
        ) : (
          <span className="text-zinc-500 italic">No street scene attached.</span>
        )}
        <button
          type="button"
          onClick={onGenerateStreet}
          className="self-start mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300"
        >
          <Sparkles className="w-3 h-3" /> {street ? 'Regenerate street scene' : 'Generate street scene'}
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-950/40"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={!effectiveTitle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" /> {pin ? 'Save Changes' : 'Drop Pin'}
        </button>
      </div>
    </form>
  );
}
