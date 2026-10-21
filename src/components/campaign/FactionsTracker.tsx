'use client';

import React, { useState } from 'react';
import { Faction, Clock, HoldLevel } from '@/types/blades';
import { Shield, Plus, ChevronUp, ChevronDown, Dices, Play } from 'lucide-react';

interface FactionsTrackerProps {
  factions: Faction[];
  clocks?: Clock[];
  isGm: boolean;
  onUpdateFaction: (updated: Faction) => void;
  onUpdateClock?: (updated: Clock) => void;
  onCreateFaction?: (faction: Omit<Faction, 'id' | 'created_at' | 'updated_at'>) => void;
}

interface FactionTurnLog {
  factionId: string;
  factionName: string;
  tier: number;
  dice: number[];
  chosenDie: number;
  ticks: number;
  clockName?: string;
  clockCompleted?: boolean;
}

const STATUS_LABELS: Record<number, { label: string; badge: string }> = {
  3: { label: 'Allies (+3)', badge: 'bg-emerald-950 border-emerald-600 text-emerald-300' },
  2: { label: 'Helpful (+2)', badge: 'bg-emerald-950/70 border-emerald-700 text-emerald-400' },
  1: { label: 'Friendly (+1)', badge: 'bg-emerald-950/40 border-emerald-800 text-emerald-400' },
  0: { label: 'Neutral (0)', badge: 'bg-zinc-800 border-zinc-700 text-zinc-300' },
  [-1]: { label: 'Unfriendly (-1)', badge: 'bg-amber-950/60 border-amber-700 text-amber-400' },
  [-2]: { label: 'Hostile (-2)', badge: 'bg-red-950/60 border-red-700 text-red-400' },
  [-3]: { label: 'War (-3)', badge: 'bg-red-950 border-red-500 text-red-300 font-bold' }
};

export function FactionsTracker({
  factions,
  clocks = [],
  isGm,
  onUpdateFaction,
  onUpdateClock,
  onCreateFaction
}: FactionsTrackerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTurnModal, setShowTurnModal] = useState(false);
  const [turnLogs, setTurnLogs] = useState<FactionTurnLog[]>([]);

  // Create form state
  const [name, setName] = useState('');
  const [tier, setTier] = useState(2);
  const [hold, setHold] = useState<HoldLevel>('Strong');
  const [description, setDescription] = useState('');

  const adjustStatus = (faction: Faction, delta: number) => {
    if (!isGm) return;
    const newStatus = Math.max(-3, Math.min(3, faction.status + delta));
    onUpdateFaction({
      ...faction,
      status: newStatus,
      updated_at: new Date().toISOString()
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !onCreateFaction) return;
    onCreateFaction({
      campaign_id: '',
      name: name.trim(),
      tier,
      hold,
      status: 0,
      description: description.trim(),
      visibility: 'campaign_public'
    });
    setName('');
    setDescription('');
    setShowCreateModal(false);
  };

  // GM Faction Turn Engine
  const executeFactionTurn = () => {
    const logs: FactionTurnLog[] = [];

    factions.forEach((fac) => {
      const isZero = fac.tier <= 0;
      const count = isZero ? 2 : fac.tier;
      const dice = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);

      const sixes = dice.filter((d) => d === 6).length;
      const isCritical = sixes >= 2;
      const chosenDie = isZero ? Math.min(...dice) : Math.max(...dice);

      let ticks = 0;
      if (isCritical) {
        ticks = 3;
      } else if (chosenDie === 6) {
        ticks = 2;
      } else if (chosenDie >= 4) {
        ticks = 1;
      } else {
        ticks = 0;
      }

      // Check for linked clock
      let clockName: string | undefined;
      let clockCompleted = false;

      if (fac.clock_id && onUpdateClock) {
        const linkedClock = clocks.find((c) => c.id === fac.clock_id);
        if (linkedClock) {
          clockName = linkedClock.name;
          const nextSeg = Math.min(linkedClock.max_segments, linkedClock.current_segments + ticks);
          clockCompleted = nextSeg >= linkedClock.max_segments;
          onUpdateClock({
            ...linkedClock,
            current_segments: nextSeg,
            updated_at: new Date().toISOString()
          });
        }
      }

      logs.push({
        factionId: fac.id,
        factionName: fac.name,
        tier: fac.tier,
        dice,
        chosenDie,
        ticks,
        clockName,
        clockCompleted
      });
    });

    setTurnLogs(logs);
    setShowTurnModal(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          <h3 className="font-serif text-lg font-bold text-zinc-100">Doskvol Factions & Status</h3>
        </div>

        <div className="flex items-center gap-2">
          {isGm && (
            <button
              onClick={executeFactionTurn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-600 text-purple-200 font-bold text-xs transition-all shadow"
              title="Batch roll fortune rolls for all faction agendas"
            >
              <Play className="w-3.5 h-3.5 text-purple-400" /> Faction Turn Engine
            </button>
          )}

          {isGm && onCreateFaction && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow"
            >
              <Plus className="w-4 h-4" /> Add Faction
            </button>
          )}
        </div>
      </div>

      {/* Factions Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {factions.map((fac) => {
          const statusInfo = STATUS_LABELS[fac.status] || STATUS_LABELS[0];
          return (
            <div
              key={fac.id}
              className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between gap-3 shadow transition-all hover:border-zinc-700"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-zinc-100">{fac.name}</span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Tier {fac.tier} • {fac.hold} Hold
                    </span>
                  </div>

                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-mono font-medium ${statusInfo.badge}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {fac.description && (
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{fac.description}</p>
                )}
              </div>

              {/* Status Stepper Controls (GM only) */}
              {isGm && (
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                  <span className="text-zinc-500 text-[11px]">Faction Status:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => adjustStatus(fac, -1)}
                      disabled={fac.status <= -3}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200"
                      title="Decrease status (-1)"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-zinc-200">
                      {fac.status > 0 ? `+${fac.status}` : fac.status}
                    </span>
                    <button
                      onClick={() => adjustStatus(fac, 1)}
                      disabled={fac.status >= 3}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200"
                      title="Increase status (+1)"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* GM Faction Turn Engine Results Modal */}
      {showTurnModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-zinc-900 border border-purple-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-zinc-100 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Dices className="w-5 h-5 text-purple-400" />
                <h3 className="font-serif text-lg font-bold text-purple-300">
                  Faction Turn Engine Outcomes
                </h3>
              </div>
              <button
                onClick={() => setShowTurnModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Each active faction made a Fortune Roll using their Tier rating to advance their current agendas in Doskvol:
            </p>

            <div className="divide-y divide-zinc-800 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
              {turnLogs.map((log) => (
                <div key={log.factionId} className="p-3 flex items-center justify-between text-xs gap-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-100">{log.factionName}</span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Tier {log.tier} • Rolled [{log.dice.join(', ')}]
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono font-bold text-xs px-2.5 py-1 rounded border ${
                        log.ticks === 3
                          ? 'bg-amber-400 text-black border-amber-300'
                          : log.ticks === 2
                          ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                          : log.ticks === 1
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                      }`}
                    >
                      +{log.ticks} tick{log.ticks === 1 ? '' : 's'}
                    </span>

                    {log.clockName && (
                      <span className="text-[11px] text-zinc-400 font-mono">
                        Clock: {log.clockName} {log.clockCompleted && '✨ [COMPLETE]'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowTurnModal(false)}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Accept Outcomes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Faction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-serif text-base font-bold text-amber-400">Add New Faction</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Faction Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Silver Nails, Circle of Flame..."
                className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Tier (0 to 6)</label>
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={tier}
                  onChange={(e) => setTier(Number(e.target.value))}
                  className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Hold</label>
                <select
                  value={hold}
                  onChange={(e) => setHold(e.target.value as HoldLevel)}
                  className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-2 text-xs text-zinc-100 outline-none"
                >
                  <option value="Strong">Strong Hold</option>
                  <option value="Weak">Weak Hold</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Description / Agenda</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Faction turf, leadership, or core interests..."
                className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-100 outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-black shadow"
              >
                Save Faction
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
