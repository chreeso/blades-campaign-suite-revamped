'use client';

import React, { useState } from 'react';
import {
  Character,
  Crew,
  Clock,
  Faction,
  JournalEntry,
  Transaction,
  ActionName,
  AttributeName
} from '@/types/blades';
import {
  ScoreScale,
  calculatePayoff,
  calculateHeatRollover,
  rollEntanglement,
  resolveViceRoll,
  resolveReduceHeatRoll,
  EntanglementRollResult,
  ViceRollResult
} from '@/lib/downtime';
import {
  Hourglass,
  Coins,
  Flame,
  AlertOctagon,
  Sparkles,
  HeartPulse,
  Award,
  Check,
  ChevronRight,
  ChevronLeft,
  Dices,
  RefreshCw,
  Skull
} from 'lucide-react';

interface DowntimeWizardProps {
  campaignId: string;
  crew: Crew;
  character: Character;
  factions: Faction[];
  clocks: Clock[];
  onCommitDowntime: (updates: {
    crew: Crew;
    character: Character;
    clocks: Clock[];
    newJournalEntry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>;
    newTransactions: Omit<Transaction, 'id' | 'created_at'>[];
  }) => void;
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

export function DowntimeWizard({
  campaignId,
  crew,
  character,
  factions,
  clocks,
  onCommitDowntime,
  onClose
}: DowntimeWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // STEP 1: Payoff State
  const [scoreTitle, setScoreTitle] = useState('Heist at the North Docks');
  const [scoreScale, setScoreScale] = useState<ScoreScale>('standard');
  const [targetFactionId, setTargetFactionId] = useState<string>(factions[0]?.id || '');
  const targetFaction = factions.find((f) => f.id === targetFactionId) || factions[0];
  const targetTier = targetFaction ? targetFaction.tier : 2;
  const [tithe, setTithe] = useState(0);

  const payoff = calculatePayoff(crew.tier, targetTier, scoreScale, undefined, tithe);
  const [vaultDeposit, setVaultDeposit] = useState(
    Math.min(payoff.netCoin, crew.vault_capacity - crew.coin_vault)
  );
  const remainingCoin = Math.max(0, payoff.netCoin - vaultDeposit);

  // STEP 2: Heat State
  const [baseHeat, setBaseHeat] = useState<0 | 2 | 4 | 6>(2);
  const [anyoneKilled, setAnyoneKilled] = useState(false);
  const [districtAlert, setDistrictAlert] = useState(0);

  const heatCalc = calculateHeatRollover(
    crew.heat,
    crew.wanted_level,
    baseHeat,
    anyoneKilled,
    districtAlert
  );

  // STEP 3: Entanglements State
  const [entanglementResult, setEntanglementResult] = useState<EntanglementRollResult | null>(null);

  // STEP 4: Downtime Activities State
  const maxFreeActivities = crew.hold === 'Weak' ? 1 : 2;
  const [activitiesUsed, setActivitiesUsed] = useState(0);
  const [activitiesLog, setActivitiesLog] = useState<string[]>([]);

  // Mutated states to commit
  const [workingCrew, setWorkingCrew] = useState<Crew>({ ...crew });
  const [workingChar, setWorkingChar] = useState<Character>({ ...character });
  const [workingClocks, setWorkingClocks] = useState<Clock[]>([...clocks]);

  // Activity 1: Vice
  const [viceResult, setViceResult] = useState<ViceRollResult | null>(null);
  const [overindulgenceChoice, setOverindulgenceChoice] = useState<string | null>(null);

  // Activity 2: Reduce Heat
  const [reduceHeatRoll, setReduceHeatRoll] = useState<{ dice: number[]; heatCleared: number } | null>(null);

  // Calculate lowest attribute dots for Vice roll
  const getLowestAttrDots = () => {
    const attrCounts: Record<AttributeName, number> = { insight: 0, prowess: 0, resolve: 0 };
    Object.entries(ACTION_ATTRIBUTES).forEach(([act, attr]) => {
      if ((character.action_dots[act as ActionName] || 0) > 0) {
        attrCounts[attr] += 1;
      }
    });
    return Math.min(...Object.values(attrCounts));
  };

  const handleRollEntanglement = () => {
    const res = rollEntanglement(heatCalc.newWantedLevel);
    setEntanglementResult(res);
  };

  const handleIndulgeVice = () => {
    const lowestDots = getLowestAttrDots();
    const res = resolveViceRoll(lowestDots, workingChar.stress);
    setViceResult(res);
    setWorkingChar((prev) => ({ ...prev, stress: res.newStress }));
    setActivitiesUsed((prev) => prev + 1);
    setActivitiesLog((prev) => [
      ...prev,
      `Indulged Vice (${character.vice}): cleared ${res.clearedStress} stress${
        res.overindulged ? ' [OVERINDULGED]' : ''
      }`
    ]);
  };

  const handleSelectOverindulgence = (choice: string) => {
    setOverindulgenceChoice(choice);
    if (choice === 'Attract Trouble' || choice === 'Brag') {
      setWorkingCrew((prev) => ({ ...prev, heat: Math.min(9, prev.heat + 2) }));
    }
  };

  const handleReduceHeat = () => {
    const dice = character.action_dots['consort'] || character.action_dots['sway'] || 1;
    const res = resolveReduceHeatRoll(dice);
    setReduceHeatRoll({ dice: res.dice, heatCleared: res.heatCleared });
    setWorkingCrew((prev) => ({
      ...prev,
      heat: Math.max(0, prev.heat - res.heatCleared)
    }));
    setActivitiesUsed((prev) => prev + 1);
    setActivitiesLog((prev) => [
      ...prev,
      `Reduced Heat: cleared ${res.heatCleared} heat with Consort/Sway`
    ]);
  };

  const handleTrainXP = (track: 'insight_xp' | 'prowess_xp' | 'resolve_xp' | 'playbook_xp') => {
    const max = track === 'playbook_xp' ? 8 : 6;
    setWorkingChar((prev) => ({
      ...prev,
      [track]: Math.min(max, prev[track] + 1)
    }));
    setActivitiesUsed((prev) => prev + 1);
    setActivitiesLog((prev) => [...prev, `Trained: +1 XP marked in ${track.replace('_', ' ')}`]);
  };

  const handleHealClock = () => {
    // Healing clock: advance by 2 segments
    setWorkingClocks((prev) =>
      prev.map((c) =>
        c.name.toLowerCase().includes('heal') || c.clock_type === 'project'
          ? { ...c, current_segments: Math.min(c.max_segments, c.current_segments + 2) }
          : c
      )
    );
    setActivitiesUsed((prev) => prev + 1);
    setActivitiesLog((prev) => [...prev, `Recovery: Advanced healing / recovery clock (+2 ticks)`]);
  };

  // STEP 5: Final Commit
  const handleFinalCommit = () => {
    const finalCrew: Crew = {
      ...workingCrew,
      coin_vault: Math.min(crew.vault_capacity, crew.coin_vault + vaultDeposit),
      rep: Math.min(12, crew.rep + payoff.rep),
      heat: heatCalc.newHeat,
      wanted_level: heatCalc.newWantedLevel,
      updated_at: new Date().toISOString()
    };

    const finalChar: Character = {
      ...workingChar,
      coin: Math.min(4, character.coin + remainingCoin),
      updated_at: new Date().toISOString()
    };

    const journalContent = `SCORE: ${scoreTitle}
Scale: ${scoreScale.toUpperCase()} | Target: ${targetFaction?.name || 'Unknown'} (Tier ${targetTier})

1. PAYOFF: +${payoff.coin} Coin (${vaultDeposit} to Crew Vault, ${remainingCoin} to Purse), +${payoff.rep} Rep (Tithe: ${tithe} Coin).
2. HEAT: +${heatCalc.totalAddedHeat} Heat (Base ${baseHeat}, Dead Bodies: ${anyoneKilled ? '+2' : '0'}). New Heat: ${heatCalc.newHeat}/9, Wanted: ${heatCalc.newWantedLevel}/4.
3. ENTANGLEMENT: ${entanglementResult?.entanglement.name || 'None rolled'}.
4. DOWNTIME ACTIVITIES:
${activitiesLog.map((log) => `  - ${log}`).join('\n')}`;

    const newJournal: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'> = {
      campaign_id: campaignId,
      author_id: 'current_user',
      title: `Downtime: ${scoreTitle}`,
      content: journalContent,
      entry_type: 'score_log',
      visibility: 'campaign_public'
    };

    const newTransactions: Omit<Transaction, 'id' | 'created_at'>[] = [
      {
        campaign_id: campaignId,
        crew_id: crew.id,
        amount: vaultDeposit,
        currency_target: 'crew_vault',
        reason: `Score Payoff: ${scoreTitle} (Vault deposit)`
      },
      {
        campaign_id: campaignId,
        character_id: character.id,
        amount: remainingCoin,
        currency_target: 'purse',
        reason: `Score Payoff: ${scoreTitle} (Purse payout)`
      }
    ];

    onCommitDowntime({
      crew: finalCrew,
      character: finalChar,
      clocks: workingClocks,
      newJournalEntry: newJournal,
      newTransactions
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-zinc-100 max-h-[92vh] overflow-y-auto">
        {/* Wizard Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Hourglass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-zinc-100">Downtime Phase Wizard</h2>
              <p className="text-xs text-zinc-400">
                Resolving score for <strong className="text-amber-300">{crew.name}</strong> ({crew.playbook})
              </p>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold">
            {[1, 2, 3, 4, 5].map((step) => (
              <span
                key={step}
                className={`w-6 h-6 rounded-full flex items-center justify-center border text-[11px] ${
                  currentStep === step
                    ? 'bg-amber-500 text-black border-amber-400 font-bold'
                    : currentStep > step
                    ? 'bg-zinc-800 border-emerald-500 text-emerald-400'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                }`}
              >
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* STEP 1: Payoff & Faction Rep */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Coins className="w-4 h-4" /> 1. Score Payoff & Street Renown
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Score Objective / Title</label>
              <input
                type="text"
                value={scoreTitle}
                onChange={(e) => setScoreTitle(e.target.value)}
                placeholder="e.g. Heist at the North Docks, Sabotage Sparkwright Forge..."
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Score Scale</label>
                <select
                  value={scoreScale}
                  onChange={(e) => setScoreScale(e.target.value as ScoreScale)}
                  className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                >
                  <option value="minor">Minor (2 Coin)</option>
                  <option value="standard">Standard (6 Coin)</option>
                  <option value="major">Major (8 Coin)</option>
                  <option value="spectacular">Spectacular (10 Coin)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Target Faction</label>
                <select
                  value={targetFactionId}
                  onChange={(e) => setTargetFactionId(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                >
                  {factions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (Tier {f.tier})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Tithe / Cut (Coin)</label>
                <input
                  type="number"
                  min={0}
                  value={tithe}
                  onChange={(e) => setTithe(Math.max(0, Number(e.target.value)))}
                  className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Target Tier: <strong>Tier {targetTier}</strong> vs Crew Tier: <strong>Tier {crew.tier}</strong></span>
                <span className="font-bold text-amber-400 font-mono">+{payoff.rep} Rep Earned</span>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-sm">
                <span className="font-bold text-zinc-200">Net Score Profit:</span>
                <span className="font-mono font-black text-amber-400 text-lg">+{payoff.netCoin} Coin</span>
              </div>

              {/* Fund Split Controls */}
              <div className="flex items-center gap-3 pt-1 border-t border-zinc-800/80 text-xs">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-zinc-400">Crew Vault Deposit (Capacity {crew.coin_vault}/{crew.vault_capacity}):</span>
                  <input
                    type="range"
                    min={0}
                    max={Math.min(payoff.netCoin, crew.vault_capacity - crew.coin_vault)}
                    value={vaultDeposit}
                    onChange={(e) => setVaultDeposit(Number(e.target.value))}
                    className="accent-amber-400"
                  />
                  <span className="font-mono font-semibold text-amber-300">{vaultDeposit} Coin to Vault</span>
                </div>

                <div className="w-px h-10 bg-zinc-800" />

                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-zinc-400">Purse Payout to {character.name}:</span>
                  <span className="font-mono font-bold text-emerald-400 text-base">+{remainingCoin} Coin</span>
                  <span className="text-[10px] text-zinc-500 italic">(Purse max is 4 Coin)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Heat & Wanted Level Progression */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4" /> 2. Heat Accumulation & Law Enforcement
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: 0, label: '0 Heat', desc: 'Silent / Phantom infiltration' },
                { val: 2, label: '2 Heat', desc: 'Standard / Contained job' },
                { val: 4, label: '4 Heat', desc: 'Loud / Alarms & Chaos' },
                { val: 6, label: '6 Heat', desc: 'Catastrophic disaster' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setBaseHeat(opt.val as 0 | 2 | 4 | 6)}
                  className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                    baseHeat === opt.val
                      ? 'bg-red-950/80 border-red-500 text-red-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="font-bold text-sm text-red-400">{opt.label}</span>
                  <span className="text-[11px] text-zinc-500 leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-200">
                  <input
                    type="checkbox"
                    checked={anyoneKilled}
                    onChange={(e) => setAnyoneKilled(e.target.checked)}
                    className="rounded accent-red-500 w-4 h-4"
                  />
                  <span className="font-semibold flex items-center gap-1.5 text-red-300">
                    <Skull className="w-4 h-4 text-red-400" />
                    Dead bodies left (+2 Heat)
                  </span>
                </label>
                <span className="text-[10px] text-zinc-500 italic">Death bells rung</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs">
                <span className="text-zinc-400">District Alert Modifier:</span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDistrictAlert(lvl)}
                      className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        districtAlert === lvl
                          ? 'bg-red-950 border border-red-500 text-red-300'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
                      }`}
                    >
                      +{lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Heat & Wanted Level Calculation Display */}
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  Current Heat: <strong>{crew.heat}/9</strong> + Added Heat: <strong>+{heatCalc.totalAddedHeat}</strong>
                </span>
                <span className="font-mono font-bold text-red-400">
                  New Heat: {heatCalc.newHeat}/9 | Wanted Level: {heatCalc.newWantedLevel}/4
                </span>
              </div>

              {heatCalc.wantedLevelRolledOver && (
                <div className="p-2.5 rounded bg-red-950/70 border border-red-700 flex items-center gap-2 text-xs text-red-200 font-semibold">
                  <AlertOctagon className="w-4 h-4 text-red-400 flex-shrink-0" />
                  CRITICAL: Heat exceeded 9! Wanted Level increased from {crew.wanted_level} to {heatCalc.newWantedLevel}!
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Entanglements Fortune Roll */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4" /> 3. Underworld Entanglements
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Every score creates ripples in Doskvol&apos;s shadowy ecosystem. Roll dice equal to the crew&apos;s Wanted Level (<strong>{heatCalc.newWantedLevel}d</strong>) to determine complications.
            </p>

            <button
              type="button"
              onClick={handleRollEntanglement}
              className="py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow flex items-center justify-center gap-2"
            >
              <Dices className="w-5 h-5" /> Roll Entanglements ({heatCalc.newWantedLevel === 0 ? '2d take lowest' : `${heatCalc.newWantedLevel}d`})
            </button>

            {entanglementResult && (
              <div className="p-4 bg-zinc-950 rounded-xl border border-purple-800 flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-bold text-sm text-purple-300">
                    Result [{entanglementResult.chosenDie}] — {entanglementResult.entanglement.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-200">
                    Bracket {entanglementResult.bracket}
                  </span>
                </div>
                <p className="text-xs text-zinc-300">{entanglementResult.entanglement.description}</p>
                <div className="mt-1 p-2 rounded bg-purple-950/40 border border-purple-900/60 text-xs text-purple-200">
                  <strong>Mechanical Effect:</strong> {entanglementResult.entanglement.mechanicalEffect}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Downtime Activities Hub */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> 4. Downtime Activities Hub
              </div>
              <span className="text-xs font-mono font-bold text-zinc-300">
                Activities: [{activitiesUsed} / {maxFreeActivities} free]
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Activity 1: Indulge Vice */}
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-2">
                <div>
                  <span className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Indulge Vice ({character.vice})
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Clear stress = highest die of lowest attribute pool ({getLowestAttrDots()}d). Rolling higher than current stress ({workingChar.stress}) causes Overindulgence!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleIndulgeVice}
                  className="py-1.5 px-3 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-600/50 text-amber-300 text-xs font-semibold"
                >
                  Roll Vice
                </button>

                {viceResult && (
                  <div className="mt-1 text-xs text-zinc-300 flex flex-col gap-1">
                    <span>Cleared <strong>{viceResult.clearedStress}</strong> stress! New Stress: <strong>{viceResult.newStress}/9</strong></span>
                    {viceResult.overindulged && (
                      <div className="p-2 rounded bg-red-950/60 border border-red-800 text-[11px] text-red-300">
                        <strong>OVERINDULGED!</strong> Select consequence:
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          {['Attract Trouble', 'Brag', 'Lost', 'Tapped'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => handleSelectOverindulgence(c)}
                              className={`py-1 px-1.5 rounded border text-[10px] ${
                                overindulgenceChoice === c
                                  ? 'bg-red-800 text-white font-bold'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Activity 2: Recovery / Healing */}
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-2">
                <div>
                  <span className="font-bold text-xs text-red-400 flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5" /> Recover (Healing Clock)
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Work with a physicker to treat wounds and advance recovery projects (+2 segments).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleHealClock}
                  className="py-1.5 px-3 rounded bg-red-950/40 hover:bg-red-900/50 border border-red-800 text-red-300 text-xs font-semibold"
                >
                  Advance Healing Clock (+2)
                </button>
              </div>

              {/* Activity 3: Reduce Heat */}
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-2">
                <div>
                  <span className="font-bold text-xs text-blue-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Reduce Heat
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Consort with ward officials or spread disinformation to lower crew Heat.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReduceHeat}
                  className="py-1.5 px-3 rounded bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800 text-blue-300 text-xs font-semibold"
                >
                  Roll to Clear Heat
                </button>

                {reduceHeatRoll && (
                  <span className="text-xs text-blue-300">
                    Cleared <strong>{reduceHeatRoll.heatCleared}</strong> Heat!
                  </span>
                )}
              </div>

              {/* Activity 4: Training */}
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-2">
                <div>
                  <span className="font-bold text-xs text-purple-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Train (+1 XP)
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Spend downtime honing skills and marking +1 XP in any chosen track.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-1">
                  {(['insight_xp', 'prowess_xp', 'resolve_xp', 'playbook_xp'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTrainXP(t)}
                      className="py-1 text-[10px] rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 uppercase font-mono"
                    >
                      +{t.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Final Review & Commit */}
        {currentStep === 5 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Check className="w-4 h-4" /> 5. Final Downtime Review & Commit
            </div>

            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-400">Score Completed:</span>
                <span className="font-bold text-zinc-100">{scoreTitle}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-400">Coin Payout:</span>
                <span className="font-mono text-amber-400">+{vaultDeposit} to Crew Vault, +{remainingCoin} to Scoundrel Purse</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-400">Rep & Street Standing:</span>
                <span className="font-mono text-emerald-400">+{payoff.rep} Rep (New: {Math.min(12, crew.rep + payoff.rep)}/12)</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-400">Heat & Wanted Status:</span>
                <span className="font-mono text-red-400">Heat {heatCalc.newHeat}/9 | Wanted Level {heatCalc.newWantedLevel}/4</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-zinc-400">Entanglement Triggered:</span>
                <span className="font-semibold text-purple-300">{entanglementResult?.entanglement.name || 'None'}</span>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-zinc-400">Logged Activities ({activitiesLog.length}):</span>
                {activitiesLog.map((log, i) => (
                  <span key={i} className="text-zinc-300 font-mono text-[11px]">• {log}</span>
                ))}
              </div>
            </div>

            <p className="text-xs text-zinc-500 italic">
              Clicking &ldquo;Commit Downtime Cycle&rdquo; will automatically update crew vault, heat, character stress, XP, and record the session journal and transactions to the campaign ledger.
            </p>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4 | 5)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs text-zinc-300"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400"
            >
              Cancel
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1) as 1 | 2 | 3 | 4 | 5)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalCommit}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg uppercase tracking-wider"
              >
                <Check className="w-4 h-4" /> Commit Downtime Cycle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
