'use client';

import React, { useState } from 'react';
import { Crew, Cohort, CohortKind, SpecialAbility, CrewPlaybook } from '@/types/blades';
import { CREW_PLAYBOOKS } from '@/lib/constants/playbooks';
import { ClaimsMap } from './ClaimsMap';
import { CohortCard } from './CohortCard';
import {
  Flame,
  ShieldAlert,
  Coins,
  Users,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Plus,
  Award,
  Shield,
  UserPlus,
  Check,
  X,
  Zap
} from 'lucide-react';

interface CrewSheetProps {
  crew: Crew;
  isGm: boolean;
  onUpdateCrew: (updated: Crew) => void;
}

const COMMON_UPGRADES = [
  {
    id: 'Mastery',
    name: 'Mastery',
    desc: 'Enables scoundrels to advance action ratings to 4 dots (normally capped at 3).'
  },
  {
    id: 'Training (Insight)',
    name: 'Training: Insight',
    desc: 'Mark +1 bonus XP when training Insight in downtime (2 XP total).'
  },
  {
    id: 'Training (Prowess)',
    name: 'Training: Prowess',
    desc: 'Mark +1 bonus XP when training Prowess in downtime (2 XP total).'
  },
  {
    id: 'Training (Resolve)',
    name: 'Training: Resolve',
    desc: 'Mark +1 bonus XP when training Resolve in downtime (2 XP total).'
  },
  {
    id: 'Training (Personal)',
    name: 'Training: Personal',
    desc: 'Mark +1 bonus XP when training your Playbook in downtime (2 XP total).'
  },
  {
    id: 'Hardened',
    name: 'Hardened',
    desc: 'Crew members can suffer +1 trauma before being forced into retirement.'
  },
  {
    id: 'Lair Security',
    name: 'Lair Security',
    desc: 'Your lair is fortified with alarms, locks, and traps against intrusion.'
  },
  {
    id: 'Quality Weapons',
    name: 'Quality: Weapons',
    desc: 'Improves the Tier quality rating of all weapons carried by the crew.'
  },
  {
    id: 'Fine Shadow Cloaks',
    name: 'Fine Shadow Cloaks',
    desc: 'Camouflage cloaks tailored to blend invisibly with Doskvol shadows.'
  }
];

const COHORT_EDGES = ['Fearsome', 'Independent', 'Loyal', 'Tenacious'];
const COHORT_FLAWS = ['Principled', 'Savage', 'Unreliable', 'Wild'];

export function CrewSheet({ crew, isGm, onUpdateCrew }: CrewSheetProps) {
  const crewInfo = CREW_PLAYBOOKS[crew.playbook];

  // Modals state
  const [showAddCohortModal, setShowAddCohortModal] = useState(false);
  const [showAdvancementModal, setShowAdvancementModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'abilities' | 'upgrades' | 'cohorts'>('abilities');

  // Cohort Form State
  const [cohortName, setCohortName] = useState('');
  const [cohortKind, setCohortKind] = useState<CohortKind>('gang');
  const [cohortDesc, setCohortDesc] = useState('');
  const [cohortScale, setCohortScale] = useState(1);
  const [selectedEdges, setSelectedEdges] = useState<string[]>(['Loyal']);
  const [selectedFlaws, setSelectedFlaws] = useState<string[]>(['Unreliable']);

  const currentXp = crew.xp ?? 0;
  const hasAdvanceAvailable = currentXp >= 8;

  // Handlers
  const updateRep = (newRep: number) => {
    onUpdateCrew({
      ...crew,
      rep: Math.max(0, Math.min(12, newRep)),
      updated_at: new Date().toISOString()
    });
  };

  const updateXp = (newXp: number) => {
    onUpdateCrew({
      ...crew,
      xp: Math.max(0, Math.min(8, newXp)),
      updated_at: new Date().toISOString()
    });
  };

  const updateHeat = (delta: number) => {
    let nextHeat = crew.heat + delta;
    let nextWanted = crew.wanted_level;

    if (nextHeat >= 9) {
      if (nextWanted < 4) {
        nextWanted += 1;
        nextHeat = nextHeat - 9;
      } else {
        nextHeat = 9;
      }
    } else if (nextHeat < 0) {
      if (nextWanted > 0) {
        nextWanted -= 1;
        nextHeat = 9 + nextHeat;
      } else {
        nextHeat = 0;
      }
    }

    onUpdateCrew({
      ...crew,
      heat: nextHeat,
      wanted_level: nextWanted,
      updated_at: new Date().toISOString()
    });
  };

  const toggleUpgrade = (upgradeName: string) => {
    const exists = crew.upgrades.some((u) => u.toLowerCase() === upgradeName.toLowerCase());
    const updatedUpgrades = exists
      ? crew.upgrades.filter((u) => u.toLowerCase() !== upgradeName.toLowerCase())
      : [...crew.upgrades, upgradeName];

    onUpdateCrew({
      ...crew,
      upgrades: updatedUpgrades,
      updated_at: new Date().toISOString()
    });
  };

  const toggleSpecialAbility = (abilityName: string, abilityDesc: string) => {
    const existing = crew.special_abilities || [];
    const isUnlocked = existing.some((a) => a.name.toLowerCase() === abilityName.toLowerCase() && a.unlocked);

    let nextAbilities: SpecialAbility[];
    if (isUnlocked) {
      nextAbilities = existing.map((a) =>
        a.name.toLowerCase() === abilityName.toLowerCase() ? { ...a, unlocked: false } : a
      );
    } else {
      const alreadyInList = existing.some((a) => a.name.toLowerCase() === abilityName.toLowerCase());
      if (alreadyInList) {
        nextAbilities = existing.map((a) =>
          a.name.toLowerCase() === abilityName.toLowerCase() ? { ...a, unlocked: true } : a
        );
      } else {
        nextAbilities = [...existing, { name: abilityName, description: abilityDesc, unlocked: true }];
      }
    }

    onUpdateCrew({
      ...crew,
      special_abilities: nextAbilities,
      updated_at: new Date().toISOString()
    });
  };

  const updateVault = (delta: number) => {
    const nextVault = Math.max(0, Math.min(crew.vault_capacity, crew.coin_vault + delta));
    onUpdateCrew({
      ...crew,
      coin_vault: nextVault,
      updated_at: new Date().toISOString()
    });
  };

  const toggleHold = () => {
    if (!isGm) return;
    onUpdateCrew({
      ...crew,
      hold: crew.hold === 'Strong' ? 'Weak' : 'Strong',
      updated_at: new Date().toISOString()
    });
  };

  const updateTier = (delta: number) => {
    if (!isGm) return;
    onUpdateCrew({
      ...crew,
      tier: Math.max(0, Math.min(5, crew.tier + delta)),
      updated_at: new Date().toISOString()
    });
  };

  // Cohort Handlers
  const handleAddCohort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortName.trim()) return;

    const newCohort: Cohort = {
      id: `coh_${Date.now()}`,
      name: cohortName.trim(),
      kind: cohortKind,
      description: cohortDesc.trim() || undefined,
      quality: crew.tier,
      scale: cohortScale,
      edges: selectedEdges,
      flaws: selectedFlaws,
      harm: 'healthy',
      armor_used: false
    };

    onUpdateCrew({
      ...crew,
      cohorts: [...(crew.cohorts || []), newCohort],
      updated_at: new Date().toISOString()
    });

    setCohortName('');
    setCohortDesc('');
    setShowAddCohortModal(false);
  };

  const handleUpdateCohort = (updated: Cohort) => {
    const nextCohorts = (crew.cohorts || []).map((c) => (c.id === updated.id ? updated : c));
    onUpdateCrew({
      ...crew,
      cohorts: nextCohorts,
      updated_at: new Date().toISOString()
    });
  };

  const handleDeleteCohort = (cohortId: string) => {
    const nextCohorts = (crew.cohorts || []).filter((c) => c.id !== cohortId);
    onUpdateCrew({
      ...crew,
      cohorts: nextCohorts,
      updated_at: new Date().toISOString()
    });
  };

  // Combine common upgrades with playbook-specific unique upgrades
  const allUpgrades = [
    ...(crewInfo.uniqueUpgrades || []),
    ...COMMON_UPGRADES
  ];

  const cohorts = crew.cohorts || [];

  return (
    <div className="flex flex-col gap-5 text-zinc-100">
      {/* Crew Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-amber-400 tracking-wide">{crew.name}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800">
              {crew.playbook}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 italic">&ldquo;{crewInfo.tagline}&rdquo;</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-2">
            <span>
              <strong>Hunting Grounds:</strong> {crew.hunting_grounds || crewInfo.defaultHuntingGrounds}
            </span>
            <span>•</span>
            <span>
              <strong>Lair:</strong> {crew.lair || 'Abandoned warehouse / sewer hollow'}
            </span>
          </div>
        </div>

        {/* Tier & Hold Box */}
        <div className="flex items-center gap-4 bg-zinc-950/80 p-3 rounded-lg border border-zinc-800">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Tier</span>
            <div className="flex items-center gap-1 mt-0.5">
              {isGm && (
                <button
                  onClick={() => updateTier(-1)}
                  disabled={crew.tier <= 0}
                  className="p-0.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              )}
              <span className="font-serif font-bold text-xl text-amber-400 px-1">{crew.tier}</span>
              {isGm && (
                <button
                  onClick={() => updateTier(1)}
                  disabled={crew.tier >= 5}
                  className="p-0.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-zinc-800" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Hold</span>
            <button
              onClick={toggleHold}
              disabled={!isGm}
              className={`text-xs px-2 py-0.5 rounded font-bold uppercase mt-1 transition-all ${
                crew.hold === 'Strong'
                  ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
                  : 'bg-red-950/80 border border-red-600 text-red-300'
              }`}
            >
              {crew.hold}
            </button>
          </div>
        </div>
      </div>

      {/* Advancement Alert Banner */}
      {hasAdvanceAvailable && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/90 via-amber-900/60 to-zinc-900 border border-amber-500 flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <span className="font-bold text-xs text-amber-200 uppercase tracking-wider block">
                Crew Advancement Ready! (8 / 8 XP)
              </span>
              <p className="text-[11px] text-zinc-300">
                Choose 1 new Crew Special Ability or 2 Crew Upgrades, then clear the advancement bar.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              updateXp(0);
              setShowAdvancementModal(true);
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all whitespace-nowrap"
          >
            Claim Advance (Clear XP)
          </button>
        </div>
      )}

      {/* Rep, XP, Heat & Vault Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Rep Track (0-12) */}
        <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-2 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" /> Reputation (Rep)
            </span>
            <span className="text-xs font-mono font-bold text-zinc-300">[{crew.rep} / 12]</span>
          </div>

          <div className="grid grid-cols-6 gap-1 h-5">
            {Array.from({ length: 12 }, (_, i) => {
              const repNum = i + 1;
              const isFilled = repNum <= crew.rep;
              return (
                <button
                  key={repNum}
                  type="button"
                  onClick={() => updateRep(repNum === crew.rep ? repNum - 1 : repNum)}
                  className={`rounded border transition-all ${
                    isFilled
                      ? 'bg-amber-400 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                      : 'bg-zinc-950 border-zinc-700/80 hover:border-zinc-500'
                  }`}
                />
              );
            })}
          </div>
          <span className="text-[10px] text-zinc-500 italic mt-auto">
            Fill 12 Rep to advance Tier.
          </span>
        </div>

        {/* Crew Advancement XP (0-8) */}
        <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-2 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" /> Crew XP
            </span>
            <span className="text-xs font-mono font-bold text-zinc-300">[{currentXp} / 8]</span>
          </div>

          <div className="grid grid-cols-8 gap-1 h-5">
            {Array.from({ length: 8 }, (_, i) => {
              const xpNum = i + 1;
              const isFilled = xpNum <= currentXp;
              return (
                <button
                  key={xpNum}
                  type="button"
                  onClick={() => updateXp(xpNum === currentXp ? xpNum - 1 : xpNum)}
                  className={`rounded border transition-all ${
                    isFilled
                      ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                      : 'bg-zinc-950 border-zinc-700/80 hover:border-zinc-500'
                  }`}
                />
              );
            })}
          </div>
          <span className="text-[10px] text-zinc-400 leading-tight line-clamp-1" title={crewInfo.xpTrigger}>
            🎯 {crewInfo.xpTrigger}
          </span>
        </div>

        {/* Heat & Wanted Level */}
        <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-2 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-red-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-400" /> Heat [{crew.heat}/9]
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateHeat(-1)}
                className="text-xs px-1.5 py-0.2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              >
                -
              </button>
              <button
                onClick={() => updateHeat(1)}
                className="text-xs px-1.5 py-0.2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-9 gap-1 h-5">
            {Array.from({ length: 9 }, (_, i) => {
              const heatNum = i + 1;
              const isFilled = heatNum <= crew.heat;
              return (
                <div
                  key={heatNum}
                  className={`rounded border transition-all flex items-center justify-center font-mono text-[9px] ${
                    isFilled
                      ? 'bg-red-600 border-red-500 text-white font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                  }`}
                >
                  {heatNum}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[11px] text-zinc-400">
            <span>Wanted:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 4 }, (_, i) => {
                const wantedNum = i + 1;
                const isMarked = wantedNum <= crew.wanted_level;
                return (
                  <ShieldAlert
                    key={wantedNum}
                    className={`w-3.5 h-3.5 ${isMarked ? 'text-red-500 fill-red-500' : 'text-zinc-700'}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Crew Vault */}
        <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-2 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Vault
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              [{crew.coin_vault} / {crew.vault_capacity} Coin]
            </span>
          </div>

          <div className="flex items-center gap-1.5 h-5">
            {Array.from({ length: crew.vault_capacity }, (_, i) => {
              const coinNum = i + 1;
              const hasCoin = coinNum <= crew.coin_vault;
              return (
                <div
                  key={coinNum}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    hasCoin
                      ? 'bg-amber-400 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                      : 'bg-zinc-950 border-zinc-700'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2 mt-auto pt-1 border-t border-zinc-800/80">
            <button
              onClick={() => updateVault(-1)}
              disabled={crew.coin_vault <= 0}
              className="flex-1 text-[11px] py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200"
            >
              Withdraw
            </button>
            <button
              onClick={() => updateVault(1)}
              disabled={crew.coin_vault >= crew.vault_capacity}
              className="flex-1 text-[11px] py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-600/50 text-amber-300 disabled:opacity-40"
            >
              Deposit
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar for Subsections */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('abilities')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'abilities'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Special Abilities ({(crew.special_abilities || []).filter((a) => a.unlocked).length})
          </button>
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'upgrades'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Crew Upgrades ({crew.upgrades.length})
          </button>
          <button
            onClick={() => setActiveTab('cohorts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'cohorts'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cohorts & Gangs ({cohorts.length})
          </button>
        </div>

        {activeTab === 'cohorts' && (
          <button
            onClick={() => setShowAddCohortModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow"
          >
            <UserPlus className="w-3.5 h-3.5" /> Recruit Cohort
          </button>
        )}
      </div>

      {/* TAB 1: Special Abilities Matrix */}
      {activeTab === 'abilities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {crewInfo.specialAbilities.map((ab) => {
            const isUnlocked = (crew.special_abilities || []).some(
              (a) => a.name.toLowerCase() === ab.name.toLowerCase() && a.unlocked
            );

            return (
              <button
                key={ab.name}
                type="button"
                onClick={() => toggleSpecialAbility(ab.name, ab.description)}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1.5 transition-all ${
                  isUnlocked
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-xs'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isUnlocked ? 'text-amber-300' : 'text-zinc-300'}`}>
                    {ab.name}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                      isUnlocked ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-600'
                    }`}
                  >
                    {isUnlocked ? 'Active' : 'Locked'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{ab.description}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* TAB 2: Crew Upgrades Matrix */}
      {activeTab === 'upgrades' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allUpgrades.map((upg) => {
            const isUnlocked = crew.upgrades.some((u) => u.toLowerCase() === upg.id.toLowerCase());

            return (
              <button
                key={upg.id}
                type="button"
                onClick={() => toggleUpgrade(upg.id)}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1.5 transition-all ${
                  isUnlocked
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-xs'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isUnlocked ? 'text-amber-300' : 'text-zinc-300'}`}>
                    {upg.name}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                      isUnlocked ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-600'
                    }`}
                  >
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{upg.desc}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* TAB 3: Cohorts & Gangs */}
      {activeTab === 'cohorts' && (
        <div className="flex flex-col gap-3">
          {cohorts.length === 0 ? (
            <div className="p-8 rounded-xl bg-zinc-950 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center gap-2">
              <Users className="w-8 h-8 text-zinc-600" />
              <p className="text-xs text-zinc-400">
                No active cohorts recruited. Gangs (Thugs, Rovers, Skulks) or Specialists (Physicians, Investigators) can be recruited through crew advances.
              </p>
              <button
                onClick={() => setShowAddCohortModal(true)}
                className="mt-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold"
              >
                + Recruit First Cohort
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cohorts.map((cohort) => (
                <CohortCard
                  key={cohort.id}
                  cohort={cohort}
                  crewTier={crew.tier}
                  isGm={isGm}
                  onUpdateCohort={handleUpdateCohort}
                  onDeleteCohort={handleDeleteCohort}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Crew Claims & Turf Map */}
      <ClaimsMap crew={crew} isGm={isGm} onUpdateCrew={onUpdateCrew} />

      {/* Add Cohort Modal */}
      {showAddCohortModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-serif text-base font-bold text-amber-400 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Recruit New Cohort
              </h3>
              <button onClick={() => setShowAddCohortModal(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCohort} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-zinc-400 font-semibold uppercase text-[10px]">Cohort Name</label>
                <input
                  type="text"
                  required
                  value={cohortName}
                  onChange={(e) => setCohortName(e.target.value)}
                  placeholder="E.g., The Silver Hook Thugs, Dr. Jack"
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 font-semibold uppercase text-[10px]">Type</label>
                  <select
                    value={cohortKind}
                    onChange={(e) => setCohortKind(e.target.value as CohortKind)}
                    className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-100 outline-none"
                  >
                    <option value="gang">Gang</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 font-semibold uppercase text-[10px]">Scale</label>
                  <select
                    value={cohortScale}
                    onChange={(e) => setCohortScale(Number(e.target.value))}
                    className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-100 outline-none"
                  >
                    <option value={0}>Scale 0 (1-2 persons)</option>
                    <option value={1}>Scale 1 (3-6 persons)</option>
                    <option value={2}>Scale 2 (10-12 persons)</option>
                    <option value={3}>Scale 3 (20-30 persons)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-zinc-400 font-semibold uppercase text-[10px]">Description</label>
                <input
                  type="text"
                  value={cohortDesc}
                  onChange={(e) => setCohortDesc(e.target.value)}
                  placeholder="Street role, specialty, look..."
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-zinc-100 outline-none"
                />
              </div>

              {/* Edges Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-emerald-400 font-semibold uppercase text-[10px]">Edges</label>
                <div className="grid grid-cols-2 gap-1">
                  {COHORT_EDGES.map((edge) => (
                    <label key={edge} className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                      <input
                        type="checkbox"
                        checked={selectedEdges.includes(edge)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedEdges((prev) => [...prev, edge]);
                          else setSelectedEdges((prev) => prev.filter((x) => x !== edge));
                        }}
                        className="rounded accent-emerald-500"
                      />
                      <span>{edge}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Flaws Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-red-400 font-semibold uppercase text-[10px]">Flaws</label>
                <div className="grid grid-cols-2 gap-1">
                  {COHORT_FLAWS.map((flaw) => (
                    <label key={flaw} className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                      <input
                        type="checkbox"
                        checked={selectedFlaws.includes(flaw)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedFlaws((prev) => [...prev, flaw]);
                          else setSelectedFlaws((prev) => prev.filter((x) => x !== flaw));
                        }}
                        className="rounded accent-red-500"
                      />
                      <span>{flaw}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddCohortModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold"
                >
                  Recruit Cohort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
