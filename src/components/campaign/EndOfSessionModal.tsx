'use client';

import React, { useState } from 'react';
import { Character, Crew } from '@/types/blades';
import { SCOUNDREL_PLAYBOOKS, CREW_PLAYBOOKS } from '@/lib/constants/playbooks';
import { Award, Check, Sparkles, BookOpen, Users, Compass, AlertCircle } from 'lucide-react';

interface EndOfSessionModalProps {
  characters: Character[];
  activeCharacterId?: string;
  crew: Crew;
  onCommitXp: (
    updatedCharacters: Character[],
    updatedCrew: Crew,
    summaryLog: string
  ) => void;
  onClose: () => void;
}

export function EndOfSessionModal({
  characters,
  activeCharacterId,
  crew,
  onCommitXp,
  onClose
}: EndOfSessionModalProps) {
  const [selectedCharId, setSelectedCharId] = useState<string>(
    activeCharacterId || characters[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'character' | 'crew'>('character');

  const currentChar = characters.find((c) => c.id === selectedCharId) || characters[0];
  const scoundrelPlaybook = currentChar
    ? SCOUNDREL_PLAYBOOKS[currentChar.playbook]
    : null;
  const crewPlaybook = CREW_PLAYBOOKS[crew.playbook];

  // Character Questions (0, 1, or 2 XP each)
  const [charQ1, setCharQ1] = useState<number>(1); // Beliefs / drives
  const [charQ2, setCharQ2] = useState<number>(0); // Vice / traumas
  const [charQ3, setCharQ3] = useState<number>(1); // Playbook trigger

  // Allocation of character XP
  const totalCharEarned = charQ1 + charQ2 + charQ3;
  const [allocPlaybook, setAllocPlaybook] = useState<number>(1);
  const [allocInsight, setAllocInsight] = useState<number>(0);
  const [allocProwess, setAllocProwess] = useState<number>(1);
  const [allocResolve, setAllocResolve] = useState<number>(0);

  // Crew Questions (0, 1, or 2 XP each)
  const [crewQ1, setCrewQ1] = useState<number>(2); // Crew playbook trigger
  const [crewQ2, setCrewQ2] = useState<number>(1); // Station / higher tier
  const [crewQ3, setCrewQ3] = useState<number>(0); // Rep / Lair
  const [crewQ4, setCrewQ4] = useState<number>(1); // Crew nature / drives

  const totalCrewEarned = crewQ1 + crewQ2 + crewQ3 + crewQ4;

  const currentAllocated =
    allocPlaybook + allocInsight + allocProwess + allocResolve;
  const allocationRemaining = totalCharEarned - currentAllocated;

  const handleAdjustAlloc = (
    track: 'playbook' | 'insight' | 'prowess' | 'resolve',
    delta: number
  ) => {
    if (delta > 0 && allocationRemaining <= 0) return;

    if (track === 'playbook') {
      const next = Math.max(0, allocPlaybook + delta);
      setAllocPlaybook(next);
    } else if (track === 'insight') {
      const next = Math.max(0, allocInsight + delta);
      setAllocInsight(next);
    } else if (track === 'prowess') {
      const next = Math.max(0, allocProwess + delta);
      setAllocProwess(next);
    } else if (track === 'resolve') {
      const next = Math.max(0, allocResolve + delta);
      setAllocResolve(next);
    }
  };

  const handleFinalize = () => {
    if (!currentChar) return;

    // Build updated character
    const updatedChar: Character = {
      ...currentChar,
      playbook_xp: Math.min(8, currentChar.playbook_xp + allocPlaybook),
      insight_xp: Math.min(6, currentChar.insight_xp + allocInsight),
      prowess_xp: Math.min(6, currentChar.prowess_xp + allocProwess),
      resolve_xp: Math.min(6, currentChar.resolve_xp + allocResolve),
      updated_at: new Date().toISOString()
    };

    const updatedCharacters = characters.map((c) =>
      c.id === updatedChar.id ? updatedChar : c
    );

    // Build updated crew
    const nextCrewXp = Math.min(8, (crew.xp || 0) + totalCrewEarned);
    const updatedCrew: Crew = {
      ...crew,
      xp: nextCrewXp,
      updated_at: new Date().toISOString()
    };

    const summaryLog = `Session XP Awarded: ${currentChar.name} received +${totalCharEarned} XP (Playbook: +${allocPlaybook}, Insight: +${allocInsight}, Prowess: +${allocProwess}, Resolve: +${allocResolve}). Crew received +${totalCrewEarned} XP.`;

    onCommitXp(updatedCharacters, updatedCrew, summaryLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-zinc-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-zinc-100">
                End-of-Session XP Review
              </h3>
              <p className="text-xs text-zinc-400">
                Review XP triggers and advance Scoundrels & Crew (RAW p. 48 & p. 145)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('character')}
                className={`text-xs px-2.5 py-1 rounded transition-all font-semibold flex items-center gap-1 ${
                  activeTab === 'character'
                    ? 'bg-emerald-500 text-black'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" /> Scoundrel XP
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('crew')}
                className={`text-xs px-2.5 py-1 rounded transition-all font-semibold flex items-center gap-1 ${
                  activeTab === 'crew'
                    ? 'bg-emerald-500 text-black'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Crew XP
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

        {/* ----------------- TAB 1: CHARACTER REVIEW ----------------- */}
        {activeTab === 'character' && currentChar && scoundrelPlaybook && (
          <div className="flex flex-col gap-4">
            {/* Scoundrel Selector */}
            {characters.length > 1 && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-xs text-zinc-400">Reviewing Scoundrel:</span>
                <select
                  value={selectedCharId}
                  onChange={(e) => {
                    setSelectedCharId(e.target.value);
                  }}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-200 outline-none"
                >
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.playbook})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                Session Prompts (0, 1, or 2 marks each)
              </span>

              {/* Question 1: Beliefs / Drives */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-200">
                    1. Beliefs, Drives, Heritage, or Background
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Did you express or pursue your character’s heritage ({currentChar.heritage || 'None'}), background ({currentChar.background || 'None'}), or personal agenda?
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {[0, 1, 2].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setCharQ1(pts)}
                      className={`w-7 h-7 rounded text-xs font-bold border transition-all ${
                        charQ1 === pts
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      +{pts}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Vice / Traumas */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-200">
                    2. Vice or Trauma Struggles
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Did you struggle with issues from your vice ({currentChar.vice || 'None'}) or trauma conditions ({currentChar.trauma.join(', ') || 'None'})?
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {[0, 1, 2].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setCharQ2(pts)}
                      className={`w-7 h-7 rounded text-xs font-bold border transition-all ${
                        charQ2 === pts
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      +{pts}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Playbook Specific Style */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-amber-300">
                    3. Playbook Style ({currentChar.playbook})
                  </span>
                  <p className="text-[11px] text-zinc-300 italic">
                    &ldquo;{scoundrelPlaybook.xpTrigger}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {[0, 1, 2].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setCharQ3(pts)}
                      className={`w-7 h-7 rounded text-xs font-bold border transition-all ${
                        charQ3 === pts
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      +{pts}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Allocation Section */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Allocate Earned XP (+{totalCharEarned} Marks)
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    allocationRemaining === 0 ? 'text-zinc-400' : 'text-amber-400'
                  }`}
                >
                  Unallocated: {allocationRemaining} pts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Playbook Track */}
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-200">Playbook XP</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Current: {currentChar.playbook_xp}/8 &rarr;{' '}
                      <strong className="text-emerald-400">
                        {Math.min(8, currentChar.playbook_xp + allocPlaybook)}/8
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjustAlloc('playbook', -1)}
                      className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-bold text-emerald-400 w-4 text-center">
                      +{allocPlaybook}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustAlloc('playbook', 1)}
                      className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Insight Track */}
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-200">Insight XP</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Current: {currentChar.insight_xp}/6 &rarr;{' '}
                      <strong className="text-emerald-400">
                        {Math.min(6, currentChar.insight_xp + allocInsight)}/6
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjustAlloc('insight', -1)}
                      className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-bold text-emerald-400 w-4 text-center">
                      +{allocInsight}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustAlloc('insight', 1)}
                      className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Prowess Track */}
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-200">Prowess XP</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Current: {currentChar.prowess_xp}/6 &rarr;{' '}
                      <strong className="text-emerald-400">
                        {Math.min(6, currentChar.prowess_xp + allocProwess)}/6
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjustAlloc('prowess', -1)}
                      className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-bold text-emerald-400 w-4 text-center">
                      +{allocProwess}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustAlloc('prowess', 1)}
                      className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Resolve Track */}
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-200">Resolve XP</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Current: {currentChar.resolve_xp}/6 &rarr;{' '}
                      <strong className="text-emerald-400">
                        {Math.min(6, currentChar.resolve_xp + allocResolve)}/6
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAdjustAlloc('resolve', -1)}
                      className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-bold text-emerald-400 w-4 text-center">
                      +{allocResolve}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustAlloc('resolve', 1)}
                      className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 2: CREW REVIEW ----------------- */}
        {activeTab === 'crew' && (
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-600/30 text-xs text-amber-200 flex items-center justify-between">
              <span className="font-medium">
                Crew Advancement Track: <strong>{crew.name}</strong> ({crew.playbook})
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {crew.xp || 0} / 8 XP &rarr;{' '}
                {Math.min(8, (crew.xp || 0) + totalCrewEarned)} / 8 XP
              </span>
            </div>

            {/* Crew Questions */}
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                Crew Prompts (RAW p. 145)
              </span>

              {/* Crew Q1 */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-amber-300">
                    1. Crew Type Alignment ({crew.playbook})
                  </span>
                  <p className="text-[11px] text-zinc-300 italic">
                    &ldquo;{crewPlaybook.xpTrigger}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {[0, 1, 2].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setCrewQ1(pts)}
                      className={`w-7 h-7 rounded text-xs font-bold border transition-all ${
                        crewQ1 === pts
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      +{pts}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crew Q2 */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-200">
                    2. Contended with Challenges Above Station
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Did the crew challenge or resist higher-Tier factions or extreme odds?
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {[0, 1, 2].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setCrewQ2(pts)}
                      className={`w-7 h-7 rounded text-xs font-bold border transition-all ${
                        crewQ2 === pts
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      +{pts}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crew Q3 */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-200">
                    3. Bolstered Reputation or Developed Lair
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Did the crew acquire new claims, fortifications, or make its mark on Doskvol?
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {[0, 1, 2].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setCrewQ3(pts)}
                      className={`w-7 h-7 rounded text-xs font-bold border transition-all ${
                        crewQ3 === pts
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      +{pts}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crew Q4 */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-200">
                    4. Expressed Goals, Drives, or Inner Conflicts
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Did the crew express its essential nature or navigate internal frictions?
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {[0, 1, 2].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setCrewQ4(pts)}
                      className={`w-7 h-7 rounded text-xs font-bold border transition-all ${
                        crewQ4 === pts
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      +{pts}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advancement Alert */}
            {(crew.xp || 0) + totalCrewEarned >= 8 && (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center gap-2 text-xs text-amber-200">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Advancement Ready!</strong> This session pushes the crew to 8 XP. The crew can choose 1 Special Ability or 2 Upgrades on the Crew Sheet!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer / Commit Button */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleFinalize}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-serif font-black text-sm shadow-xl transition-all"
          >
            <Check className="w-4 h-4" /> Finalize Session XP
          </button>
        </div>
      </div>
    </div>
  );
}
