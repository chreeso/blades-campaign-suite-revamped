'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Character,
  Clock,
  ActionName,
  AttributeName,
  RollPosition,
  RollEffect,
  RollResult,
  SetupBonus,
  GroupActionResult
} from '@/types/blades';
import {
  resolveActionRoll,
  resolveResistanceRoll,
  resolveGroupActionRoll
} from '@/lib/roller';
import { playCritChime, playClockTickSound, playClockCompleteSound } from '@/lib/audio';
import {
  Dices,
  Flame,
  HandMetal,
  Sparkles,
  Check,
  Zap,
  Users,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DiceRollerProps {
  character: Character;
  allCharacters?: Character[];
  clocks: Clock[];
  defaultAction?: ActionName;
  defaultAttribute?: AttributeName;
  initialMode?: 'action' | 'resistance' | 'group';
  initialPosition?: RollPosition;
  initialNarrative?: string;
  activeSetupBonus?: SetupBonus | null;
  onConsumeSetupBonus?: () => void;
  onRegisterSetupBonus?: (bonus: SetupBonus) => void;
  onUpdateCharacter: (updated: Character) => void;
  onUpdateOtherCharacter?: (characterId: string, updates: Partial<Character>) => void;
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
  allCharacters = [],
  clocks,
  defaultAction = 'skirmish',
  defaultAttribute = 'prowess',
  initialMode = 'action',
  initialPosition,
  initialNarrative,
  activeSetupBonus,
  onConsumeSetupBonus,
  onRegisterSetupBonus,
  onUpdateCharacter,
  onUpdateOtherCharacter,
  onUpdateClock,
  onClose
}: DiceRollerProps) {
  const [rollMode, setRollMode] = useState<'action' | 'resistance' | 'group'>(initialMode);
  const [selectedAction, setSelectedAction] = useState<ActionName>(defaultAction);
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeName>(defaultAttribute);

  // Modifiers
  const [position, setPosition] = useState<RollPosition>(initialPosition || 'Risky');
  const [effect, setEffect] = useState<RollEffect>('Standard');
  const [pushDice, setPushDice] = useState(false);
  const [pushEffect, setPushEffect] = useState(false);
  const [assist, setAssist] = useState(false);
  const [assistingCharacterId, setAssistingCharacterId] = useState<string>('');
  const [devilsBargain, setDevilsBargain] = useState(false);
  const [bargainText, setBargainText] = useState('');
  const [isSetupAction, setIsSetupAction] = useState(false);

  // Resistance: Protect Teammate
  const [isProtectingTeammate, setIsProtectingTeammate] = useState(false);
  const [protectedTeammateId, setProtectedTeammateId] = useState<string>('');

  // Group Action
  const availableTeammates = allCharacters.filter((c) => c.id !== character.id);
  const [selectedTeammateIds, setSelectedTeammateIds] = useState<string[]>(
    availableTeammates.map((c) => c.id)
  );

  // Results
  const [result, setResult] = useState<RollResult | null>(null);
  const [groupResult, setGroupResult] = useState<GroupActionResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedClockId, setSelectedClockId] = useState<string>(clocks[0]?.id || '');
  const [setupRegistered, setSetupRegistered] = useState(false);

  // Close on Escape (unless roll animation is active)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isRolling) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRolling, onClose]);

  // Outside click handling (guarded against accidental drag-outs)
  const backdropMouseDownRef = useRef(false);

  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    backdropMouseDownRef.current = e.target === e.currentTarget;
  };

  const handleBackdropMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (backdropMouseDownRef.current && e.target === e.currentTarget && !isRolling) {
      onClose();
    }
    backdropMouseDownRef.current = false;
  };

  // Calculate Base Pool for Action / Resistance
  const baseDots =
    rollMode === 'action' || rollMode === 'group'
      ? character.action_dots[selectedAction] || 0
      : (() => {
          const attrActions = Object.entries(ACTION_ATTRIBUTES)
            .filter(([, attr]) => attr === selectedAttribute)
            .map(([act]) => character.action_dots[act as ActionName] || 0);
          return attrActions.filter((dots) => dots > 0).length;
        })();

  const totalDice = Math.max(
    0,
    baseDots + (pushDice ? 1 : 0) + (assist ? 1 : 0) + (devilsBargain ? 1 : 0)
  );

  const handleApplySetupBonus = () => {
    if (!activeSetupBonus) return;
    if (activeSetupBonus.bonusType === 'position') {
      if (position === 'Desperate') setPosition('Risky');
      else if (position === 'Risky') setPosition('Controlled');
    } else {
      if (effect === 'Limited') setEffect('Standard');
      else if (effect === 'Standard') setEffect('Great');
    }
    if (onConsumeSetupBonus) onConsumeSetupBonus();
  };

  const handleRoll = () => {
    setIsRolling(true);

    setTimeout(() => {
      if (rollMode === 'group') {
        // Resolve Group Action
        const leaderData = {
          id: character.id,
          name: character.name,
          dots: character.action_dots[selectedAction] || 0
        };
        const membersData = selectedTeammateIds.map((id) => {
          const m = allCharacters.find((c) => c.id === id);
          return {
            id,
            name: m ? m.name : 'Teammate',
            dots: m ? m.action_dots[selectedAction] || 0 : 0
          };
        });

        const gRes = resolveGroupActionRoll(leaderData, membersData, position, effect);
        setGroupResult(gRes);
        if (gRes.isCritical) {
          playCritChime();
        }

        // Apply leader stress
        if (gRes.leaderStressCost > 0) {
          const newStress = Math.min(9, character.stress + gRes.leaderStressCost);
          onUpdateCharacter({ ...character, stress: newStress });
        }

        setIsRolling(false);
        return;
      }

      let rollRes: RollResult;
      const effectiveEffect = pushEffect && effect !== 'Great' ? 'Great' : effect;

      if (rollMode === 'action') {
        rollRes = resolveActionRoll(totalDice, position, effectiveEffect);

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

        // Assist stress cost to assisting ally
        if (assist && assistingCharacterId && onUpdateOtherCharacter) {
          const assistingChar = allCharacters.find((c) => c.id === assistingCharacterId);
          if (assistingChar) {
            onUpdateOtherCharacter(assistingCharacterId, {
              stress: Math.min(9, assistingChar.stress + 1)
            });
          }
        }

        onUpdateCharacter(updatedChar);
      } else {
        // Resistance roll
        rollRes = resolveResistanceRoll(baseDots);
        if (rollRes.stressCost !== undefined) {
          const newStress = Math.max(0, Math.min(9, character.stress + rollRes.stressCost));
          onUpdateCharacter({ ...character, stress: newStress });
        }

        if (isProtectingTeammate) {
          const protectedChar = allCharacters.find((c) => c.id === protectedTeammateId);
          const protName = protectedChar ? protectedChar.name : 'Ally';
          rollRes.narrative = `PROTECTED ${protName.toUpperCase()}: ${character.name} stepped into danger to absorb the consequence, suffering ${rollRes.stressCost} stress.`;
        }
      }

      setResult(rollRes);
      if (rollRes.isCritical) {
        playCritChime();
      }
      setIsRolling(false);
    }, 250);
  };

  const handleRegisterSetupAdvantage = (bonusType: 'effect' | 'position') => {
    if (!onRegisterSetupBonus) return;
    onRegisterSetupBonus({
      id: `setup_${Date.now()}`,
      sourceCharacterName: character.name,
      bonusType,
      detail: `${character.name} succeeded with a setup ${selectedAction} maneuver`,
      createdAt: new Date().toISOString()
    });
    setSetupRegistered(true);
  };

  const handleApplyToClock = (ticksToApply: number) => {
    if (ticksToApply <= 0 || !selectedClockId) return;
    const targetClock = clocks.find((c) => c.id === selectedClockId);
    if (!targetClock) return;

    const newSegments = Math.min(targetClock.max_segments, targetClock.current_segments + ticksToApply);
    if (newSegments >= targetClock.max_segments) {
      playClockCompleteSound();
    } else {
      playClockTickSound();
    }

    onUpdateClock({
      ...targetClock,
      current_segments: newSegments,
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

  const toggleTeammateSelection = (id: string) => {
    if (selectedTeammateIds.includes(id)) {
      setSelectedTeammateIds(selectedTeammateIds.filter((tid) => tid !== id));
    } else {
      setSelectedTeammateIds([...selectedTeammateIds, id]);
    }
  };

  return (
    <div
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
      className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50"
    >
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-zinc-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-zinc-100">
                {rollMode === 'action'
                  ? 'Action Roll'
                  : rollMode === 'resistance'
                  ? isProtectingTeammate
                    ? 'Protect Teammate'
                    : 'Resistance Roll'
                  : 'Lead Group Action (Teamwork)'}
              </h3>
              <p className="text-xs text-zinc-400">
                {rollMode === 'group' ? 'Leader: ' : 'Rolling for '}
                <strong className="text-amber-300">{character.name}</strong> ({character.playbook})
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
                  setGroupResult(null);
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
                  setGroupResult(null);
                }}
                className={`text-xs px-2.5 py-1 rounded transition-all font-semibold ${
                  rollMode === 'resistance' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Resist
              </button>
              <button
                type="button"
                onClick={() => {
                  setRollMode('group');
                  setResult(null);
                  setGroupResult(null);
                }}
                className={`text-xs px-2.5 py-1 rounded transition-all font-semibold flex items-center gap-1 ${
                  rollMode === 'group' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Users className="w-3 h-3" /> Group
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

        {/* Active Setup Bonus Banner */}
        {activeSetupBonus && rollMode === 'action' && (
          <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/50 flex items-center justify-between text-xs text-cyan-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Setup Advantage Ready:</strong> +1 {activeSetupBonus.bonusType.toUpperCase()} from{' '}
                {activeSetupBonus.sourceCharacterName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleApplySetupBonus}
              className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[11px] shadow"
            >
              Claim Bonus
            </button>
          </div>
        )}

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

        {/* -------------------- MODE 1: ACTION ROLL -------------------- */}
        {rollMode === 'action' && (
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
                      {baseDots} base {pushDice ? '+1 push ' : ''}
                      {assist ? '+1 assist ' : ''}
                      {devilsBargain ? '+1 bargain' : ''}
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

            {/* Modifiers Toggles */}
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

            {/* Assist Selector */}
            {assist && availableTeammates.length > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-600/30 flex items-center justify-between text-xs text-amber-200">
                <span className="flex items-center gap-1.5 font-medium">
                  <HandMetal className="w-3.5 h-3.5 text-amber-400" /> Which ally is assisting?
                </span>
                <select
                  value={assistingCharacterId}
                  onChange={(e) => setAssistingCharacterId(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none"
                >
                  <option value="">Select Teammate (Takes 1 stress)</option>
                  {availableTeammates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.playbook}) [Stress: {c.stress}/9]
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Setup Action Checkbox */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={isSetupAction}
                  onChange={(e) => setIsSetupAction(e.target.checked)}
                  className="rounded border-zinc-700 text-cyan-500 focus:ring-0"
                />
                <span className="font-bold flex items-center gap-1 text-cyan-300">
                  <Layers className="w-3.5 h-3.5" /> Teamwork: Setup Action
                </span>
                <span className="text-zinc-500 text-[11px]">
                  (On success, pass +1 Effect or Position to next ally)
                </span>
              </label>
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
        )}

        {/* -------------------- MODE 2: RESISTANCE / PROTECT -------------------- */}
        {rollMode === 'resistance' && (
          <div className="flex flex-col gap-3">
            {/* Protect Teammate Option */}
            {availableTeammates.length > 0 && (
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-200">
                  <input
                    type="checkbox"
                    checked={isProtectingTeammate}
                    onChange={(e) => setIsProtectingTeammate(e.target.checked)}
                    className="rounded border-zinc-700 text-amber-500 focus:ring-0"
                  />
                  <span className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Shield className="w-4 h-4 text-amber-400" /> Protect a Teammate (Teamwork)
                  </span>
                  <span className="text-zinc-500 text-[11px] ml-auto">
                    Take the consequence on yourself
                  </span>
                </label>

                {isProtectingTeammate && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-zinc-400">Protecting:</span>
                    <select
                      value={protectedTeammateId}
                      onChange={(e) => setProtectedTeammateId(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none"
                    >
                      <option value="">Select ally you are stepping in front of</option>
                      {availableTeammates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.playbook})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

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
              Resistance negates or reduces incoming harm. You suffer <strong>(6 - highest die)</strong>{' '}
              stress. Critical clears 1 stress!
            </p>
          </div>
        )}

        {/* -------------------- MODE 3: GROUP ACTION (TEAMWORK) -------------------- */}
        {rollMode === 'group' && (
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-600/30 text-xs text-amber-200 leading-relaxed">
              <strong>Group Action (RAW p. 134):</strong> The team coordinates doing the same action.
              Each member rolls their rating. The group takes the <em>single best result</em>. The leader
              suffers <strong>1 stress for each member who rolls a 1–3</strong>.
            </div>

            {/* Action Rating */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Coordinated Action</label>
                <select
                  value={selectedAction}
                  onChange={(e) => {
                    setSelectedAction(e.target.value as ActionName);
                    setGroupResult(null);
                  }}
                  className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none capitalize"
                >
                  {Object.keys(ACTION_ATTRIBUTES).map((act) => (
                    <option key={act} value={act}>
                      {act} (Leader has {character.action_dots[act as ActionName] || 0} dots)
                    </option>
                  ))}
                </select>
              </div>

              {/* Position & Effect */}
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Position / Effect</label>
                <div className="flex items-center gap-2">
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as RollPosition)}
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-100 outline-none"
                  >
                    <option value="Controlled">Controlled</option>
                    <option value="Risky">Risky</option>
                    <option value="Desperate">Desperate</option>
                  </select>
                  <select
                    value={effect}
                    onChange={(e) => setEffect(e.target.value as RollEffect)}
                    className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-100 outline-none"
                  >
                    <option value="Limited">Limited</option>
                    <option value="Standard">Standard</option>
                    <option value="Great">Great</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Teammate Participants Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase font-medium text-zinc-400">
                  Participating Crew Members
                </label>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {selectedTeammateIds.length + 1} scoundrels rolling
                </span>
              </div>

              <div className="space-y-1.5">
                {/* Leader Card (Always active) */}
                <div className="p-2.5 rounded-lg bg-zinc-950 border border-amber-500/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px] uppercase">
                      Leader
                    </span>
                    <span className="text-xs font-bold text-zinc-100">{character.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {character.action_dots[selectedAction] || 0}d pool
                  </span>
                </div>

                {/* Available Teammates */}
                {availableTeammates.map((teammate) => {
                  const isChecked = selectedTeammateIds.includes(teammate.id);
                  const dots = teammate.action_dots[selectedAction] || 0;
                  return (
                    <label
                      key={teammate.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-zinc-950 border-zinc-700 text-zinc-100'
                          : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTeammateSelection(teammate.id)}
                          className="rounded border-zinc-700 text-amber-500 focus:ring-0"
                        />
                        <span className="text-xs font-medium">{teammate.name}</span>
                        <span className="text-[10px] text-zinc-500">({teammate.playbook})</span>
                      </div>
                      <span className="text-xs font-mono text-zinc-400">
                        {dots > 0 ? `${dots}d pool` : '0d (rolls 2d min)'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Roll Trigger Button */}
        <button
          type="button"
          disabled={isRolling}
          onClick={handleRoll}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-serif font-black text-base shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Dices className="w-5 h-5" />
          {isRolling
            ? 'Rolling Dice...'
            : rollMode === 'group'
            ? 'ROLL GROUP ACTION'
            : 'ROLL DICE'}
        </button>

        {/* -------------------- ACTION / RESISTANCE RESULTS -------------------- */}
        {result && rollMode !== 'group' && (
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
                  <Sparkles className="w-3.5 h-3.5" /> +1 Desperate XP marked in{' '}
                  {ACTION_ATTRIBUTES[selectedAction]} track!
                </span>
              )}

              {/* Setup Action Bonus Trigger */}
              {isSetupAction &&
                result.outcome !== 'bad_outcome' &&
                !setupRegistered &&
                onRegisterSetupBonus && (
                  <div className="mt-2 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 flex flex-col items-center gap-2">
                    <span className="text-xs text-cyan-200 font-semibold">
                      ✨ Setup successful! Grant advantage to the next teammate:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRegisterSetupAdvantage('effect')}
                        className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
                      >
                        Grant +1 Effect
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRegisterSetupAdvantage('position')}
                        className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
                      >
                        Grant Improved Position
                      </button>
                    </div>
                  </div>
                )}

              {setupRegistered && (
                <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Setup Advantage active for next teammate!
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
                  onClick={() => handleApplyToClock(result.ticks)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow"
                >
                  <Check className="w-3.5 h-3.5" /> Tick Clock (+{result.ticks})
                </button>
              </div>
            )}
          </div>
        )}

        {/* -------------------- GROUP ACTION RESULTS -------------------- */}
        {groupResult && rollMode === 'group' && (
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-4">
            {/* Header / Overall Group Outcome */}
            <div className="flex flex-col items-center gap-1.5 text-center border-b border-zinc-800 pb-3">
              <span
                className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider ${getOutcomeBadge(
                  groupResult.bestOutcome
                )}`}
              >
                GROUP {groupResult.bestOutcome.replace('_', ' ')}
              </span>
              <p className="text-xs text-zinc-300 max-w-md">{groupResult.narrative}</p>

              {/* Leader Stress Tally */}
              <div className="mt-1 flex items-center gap-2 text-xs font-mono">
                <span className="text-zinc-400">Leader Stress Incurred:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded ${
                    groupResult.leaderStressCost > 0
                      ? 'bg-red-950 text-red-400 border border-red-700'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                  }`}
                >
                  +{groupResult.leaderStressCost} Stress
                </span>
              </div>
            </div>

            {/* Individual Participant Breakdown */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold">
                Participant Rolls Breakdown
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {groupResult.participantRolls.map((pr) => (
                  <div
                    key={pr.characterId}
                    className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${
                      pr.failed
                        ? 'bg-red-950/20 border-red-900/60'
                        : 'bg-zinc-900/80 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-200">{pr.characterName}</span>
                        {pr.isLeader && (
                          <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                            Lead
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${getOutcomeBadge(
                          pr.outcome
                        )}`}
                      >
                        {pr.outcome.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 font-mono text-xs">
                        {pr.dice.map((d, i) => (
                          <span
                            key={i}
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                              d === pr.chosenDie
                                ? 'bg-amber-400 text-black font-extrabold'
                                : 'bg-zinc-950 text-zinc-400'
                            }`}
                          >
                            {d}
                          </span>
                        ))}
                      </div>

                      {pr.failed && !pr.isLeader && (
                        <span className="text-[10px] text-red-400 font-medium">
                          Rolled 1–3 (+1 stress to leader)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Ticks to Clock */}
            {groupResult.overallTicks > 0 && clocks.length > 0 && (
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
                  onClick={() => handleApplyToClock(groupResult.overallTicks)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow"
                >
                  <Check className="w-3.5 h-3.5" /> Tick Clock (+{groupResult.overallTicks})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
