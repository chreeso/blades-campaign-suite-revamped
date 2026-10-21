'use client';

import React, { useState } from 'react';
import {
  Character,
  Clock,
  ActionName,
  AttributeName,
  RollPosition,
  RollEffect,
  RollResult
} from '@/types/blades';
import { resolveActionRoll, resolveResistanceRoll } from '@/lib/roller';
import { Dices, Flame, HandMetal, Sparkles, Check, Zap } from 'lucide-react';

interface DiceRollerProps {
  character: Character;
  clocks: Clock[];
  defaultAction?: ActionName;
  defaultAttribute?: AttributeName;
  initialMode?: 'action' | 'resistance';
  initialPosition?: RollPosition;
  initialNarrative?: string;
  onUpdateCharacter: (updated: Character) => void;
  onUpdateClock: (updated: Clock) => void;
  onClose: () => void;
}

const ACTION_ATTRIBUTES: Record<ActionName, AttributeName> = {
  hunt: 'insight',
  study: 'insight',
  survey: 'insight',
  tinker: 'insight',
  finesse: 'prowess',
  prowl: 'prowess',
  skirmish: 'prowess',
  wreck: 'prowess',
  attune: 'resolve',
  command: 'resolve',
  consort: 'resolve',
  sway: 'resolve'
};

export function DiceRoller({
  character,
  clocks,
  defaultAction = 'skirmish',
  defaultAttribute = 'prowess',
  initialMode = 'action',
  initialPosition,
  initialNarrative,
  onUpdateCharacter,
  onUpdateClock,
  onClose
}: DiceRollerProps) {
  const [rollMode, setRollMode] = useState<'action' | 'resistance'>(initialMode);
  const [selectedAction, setSelectedAction] = useState<ActionName>(defaultAction);
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeName>(defaultAttribute);

  // Modifiers
  const [position, setPosition] = useState<RollPosition>(initialPosition || 'Risky');
  const [effect, setEffect] = useState<RollEffect>('Standard');
  const [pushDice, setPushDice] = useState(false);
  const [pushEffect, setPushEffect] = useState(false);
  const [assist, setAssist] = useState(false);
  const [devilsBargain, setDevilsBargain] = useState(false);
  const [bargainText, setBargainText] = useState('');

  // Results
  const [result, setResult] = useState<RollResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedClockId, setSelectedClockId] = useState<string>(clocks[0]?.id || '');

  // Calculate Base Pool
  const baseDots =
    rollMode === 'action'
      ? character.action_dots[selectedAction] || 0
      : (() => {
          // Count actions in this attribute with >= 1 dot
          const attrActions = Object.entries(ACTION_ATTRIBUTES)
            .filter(([, attr]) => attr === selectedAttribute)
            .map(([act]) => character.action_dots[act as ActionName] || 0);
          return attrActions.filter((dots) => dots > 0).length;
        })();

  const totalDice = Math.max(
    0,
    baseDots + (pushDice ? 1 : 0) + (assist ? 1 : 0) + (devilsBargain ? 1 : 0)
  );

  const handleRoll = () => {
    setIsRolling(true);

    setTimeout(() => {
      let rollRes: RollResult;
      const effectiveEffect = pushEffect && effect !== 'Great' ? 'Great' : effect;

      if (rollMode === 'action') {
        rollRes = resolveActionRoll(totalDice, position, effectiveEffect);

        // Update character if pushed or desperate
        const updatedChar = { ...character };

        // Stress cost for pushing (+1d or +1 effect costs 2 stress)
        if (pushDice || pushEffect) {
          updatedChar.stress = Math.min(9, updatedChar.stress + 2);
        }

        // Desperate roll gives 1 XP to the corresponding attribute!
        if (position === 'Desperate') {
          const attr = ACTION_ATTRIBUTES[selectedAction];
          const xpKey = `${attr}_xp` as 'insight_xp' | 'prowess_xp' | 'resolve_xp';
          updatedChar[xpKey] = Math.min(6, updatedChar[xpKey] + 1);
        }

        onUpdateCharacter(updatedChar);
      } else {
        // Resistance roll
        rollRes = resolveResistanceRoll(baseDots);
        if (rollRes.stressCost !== undefined) {
          const newStress = Math.max(0, Math.min(9, character.stress + rollRes.stressCost));
          onUpdateCharacter({ ...character, stress: newStress });
        }
      }

      setResult(rollRes);
      setIsRolling(false);
    }, 250);
  };

  const handleApplyToClock = () => {
    if (!result || result.ticks <= 0 || !selectedClockId) return;
    const targetClock = clocks.find((c) => c.id === selectedClockId);
    if (!targetClock) return;

    onUpdateClock({
      ...targetClock,
      current_segments: Math.min(targetClock.max_segments, targetClock.current_segments + result.ticks),
      updated_at: new Date().toISOString()
    });
  };

  const getOutcomeBadge = (outcome: RollResult['outcome']) => {
    switch (outcome) {
      case 'critical':
        return 'bg-amber-400 text-black font-extrabold shadow-[0_0_15px_rgba(251,191,36,0.8)]';
      case 'full_success':
        return 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.6)]';
      case 'partial_success':
        return 'bg-amber-500/80 text-black font-bold';
      case 'bad_outcome':
      default:
        return 'bg-red-600 text-white font-bold';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-zinc-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-zinc-100">
                {rollMode === 'action' ? 'Action Roll' : 'Resistance Roll'}
              </h3>
              <p className="text-xs text-zinc-400">
                Rolling for <strong className="text-amber-300">{character.name}</strong> ({character.playbook})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode switch */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setRollMode('action');
                  setResult(null);
                }}
                className={`text-xs px-2.5 py-1 rounded transition-all font-semibold ${
                  rollMode === 'action' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Action
              </button>
              <button
                type="button"
                onClick={() => {
                  setRollMode('resistance');
                  setResult(null);
                }}
                className={`text-xs px-2.5 py-1 rounded transition-all font-semibold ${
                  rollMode === 'resistance' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Resistance
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-xs text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg bg-zinc-800"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Engagement Context Banner */}
        {initialNarrative && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 flex items-start gap-2.5 text-xs text-amber-200">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-amber-400">
                Score Engagement Opening
              </span>
              <p className="leading-relaxed text-zinc-300">{initialNarrative}</p>
            </div>
          </div>
        )}

        {/* Action Selection & Parameters */}
        {rollMode === 'action' ? (
          <div className="flex flex-col gap-4">
            {/* Action Dropdown & Base Dots */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Action Rating</label>
                <select
                  value={selectedAction}
                  onChange={(e) => {
                    setSelectedAction(e.target.value as ActionName);
                    setResult(null);
                  }}
                  className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none capitalize"
                >
                  {Object.keys(ACTION_ATTRIBUTES).map((act) => (
                    <option key={act} value={act}>
                      {act} ({character.action_dots[act as ActionName] || 0} dots)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Total Dice Pool</label>
                <div className="flex items-center gap-2 h-10 px-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-sm">
                  <span className="font-bold text-amber-400">{totalDice}d</span>
                  {totalDice === 0 ? (
                    <span className="text-xs text-red-400 font-sans italic ml-auto">
                      (0 dots: rolls 2d, take lowest)
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-500 font-sans ml-auto">
                      {baseDots} base {pushDice ? '+1 push ' : ''}{assist ? '+1 assist ' : ''}{devilsBargain ? '+1 bargain' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Position & Effect Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Position</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['Controlled', 'Risky', 'Desperate'] as RollPosition[]).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setPosition(pos)}
                      className={`text-xs py-1.5 rounded border font-medium ${
                        position === pos
                          ? pos === 'Desperate'
                            ? 'bg-red-950/80 border-red-500 text-red-300 font-bold'
                            : pos === 'Risky'
                            ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                            : 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Effect Level</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['Limited', 'Standard', 'Great'] as RollEffect[]).map((eff) => (
                    <button
                      key={eff}
                      type="button"
                      onClick={() => setEffect(eff)}
                      className={`text-xs py-1.5 rounded border font-medium ${
                        effect === eff
                          ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {eff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bonus Modifiers Toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPushDice(!pushDice);
                  if (pushEffect) setPushEffect(false);
                }}
                className={`p-2 rounded-lg border text-xs flex flex-col gap-0.5 text-left transition-all ${
                  pushDice
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Push (+1d)
                </span>
                <span className="text-[10px] text-zinc-500">Costs 2 stress</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPushEffect(!pushEffect);
                  if (pushDice) setPushDice(false);
                }}
                className={`p-2 rounded-lg border text-xs flex flex-col gap-0.5 text-left transition-all ${
                  pushEffect
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> Push (+Effect)
                </span>
                <span className="text-[10px] text-zinc-500">Costs 2 stress</span>
              </button>

              <button
                type="button"
                onClick={() => setAssist(!assist)}
                className={`p-2 rounded-lg border text-xs flex flex-col gap-0.5 text-left transition-all ${
                  assist
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="font-bold flex items-center gap-1">
                  <HandMetal className="w-3.5 h-3.5 text-amber-400" /> Assist (+1d)
                </span>
                <span className="text-[10px] text-zinc-500">Ally takes 1 stress</span>
              </button>

              <button
                type="button"
                onClick={() => setDevilsBargain(!devilsBargain)}
                className={`p-2 rounded-lg border text-xs flex flex-col gap-0.5 text-left transition-all ${
                  devilsBargain
                    ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Devil&apos;s Bargain
                </span>
                <span className="text-[10px] text-zinc-500">+1d for complication</span>
              </button>
            </div>

            {devilsBargain && (
              <input
                type="text"
                value={bargainText}
                onChange={(e) => setBargainText(e.target.value)}
                placeholder="Describe the agreed Devil's Bargain consequence..."
                className="bg-zinc-950 border border-purple-800/80 rounded px-3 py-1.5 text-xs text-purple-200 outline-none"
              />
            )}
          </div>
        ) : (
          /* Resistance Setup */
          <div className="flex flex-col gap-3">
            <label className="text-xs uppercase font-medium text-zinc-400">Resisting Attribute</label>
            <div className="grid grid-cols-3 gap-2">
              {(['insight', 'prowess', 'resolve'] as AttributeName[]).map((attr) => (
                <button
                  key={attr}
                  type="button"
                  onClick={() => {
                    setSelectedAttribute(attr);
                    setResult(null);
                  }}
                  className={`p-3 rounded-lg border text-xs capitalize flex flex-col items-center gap-1 ${
                    selectedAttribute === attr
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span className="text-sm font-semibold">{attr}</span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {(() => {
                      const acts = Object.entries(ACTION_ATTRIBUTES)
                        .filter(([, a]) => a === attr)
                        .map(([act]) => character.action_dots[act as ActionName] || 0);
                      return `${acts.filter((d) => d > 0).length} rating dots`;
                    })()}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-500 italic">
              Resistance negates or reduces incoming harm. You suffer <strong>(6 - highest die)</strong> stress. Critical clears 1 stress!
            </p>
          </div>
        )}

        {/* Roll Trigger Button */}
        <button
          type="button"
          disabled={isRolling}
          onClick={handleRoll}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-black text-base shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Dices className="w-5 h-5" /> {isRolling ? 'Rolling Dice...' : 'ROLL DICE'}
        </button>

        {/* Results Display */}
        {result && (
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-3">
            {/* Dice Cards */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {result.dice.map((val, idx) => {
                const isSelected = val === result.chosenDie;
                return (
                  <div
                    key={idx}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-serif text-2xl font-black border transition-all shadow-md ${
                      isSelected
                        ? 'bg-amber-400 text-black border-amber-300 scale-110 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {val}
                  </div>
                );
              })}
            </div>

            {/* Outcome Badge & Narrative */}
            <div className="flex flex-col items-center gap-1.5 text-center pt-1 border-t border-zinc-800/80">
              <span
                className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider ${getOutcomeBadge(
                  result.outcome
                )}`}
              >
                {result.outcome.replace('_', ' ')}
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-md">{result.narrative}</p>
              {position === 'Desperate' && rollMode === 'action' && (
                <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> +1 Desperate XP marked in {ACTION_ATTRIBUTES[selectedAction]} track!
                </span>
              )}
            </div>

            {/* Apply Ticks to Clock Button */}
            {result.ticks > 0 && clocks.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                <select
                  value={selectedClockId}
                  onChange={(e) => setSelectedClockId(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 outline-none"
                >
                  {clocks.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.current_segments}/{c.max_segments})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleApplyToClock}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow"
                >
                  <Check className="w-3.5 h-3.5" /> Tick Clock (+{result.ticks})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
