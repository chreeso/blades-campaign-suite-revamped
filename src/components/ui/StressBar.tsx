'use client';

import React, { useState } from 'react';
import { TraumaCondition } from '@/types/blades';
import { AlertTriangle, Skull } from 'lucide-react';

const ALL_TRAUMAS: TraumaCondition[] = [
  'Cold',
  'Haunted',
  'Obsessed',
  'Paranoid',
  'Reckless',
  'Soft',
  'Unstable',
  'Vicious'
];

interface StressBarProps {
  stress: number; // 0 to 9
  trauma: TraumaCondition[]; // max 4
  onUpdateStress: (newStress: number) => void;
  onAddTrauma: (newTrauma: TraumaCondition) => void;
  readOnly?: boolean;
}

export function StressBar({
  stress,
  trauma,
  onUpdateStress,
  onAddTrauma,
  readOnly = false
}: StressBarProps) {
  const [showTraumaPicker, setShowTraumaPicker] = useState(false);

  const handleBoxClick = (boxNum: number) => {
    if (readOnly) return;
    if (boxNum === 9 && stress === 9) {
      // Taking 10th stress triggers trauma
      setShowTraumaPicker(true);
      return;
    }
    const nextVal = stress === boxNum ? boxNum - 1 : boxNum;
    onUpdateStress(Math.max(0, Math.min(9, nextVal)));
  };

  const selectTrauma = (condition: TraumaCondition) => {
    onAddTrauma(condition);
    onUpdateStress(0); // Stress resets to 0 upon taking trauma
    setShowTraumaPicker(false);
  };

  const isRetired = trauma.length >= 4;

  return (
    <div className="p-4 bg-zinc-900/90 rounded-lg border border-zinc-800 text-zinc-100 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider text-red-400">Stress</span>
          <span className="text-xs text-zinc-400 font-mono">[{stress} / 9]</span>
          {stress >= 7 && (
            <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
              <AlertTriangle className="w-3 h-3" /> Danger
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold tracking-wider text-purple-400">Trauma</span>
          <span className="text-xs text-zinc-400 font-mono">[{trauma.length} / 4]</span>
          {isRetired && (
            <span className="flex items-center gap-1 text-[11px] text-red-400 bg-red-950 px-1.5 py-0.5 rounded border border-red-800 font-bold">
              <Skull className="w-3 h-3" /> RETIRED
            </span>
          )}
        </div>
      </div>

      {/* 9 Stress Boxes */}
      <div className="grid grid-cols-9 gap-1.5 h-7">
        {Array.from({ length: 9 }, (_, i) => {
          const boxNum = i + 1;
          const isFilled = boxNum <= stress;

          return (
            <button
              key={boxNum}
              type="button"
              disabled={readOnly || isRetired}
              onClick={() => handleBoxClick(boxNum)}
              title={`Stress box ${boxNum}`}
              className={`rounded border transition-all duration-150 flex items-center justify-center font-mono text-xs font-semibold ${
                isFilled
                  ? 'bg-red-700/80 border-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                  : 'bg-zinc-950 border-zinc-700/80 hover:border-zinc-500 text-zinc-600'
              } ${readOnly || isRetired ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {boxNum}
            </button>
          );
        })}
      </div>

      {/* Acquired Trauma Badges */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-6 pt-1">
        {trauma.length === 0 ? (
          <span className="text-xs text-zinc-500 italic">No trauma conditions suffered yet.</span>
        ) : (
          trauma.map((t, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800 text-purple-300 font-medium tracking-wide uppercase"
            >
              {t}
            </span>
          ))
        )}
        {!readOnly && !isRetired && (
          <button
            onClick={() => setShowTraumaPicker(true)}
            className="text-[11px] text-zinc-400 hover:text-purple-300 underline underline-offset-2 ml-auto"
          >
            + Suffer Trauma
          </button>
        )}
      </div>

      {/* Trauma Condition Modal / Drawer */}
      {showTraumaPicker && (
        <div className="p-3 bg-zinc-950 rounded border border-purple-800/80 flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">
              Select 1 Trauma Condition (Resets Stress to 0)
            </span>
            <button
              onClick={() => setShowTraumaPicker(false)}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {ALL_TRAUMAS.map((condition) => {
              const alreadyTaken = trauma.includes(condition);
              return (
                <button
                  key={condition}
                  disabled={alreadyTaken}
                  onClick={() => selectTrauma(condition)}
                  className={`text-xs py-1.5 px-2 rounded border text-center transition-all ${
                    alreadyTaken
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed line-through'
                      : 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-800/80 text-purple-200 cursor-pointer font-medium'
                  }`}
                >
                  {condition}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
