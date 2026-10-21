'use client';

import React from 'react';
import { Crew } from '@/types/blades';
import { CREW_PLAYBOOKS } from '@/lib/constants/playbooks';
import { ClaimsMap } from './ClaimsMap';
import { Flame, ShieldAlert, Coins, Users, ChevronUp, ChevronDown } from 'lucide-react';

interface CrewSheetProps {
  crew: Crew;
  isGm: boolean;
  onUpdateCrew: (updated: Crew) => void;
}

export function CrewSheet({ crew, isGm, onUpdateCrew }: CrewSheetProps) {
  const crewInfo = CREW_PLAYBOOKS[crew.playbook];

  const updateRep = (newRep: number) => {
    onUpdateCrew({
      ...crew,
      rep: Math.max(0, Math.min(12, newRep)),
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

  return (
    <div className="flex flex-col gap-4 text-zinc-100">
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
            <span><strong>Hunting Grounds:</strong> {crew.hunting_grounds || crewInfo.defaultHuntingGrounds}</span>
            <span>•</span>
            <span><strong>Lair:</strong> {crew.lair || 'Hidden warehouse / sewer hollow'}</span>
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

      {/* Rep, Heat & Vault Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rep Track (0-12) */}
        <div className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-2 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" /> Reputation (Rep)
            </span>
            <span className="text-xs font-mono font-bold text-zinc-300">[{crew.rep} / 12]</span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 h-6">
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
          <span className="text-[10px] text-zinc-500 italic mt-1">
            Fill 12 Rep to advance Tier (Hold must be Strong).
          </span>
        </div>

        {/* Heat & Wanted Level */}
        <div className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-2 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-red-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-400" /> Heat [{crew.heat}/9] & Wanted [{crew.wanted_level}/4]
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateHeat(-1)}
                className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              >
                -1
              </button>
              <button
                onClick={() => updateHeat(1)}
                className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              >
                +1
              </button>
            </div>
          </div>

          {/* 9 Heat Boxes */}
          <div className="grid grid-cols-9 gap-1 h-6">
            {Array.from({ length: 9 }, (_, i) => {
              const heatNum = i + 1;
              const isFilled = heatNum <= crew.heat;
              return (
                <div
                  key={heatNum}
                  className={`rounded border transition-all flex items-center justify-center font-mono text-[10px] ${
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

          {/* Wanted Level Icons */}
          <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/80">
            <span className="text-[11px] text-zinc-400">Wanted:</span>
            {Array.from({ length: 4 }, (_, i) => {
              const wantedNum = i + 1;
              const isMarked = wantedNum <= crew.wanted_level;
              return (
                <ShieldAlert
                  key={wantedNum}
                  className={`w-4 h-4 ${isMarked ? 'text-red-500 fill-red-500' : 'text-zinc-700'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Crew Coin Vault */}
        <div className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-2 shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" /> Crew Lair Vault
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              [{crew.coin_vault} / {crew.vault_capacity} Coin]
            </span>
          </div>

          <div className="flex items-center gap-1.5 h-6">
            {Array.from({ length: crew.vault_capacity }, (_, i) => {
              const coinNum = i + 1;
              const hasCoin = coinNum <= crew.coin_vault;
              return (
                <div
                  key={coinNum}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    hasCoin
                      ? 'bg-amber-400 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                      : 'bg-zinc-950 border-zinc-700'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2 mt-auto pt-2 border-t border-zinc-800/80">
            <button
              onClick={() => updateVault(-1)}
              disabled={crew.coin_vault <= 0}
              className="flex-1 text-xs py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200"
            >
              Withdraw Coin
            </button>
            <button
              onClick={() => updateVault(1)}
              disabled={crew.coin_vault >= crew.vault_capacity}
              className="flex-1 text-xs py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-600/50 text-amber-300 disabled:opacity-40"
            >
              Deposit Coin
            </button>
          </div>
        </div>
      </div>

      {/* Crew Claims & Turf Map */}
      <ClaimsMap
        crew={crew}
        isGm={isGm}
        onUpdateCrew={onUpdateCrew}
      />
    </div>
  );
}
