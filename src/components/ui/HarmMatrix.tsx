'use client';

import React from 'react';
import { HarmState, ArmorState } from '@/types/blades';
import { Shield, ShieldAlert, HeartPulse, Sparkles } from 'lucide-react';

interface HarmMatrixProps {
  harm: HarmState;
  armor: ArmorState;
  healingClock?: number;
  onUpdateHarm: (newHarm: HarmState) => void;
  onUpdateArmor: (newArmor: ArmorState) => void;
  onUpdateHealingClock?: (newClock: number) => void;
  onApplyHealing?: () => void;
  readOnly?: boolean;
}

export function HarmMatrix({
  harm,
  armor,
  healingClock = 0,
  onUpdateHarm,
  onUpdateArmor,
  onUpdateHealingClock,
  onApplyHealing,
  readOnly = false
}: HarmMatrixProps) {
  const handleLevel1Change = (index: 0 | 1, value: string) => {
    const next: [string, string] = [...harm.level1];
    next[index] = value;
    onUpdateHarm({ ...harm, level1: next });
  };

  const handleLevel2Change = (index: 0 | 1, value: string) => {
    const next: [string, string] = [...harm.level2];
    next[index] = value;
    onUpdateHarm({ ...harm, level2: next });
  };

  const handleLevel3Change = (value: string) => {
    onUpdateHarm({ ...harm, level3: value });
  };

  const toggleArmor = (type: keyof ArmorState) => {
    if (readOnly) return;
    onUpdateArmor({ ...armor, [type]: !armor[type] });
  };

  const hasLevel2Harm = Boolean(harm.level2[0] || harm.level2[1]);
  const hasLevel3Harm = Boolean(harm.level3);
  const hasAnyHarm = Boolean(harm.level1[0] || harm.level1[1] || hasLevel2Harm || hasLevel3Harm);

  return (
    <div className="p-4 bg-zinc-900/90 rounded-lg border border-zinc-800 text-zinc-100 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-red-400" />
          <h4 className="font-semibold text-xs uppercase tracking-wider text-red-400">Harm & Armor</h4>
        </div>

        {/* Armor Checkboxes */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={readOnly}
            onClick={() => toggleArmor('standard')}
            className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border transition-all ${
              armor.standard
                ? 'bg-amber-950/80 border-amber-600 text-amber-300 font-semibold'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}
          >
            <Shield className="w-3 h-3" /> Standard
          </button>
          <button
            type="button"
            disabled={readOnly}
            onClick={() => toggleArmor('heavy')}
            className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border transition-all ${
              armor.heavy
                ? 'bg-amber-950/80 border-amber-600 text-amber-300 font-semibold'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}
          >
            <ShieldAlert className="w-3 h-3" /> Heavy
          </button>
          <button
            type="button"
            disabled={readOnly}
            onClick={() => toggleArmor('special')}
            className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border transition-all ${
              armor.special
                ? 'bg-purple-950/80 border-purple-600 text-purple-300 font-semibold'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}
          >
            <Shield className="w-3 h-3" /> Special
          </button>
        </div>
      </div>

      {/* Harm Slots */}
      <div className="flex flex-col gap-2">
        {/* Level 3: Severe */}
        <div className="flex items-center gap-3 p-2 rounded bg-zinc-950 border border-red-950/60">
          <div className="w-20 flex-shrink-0 flex flex-col">
            <span className="text-xs font-bold text-red-400">LEVEL 3</span>
            <span className="text-[10px] text-zinc-500 uppercase">Incapacitated</span>
          </div>
          <input
            type="text"
            readOnly={readOnly}
            value={harm.level3 || ''}
            onChange={(e) => handleLevel3Change(e.target.value)}
            placeholder="Severe harm description (e.g. Skewered, Deep Puncture)..."
            className="flex-1 bg-transparent border-b border-zinc-800 focus:border-red-500 text-xs text-zinc-200 outline-none px-1 py-0.5 placeholder:text-zinc-600"
          />
        </div>

        {/* Level 2: Moderate (-1d to all actions) */}
        <div className="flex items-center gap-3 p-2 rounded bg-zinc-950 border border-amber-950/60">
          <div className="w-20 flex-shrink-0 flex flex-col">
            <span className="text-xs font-bold text-amber-400">LEVEL 2</span>
            <span className="text-[10px] text-zinc-500 uppercase">-1d to all</span>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2">
            <input
              type="text"
              readOnly={readOnly}
              value={harm.level2[0] || ''}
              onChange={(e) => handleLevel2Change(0, e.target.value)}
              placeholder="Harm slot 1..."
              className="bg-transparent border-b border-zinc-800 focus:border-amber-500 text-xs text-zinc-200 outline-none px-1 py-0.5 placeholder:text-zinc-600"
            />
            <input
              type="text"
              readOnly={readOnly}
              value={harm.level2[1] || ''}
              onChange={(e) => handleLevel2Change(1, e.target.value)}
              placeholder="Harm slot 2..."
              className="bg-transparent border-b border-zinc-800 focus:border-amber-500 text-xs text-zinc-200 outline-none px-1 py-0.5 placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* Level 1: Lesser (-1d when penalty applies) */}
        <div className="flex items-center gap-3 p-2 rounded bg-zinc-950 border border-zinc-800">
          <div className="w-20 flex-shrink-0 flex flex-col">
            <span className="text-xs font-bold text-zinc-400">LEVEL 1</span>
            <span className="text-[10px] text-zinc-500 uppercase">-1d context</span>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2">
            <input
              type="text"
              readOnly={readOnly}
              value={harm.level1[0] || ''}
              onChange={(e) => handleLevel1Change(0, e.target.value)}
              placeholder="Harm slot 1..."
              className="bg-transparent border-b border-zinc-800 focus:border-zinc-500 text-xs text-zinc-200 outline-none px-1 py-0.5 placeholder:text-zinc-600"
            />
            <input
              type="text"
              readOnly={readOnly}
              value={harm.level1[1] || ''}
              onChange={(e) => handleLevel1Change(1, e.target.value)}
              placeholder="Harm slot 2..."
              className="bg-transparent border-b border-zinc-800 focus:border-zinc-500 text-xs text-zinc-200 outline-none px-1 py-0.5 placeholder:text-zinc-600"
            />
          </div>
        </div>
      </div>

      {/* Active Harm Penalties Banner */}
      {(hasLevel3Harm || hasLevel2Harm) && (
        <div className="p-2 rounded bg-red-950/40 border border-red-900/60 flex items-center justify-between text-xs text-red-300">
          <span>
            {hasLevel3Harm
              ? '⚠️ Warning: Scoundrel is incapacitated and cannot act without pushing stress!'
              : '⚠️ Penalty: -1d applied to all action rolls due to Level 2 harm.'}
          </span>
        </div>
      )}

      {/* Healing / Recovery 4-Segment Linear Clock */}
      <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Healing Clock [{healingClock} / 4]
            </span>
          </div>
          {hasAnyHarm && onApplyHealing && (
            <button
              type="button"
              disabled={readOnly}
              onClick={onApplyHealing}
              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60 transition-all"
              title="Manually trigger harm downgrade (reduces all harm by 1 level)"
            >
              Heal 1 Level (Clear Clock)
            </button>
          )}
        </div>

        {/* 4 Linear Clock Segments */}
        <div className="grid grid-cols-4 gap-1.5 h-6">
          {[1, 2, 3, 4].map((seg) => {
            const isFilled = seg <= healingClock;
            return (
              <button
                key={seg}
                type="button"
                disabled={readOnly || !onUpdateHealingClock}
                onClick={() => {
                  if (onUpdateHealingClock) {
                    onUpdateHealingClock(seg === healingClock ? seg - 1 : seg);
                  }
                }}
                className={`rounded border transition-all flex items-center justify-center font-mono text-[10px] ${
                  isFilled
                    ? 'bg-emerald-500 border-emerald-400 text-black font-bold shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                }`}
                title={`Segment ${seg}/4 of Healing project`}
              >
                {seg}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-zinc-500 italic">
          Advance during Downtime via <strong>Recover</strong> (Physicker or Tinker). When filled, all harm downgrades 1 tier.
        </p>
      </div>
    </div>
  );
}
