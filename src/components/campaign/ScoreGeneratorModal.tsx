'use client';

import React, { useState } from 'react';
import { Faction, OperationPlanType } from '@/types/blades';
import {
  generateRandomScore,
  ORACLE_CLIENTS,
  ORACLE_TARGETS,
  ORACLE_WORKS,
  ORACLE_TWISTS,
  ORACLE_LOCATIONS,
  ScoreOracle
} from '@/lib/constants/oracles';
import {
  Sparkles,
  RefreshCw,
  Swords,
  BookOpen,
  MapPin,
  Users,
  Target,
  AlertTriangle,
  Coins,
  Check
} from 'lucide-react';

interface ScoreGeneratorModalProps {
  factions: Faction[];
  onLaunchPlan: (score: ScoreOracle) => void;
  onLogScore: (score: ScoreOracle) => void;
  onClose: () => void;
}

export function ScoreGeneratorModal({
  factions,
  onLaunchPlan,
  onLogScore,
  onClose
}: ScoreGeneratorModalProps) {
  const factionNames = factions.map((f) => f.name);
  const [currentScore, setCurrentScore] = useState<ScoreOracle>(() =>
    generateRandomScore(factionNames)
  );
  const [logged, setLogged] = useState(false);

  const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const handleGenerateAll = () => {
    setCurrentScore(generateRandomScore(factionNames));
    setLogged(false);
  };

  const rerollField = (field: keyof ScoreOracle) => {
    if (field === 'client') {
      setCurrentScore((prev) => ({ ...prev, client: pickRandom(ORACLE_CLIENTS) }));
    } else if (field === 'target') {
      setCurrentScore((prev) => ({ ...prev, target: pickRandom(ORACLE_TARGETS) }));
    } else if (field === 'work') {
      setCurrentScore((prev) => ({ ...prev, work: pickRandom(ORACLE_WORKS) }));
    } else if (field === 'twist') {
      setCurrentScore((prev) => ({ ...prev, twist: pickRandom(ORACLE_TWISTS) }));
    } else if (field === 'location') {
      setCurrentScore((prev) => ({ ...prev, location: pickRandom(ORACLE_LOCATIONS) }));
    } else if (field === 'connectedFaction') {
      setCurrentScore((prev) => ({
        ...prev,
        connectedFaction: pickRandom(factionNames.length > 0 ? factionNames : ['The Lampblacks', 'The Red Sashes'])
      }));
    }
  };

  const handleLog = () => {
    onLogScore(currentScore);
    setLogged(true);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-zinc-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-zinc-100">
                Doskvol Job &amp; Score Generator
              </h3>
              <p className="text-xs text-zinc-400">
                Procedural underworld job oracles (RAW p. 306–307)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition-all hover:scale-105"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Roll New Job
            </button>
            <button
              onClick={onClose}
              className="text-xs text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg bg-zinc-800"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Oracle Cards Grid */}
        <div className="space-y-3">
          {/* Work / Objective */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3 shadow">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> The Work (Objective)
              </span>
              <p className="text-sm font-semibold text-zinc-100 leading-snug">
                {currentScore.work}
              </p>
            </div>
            <button
              type="button"
              onClick={() => rerollField('work')}
              className="text-zinc-500 hover:text-purple-400 p-1 rounded hover:bg-zinc-800 shrink-0"
              title="Reroll objective"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Target & Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-2 shadow">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Target
                </span>
                <p className="text-xs text-zinc-200 leading-snug">{currentScore.target}</p>
              </div>
              <button
                type="button"
                onClick={() => rerollField('target')}
                className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-800 shrink-0"
                title="Reroll target"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {/* Client */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-2 shadow">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Client
                </span>
                <p className="text-xs text-zinc-200 leading-snug">{currentScore.client}</p>
              </div>
              <button
                type="button"
                onClick={() => rerollField('client')}
                className="text-zinc-500 hover:text-emerald-400 p-1 rounded hover:bg-zinc-800 shrink-0"
                title="Reroll client"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Location & Connected Faction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Location */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-2 shadow">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </span>
                <p className="text-xs text-zinc-200 leading-snug">{currentScore.location}</p>
              </div>
              <button
                type="button"
                onClick={() => rerollField('location')}
                className="text-zinc-500 hover:text-amber-400 p-1 rounded hover:bg-zinc-800 shrink-0"
                title="Reroll location"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {/* Connected Faction */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-2 shadow">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Entangled Faction
                </span>
                <p className="text-xs text-zinc-200 leading-snug">{currentScore.connectedFaction}</p>
              </div>
              <button
                type="button"
                onClick={() => rerollField('connectedFaction')}
                className="text-zinc-500 hover:text-cyan-400 p-1 rounded hover:bg-zinc-800 shrink-0"
                title="Reroll faction"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Twist / Complication */}
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/50 flex items-start justify-between gap-3 shadow">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Unexpected Twist
              </span>
              <p className="text-xs text-red-200 leading-snug italic">
                &ldquo;{currentScore.twist}&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={() => rerollField('twist')}
              className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-800 shrink-0"
              title="Reroll twist"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Estimated Reward Tier */}
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" /> Projected Stakes:
            </span>
            <span className="text-xs font-mono font-bold text-amber-300">
              {currentScore.rewardTier}
            </span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
          <button
            type="button"
            onClick={handleLog}
            disabled={logged}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
              logged
                ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-default'
                : 'bg-zinc-950 border-zinc-700 hover:border-zinc-500 text-zinc-300'
            }`}
          >
            {logged ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookOpen className="w-3.5 h-3.5" />}
            {logged ? 'Logged in Journal' : 'Save to Journal Dossier'}
          </button>

          <button
            type="button"
            onClick={() => {
              onLaunchPlan(currentScore);
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-serif font-black text-sm shadow-xl transition-all hover:scale-105"
          >
            <Swords className="w-4 h-4" /> Plan Score with this Job &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
