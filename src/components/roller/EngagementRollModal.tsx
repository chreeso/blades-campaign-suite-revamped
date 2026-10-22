'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Crew,
  Faction,
  RollPosition,
  OperationPlanType,
  EngagementRollFactors,
  EngagementRollResult
} from '@/types/blades';
import {
  OPERATION_PLANS,
  calculateEngagementDicePool,
  resolveEngagementRoll
} from '@/lib/roller';
import {
  Swords,
  Footprints,
  VenetianMask,
  Sparkles,
  Users,
  Compass,
  Dices,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  BookOpen,
  X,
  RotateCcw,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface EngagementRollModalProps {
  crew: Crew;
  factions: Faction[];
  onClose: () => void;
  onLaunchFirstAction: (
    position: RollPosition,
    planType: OperationPlanType,
    detail: string
  ) => void;
  onLogScore?: (result: EngagementRollResult) => void;
}

const PLAN_ICONS: Record<OperationPlanType, React.ElementType> = {
  Assault: Swords,
  Deception: VenetianMask,
  Stealth: Footprints,
  Occult: Sparkles,
  Social: Users,
  Transport: Compass
};

export function EngagementRollModal({
  crew,
  factions,
  onClose,
  onLaunchFirstAction,
  onLogScore
}: EngagementRollModalProps) {
  // Plan State
  const [selectedPlan, setSelectedPlan] = useState<OperationPlanType>('Stealth');
  const [planDetail, setPlanDetail] = useState('');

  // Target State
  const [targetFactionId, setTargetFactionId] = useState<string>(factions[0]?.id || 'custom');
  const [customTargetName, setCustomTargetName] = useState('Independent Target');
  const [customTargetTier, setCustomTargetTier] = useState(1);

  const selectedFaction = factions.find((f) => f.id === targetFactionId);
  const targetTier = selectedFaction ? selectedFaction.tier : customTargetTier;
  const targetName = selectedFaction ? selectedFaction.name : customTargetName;

  // Modifiers State
  const [isBold, setIsBold] = useState(false);
  const [exposesVulnerability, setExposesVulnerability] = useState(false);
  const [contactAssistance, setContactAssistance] = useState(false);
  const [priorSetup, setPriorSetup] = useState(false);

  const [isTargetFortified, setIsTargetFortified] = useState(false);
  const [isHostileDistrict, setIsHostileDistrict] = useState(false);
  const [inclementWeather, setInclementWeather] = useState(false);

  // Roll & Outcome State
  const [isRolling, setIsRolling] = useState(false);

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
  const [rollResult, setRollResult] = useState<EngagementRollResult | null>(null);
  const [hasLogged, setHasLogged] = useState(false);

  // Current calculated factors
  const currentFactors: EngagementRollFactors = {
    planType: selectedPlan,
    detail: planDetail.trim() || OPERATION_PLANS[selectedPlan].detailPrompt,
    targetFactionId: selectedFaction?.id,
    targetFactionName: targetName,
    crewTier: crew.tier,
    targetTier,
    isBold,
    exposesVulnerability,
    contactAssistance,
    priorSetup,
    isTargetFortified,
    isHostileDistrict,
    inclementWeather
  };

  const poolBreakdown = calculateEngagementDicePool(currentFactors);

  const handleRoll = () => {
    setIsRolling(true);
    setRollResult(null);

    setTimeout(() => {
      const result = resolveEngagementRoll(currentFactors);
      setRollResult(result);
      setIsRolling(false);
    }, 450);
  };

  const handleLogToJournal = () => {
    if (rollResult && onLogScore && !hasLogged) {
      onLogScore(rollResult);
      setHasLogged(true);
    }
  };

  const handleStartScore = () => {
    if (rollResult) {
      onLaunchFirstAction(
        rollResult.startingPosition,
        rollResult.factors.planType,
        rollResult.factors.detail
      );
    }
  };

  const planInfo = OPERATION_PLANS[selectedPlan];
  const PlanIcon = PLAN_ICONS[selectedPlan];

  return (
    <div
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-950/80 border border-red-700/60 text-red-400">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold tracking-wide text-zinc-100 flex items-center gap-2">
                The Engagement Roll
              </h2>
              <p className="text-xs text-zinc-400">
                Establish the operation plan, assess advantages, and roll for initial position
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: Plan Selection */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              1. Choose Operation Plan Archetype
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {(Object.keys(OPERATION_PLANS) as OperationPlanType[]).map((type) => {
                const Icon = PLAN_ICONS[type];
                const isSelected = selectedPlan === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(type);
                      setRollResult(null);
                    }}
                    className={`p-3 rounded-lg border text-center flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 shadow-sm scale-[1.02]'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span className="text-xs font-bold">{type}</span>
                  </button>
                );
              })}
            </div>

            {/* Plan Required Detail Input */}
            <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex flex-col gap-1.5 mt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                  <PlanIcon className="w-4 h-4 text-amber-400" />
                  Required Detail: <span className="text-amber-300">{planInfo.detailPrompt}</span>
                </span>
                <span className="text-[10px] text-zinc-400 italic">{planInfo.description}</span>
              </div>
              <input
                type="text"
                value={planDetail}
                onChange={(e) => {
                  setPlanDetail(e.target.value);
                  setRollResult(null);
                }}
                placeholder={planInfo.example}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* STEP 2: Target Faction & Tier Delta */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              2. Target & Tier Comparison
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Target Selector */}
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-zinc-300">Target Faction / Institution</span>
                <select
                  value={targetFactionId}
                  onChange={(e) => {
                    setTargetFactionId(e.target.value);
                    setRollResult(null);
                  }}
                  className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-amber-500"
                >
                  {factions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (Tier {f.tier} {f.hold})
                    </option>
                  ))}
                  <option value="custom">Custom / Independent Target</option>
                </select>

                {targetFactionId === 'custom' && (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={customTargetName}
                      onChange={(e) => setCustomTargetName(e.target.value)}
                      placeholder="Target name..."
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 outline-none"
                    />
                    <select
                      value={customTargetTier}
                      onChange={(e) => setCustomTargetTier(Number(e.target.value))}
                      className="w-24 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 outline-none"
                    >
                      {[0, 1, 2, 3, 4, 5].map((t) => (
                        <option key={t} value={t}>
                          Tier {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Tier Difference Display */}
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-zinc-300">Tier Differential</span>
                  <span className="text-xs text-zinc-400 mt-0.5">
                    Crew Tier {crew.tier} vs. Target Tier {targetTier}
                  </span>
                </div>
                <div>
                  {crew.tier > targetTier ? (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-emerald-950 border border-emerald-600 text-emerald-300">
                      +{crew.tier - targetTier}d (Advantage)
                    </span>
                  ) : crew.tier < targetTier ? (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-red-950 border border-red-600 text-red-300">
                      -{targetTier - crew.tier}d (Disadvantage)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-zinc-800 border border-zinc-700 text-zinc-400">
                      0d (Even Match)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Advantages & Disadvantages Checklist */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              3. Operational Circumstances & Modifiers
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Advantages (+1d each) */}
              <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/50 flex flex-col gap-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 border-b border-emerald-900/40 pb-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Major Advantages (+1d each)
                </span>

                <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-300 hover:text-zinc-100">
                  <input
                    type="checkbox"
                    checked={isBold}
                    onChange={(e) => {
                      setIsBold(e.target.checked);
                      setRollResult(null);
                    }}
                    className="mt-0.5 rounded border-zinc-700 accent-emerald-500"
                  />
                  <span>
                    <strong>Bold or daring?</strong> Operation uses an audacity or surprise factor.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-300 hover:text-zinc-100">
                  <input
                    type="checkbox"
                    checked={exposesVulnerability}
                    onChange={(e) => {
                      setExposesVulnerability(e.target.checked);
                      setRollResult(null);
                    }}
                    className="mt-0.5 rounded border-zinc-700 accent-emerald-500"
                  />
                  <span>
                    <strong>Exposes vulnerability?</strong> Hits target where they are weakest.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-300 hover:text-zinc-100">
                  <input
                    type="checkbox"
                    checked={contactAssistance}
                    onChange={(e) => {
                      setContactAssistance(e.target.checked);
                      setRollResult(null);
                    }}
                    className="mt-0.5 rounded border-zinc-700 accent-emerald-500"
                  />
                  <span>
                    <strong>Friends or contacts assisting?</strong> Street informants or inside allies.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-300 hover:text-zinc-100">
                  <input
                    type="checkbox"
                    checked={priorSetup}
                    onChange={(e) => {
                      setPriorSetup(e.target.checked);
                      setRollResult(null);
                    }}
                    className="mt-0.5 rounded border-zinc-700 accent-emerald-500"
                  />
                  <span>
                    <strong>Prior setup or district turf?</strong> Infiltration prepared in advance.
                  </span>
                </label>
              </div>

              {/* Disadvantages (-1d each) */}
              <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-900/50 flex flex-col gap-2">
                <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 border-b border-red-900/40 pb-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" /> Major Disadvantages (-1d each)
                </span>

                <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-300 hover:text-zinc-100">
                  <input
                    type="checkbox"
                    checked={isTargetFortified}
                    onChange={(e) => {
                      setIsTargetFortified(e.target.checked);
                      setRollResult(null);
                    }}
                    className="mt-0.5 rounded border-zinc-700 accent-red-500"
                  />
                  <span>
                    <strong>Fortified or high alert?</strong> Target prepared for this type of breach.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-300 hover:text-zinc-100">
                  <input
                    type="checkbox"
                    checked={isHostileDistrict}
                    onChange={(e) => {
                      setIsHostileDistrict(e.target.checked);
                      setRollResult(null);
                    }}
                    className="mt-0.5 rounded border-zinc-700 accent-red-500"
                  />
                  <span>
                    <strong>Hostile territory or war status?</strong> Operating in enemy gang turf.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-300 hover:text-zinc-100">
                  <input
                    type="checkbox"
                    checked={inclementWeather}
                    onChange={(e) => {
                      setInclementWeather(e.target.checked);
                      setRollResult(null);
                    }}
                    className="mt-0.5 rounded border-zinc-700 accent-red-500"
                  />
                  <span>
                    <strong>Supernatural or environmental hazards?</strong> Ghost storms, death bells.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* STEP 4: Calculated Dice Pool Bar */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                Calculated Engagement Pool
              </span>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs">
                <span className="font-mono text-zinc-300">1d (Base luck)</span>
                {poolBreakdown.advantages > 0 && (
                  <span className="font-mono text-emerald-400 font-bold">
                    +{poolBreakdown.advantages}d (Adv.)
                  </span>
                )}
                {poolBreakdown.disadvantages > 0 && (
                  <span className="font-mono text-red-400 font-bold">
                    -{poolBreakdown.disadvantages}d (Disadv.)
                  </span>
                )}
                <span className="text-zinc-500 font-bold">=</span>
                <span className="font-serif text-lg font-bold text-amber-400">
                  {poolBreakdown.finalDicePool <= 0
                    ? '0d (Take lowest of 2d)'
                    : `${poolBreakdown.finalDicePool}d`}
                </span>
              </div>
            </div>

            <button
              onClick={handleRoll}
              disabled={isRolling}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-sm tracking-wide shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
              {isRolling ? 'Rolling Fate...' : 'Roll Engagement'}
            </button>
          </div>

          {/* STEP 5: Roll Results Banner */}
          {rollResult && (
            <div className="p-5 rounded-xl bg-zinc-900/90 border border-amber-500/40 shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {rollResult.dice.map((d, i) => (
                      <span
                        key={i}
                        className={`w-7 h-7 rounded-md font-mono text-sm font-bold flex items-center justify-center border shadow-xs ${
                          d === rollResult.chosenDie
                            ? 'bg-amber-400 border-amber-300 text-black scale-105'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                        }`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-zinc-400">
                    Chosen: <strong className="text-amber-300 font-mono text-sm">{rollResult.chosenDie}</strong>
                  </span>
                </div>

                {/* Starting Position Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-bold text-zinc-400">Starting Position:</span>
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border shadow-xs ${
                      rollResult.startingPosition === 'Controlled'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                        : rollResult.startingPosition === 'Risky'
                        ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                        : 'bg-red-950 border-red-500 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                    }`}
                  >
                    {rollResult.startingPosition}
                  </span>
                </div>
              </div>

              {/* Narrative & Obstacle Prompt */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-zinc-200 leading-relaxed">
                  {rollResult.narrative}
                </p>
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-start gap-2 text-xs text-zinc-300">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Initial Fiction:</strong> {rollResult.initialObstaclePrompt}
                  </span>
                </div>
              </div>

              {/* Primary Call-to-Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2">
                  {onLogScore && (
                    <button
                      onClick={handleLogToJournal}
                      disabled={hasLogged}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        hasLogged
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      {hasLogged ? 'Logged to Journal' : 'Log in Journal'}
                    </button>
                  )}
                  <button
                    onClick={handleRoll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                    Re-roll
                  </button>
                </div>

                <button
                  onClick={handleStartScore}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all hover:scale-105"
                >
                  <span>Begin First Action</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
