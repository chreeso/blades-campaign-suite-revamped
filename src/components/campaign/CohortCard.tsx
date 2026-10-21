'use client';

import React, { useState } from 'react';
import { Cohort, CohortHarm } from '@/types/blades';
import {
  Users,
  UserCheck,
  Shield,
  ShieldAlert,
  Dices,
  Trash2,
  Sparkles,
  AlertTriangle,
  HeartPulse
} from 'lucide-react';

interface CohortCardProps {
  cohort: Cohort;
  crewTier: number;
  isGm: boolean;
  onUpdateCohort: (updated: Cohort) => void;
  onDeleteCohort?: (cohortId: string) => void;
}

export function CohortCard({
  cohort,
  crewTier,
  isGm,
  onUpdateCohort,
  onDeleteCohort
}: CohortCardProps) {
  const [rollResult, setRollResult] = useState<{ dice: number[]; chosenDie: number; outcome: string } | null>(null);

  const effectiveQuality = Math.max(
    0,
    cohort.quality + (cohort.harm === 'impaired' ? -1 : 0)
  );

  const handleRollQuality = () => {
    if (cohort.harm === 'broken') return;

    const isZero = effectiveQuality <= 0;
    const count = isZero ? 2 : effectiveQuality;
    const dice = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
    const chosenDie = isZero ? Math.min(...dice) : Math.max(...dice);
    const sixCount = dice.filter((d) => d === 6).length;

    let outcome = 'Bad Outcome';
    if (!isZero && sixCount >= 2) {
      outcome = 'Critical Success!';
    } else if (chosenDie === 6) {
      outcome = 'Full Success';
    } else if (chosenDie >= 4) {
      outcome = 'Partial Success';
    }

    setRollResult({ dice, chosenDie, outcome });
  };

  const setHarm = (newHarm: CohortHarm) => {
    onUpdateCohort({
      ...cohort,
      harm: newHarm
    });
  };

  const toggleArmor = () => {
    onUpdateCohort({
      ...cohort,
      armor_used: !cohort.armor_used
    });
  };

  return (
    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-3 shadow-md hover:border-zinc-700 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-amber-400">
            {cohort.kind === 'gang' ? <Users className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
              {cohort.name}
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-zinc-900 border border-zinc-700 text-zinc-400">
                {cohort.kind}
              </span>
            </h4>
            <span className="text-[11px] text-zinc-500 font-mono">
              Quality Tier {cohort.quality} • Scale {cohort.scale} ({cohort.kind === 'gang' ? 'Gang' : 'Expert'})
            </span>
          </div>
        </div>

        {isGm && onDeleteCohort && (
          <button
            onClick={() => onDeleteCohort(cohort.id)}
            className="text-zinc-600 hover:text-red-400 p-1 transition-colors"
            title="Delete Cohort"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {cohort.description && (
        <p className="text-xs text-zinc-400 italic leading-relaxed">
          &ldquo;{cohort.description}&rdquo;
        </p>
      )}

      {/* Edges & Flaws */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Edges</span>
          <div className="flex flex-wrap gap-1">
            {cohort.edges.map((e) => (
              <span key={e} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
                {e}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-red-400">Flaws</span>
          <div className="flex flex-wrap gap-1">
            {cohort.flaws.map((f) => (
              <span key={f} className="px-1.5 py-0.5 rounded text-[10px] bg-red-950/60 border border-red-800/60 text-red-300">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Harm & Armor State */}
      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Condition:</span>
          {(['healthy', 'impaired', 'broken'] as CohortHarm[]).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHarm(h)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                cohort.harm === h
                  ? h === 'healthy'
                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                    : h === 'impaired'
                    ? 'bg-amber-950 border border-amber-500 text-amber-300'
                    : 'bg-red-950 border border-red-500 text-red-300'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {h}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleArmor}
          className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border transition-all ${
            cohort.armor_used
              ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
              : 'bg-zinc-900 border-zinc-800 text-zinc-500'
          }`}
          title="Cohort Armor (1 use per score to mitigate harm)"
        >
          <Shield className="w-3 h-3" /> Armor
        </button>
      </div>

      {/* Action Trigger & Roll Results */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          disabled={cohort.harm === 'broken'}
          onClick={handleRollQuality}
          className="py-1.5 px-3 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
        >
          <Dices className="w-3.5 h-3.5 text-amber-400" />
          Roll Quality ({effectiveQuality}d)
          {cohort.harm === 'impaired' && ' [-1d Impaired]'}
        </button>

        {rollResult && (
          <div className="p-2 rounded bg-zinc-900/90 border border-zinc-800 flex items-center justify-between text-xs animate-in fade-in">
            <span className="text-zinc-400">
              Dice: [{rollResult.dice.join(', ')}]
            </span>
            <span className="font-bold text-amber-300">
              Chosen: {rollResult.chosenDie} ({rollResult.outcome})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
