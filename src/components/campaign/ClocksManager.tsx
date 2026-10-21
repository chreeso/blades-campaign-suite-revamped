'use client';

import React, { useState } from 'react';
import { Clock, ClockKind, ContentVisibility } from '@/types/blades';
import { LinearClock } from '@/components/ui/LinearClock';
import { Plus, SlidersHorizontal, EyeOff, Eye } from 'lucide-react';

interface ClocksManagerProps {
  clocks: Clock[];
  isGm: boolean;
  onUpdateClock: (updatedClock: Clock) => void;
  onDeleteClock: (clockId: string) => void;
  onCreateClock: (clock: Omit<Clock, 'id' | 'created_at' | 'updated_at'>) => void;
}

export function ClocksManager({
  clocks,
  isGm,
  onUpdateClock,
  onDeleteClock,
  onCreateClock
}: ClocksManagerProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clockType, setClockType] = useState<ClockKind>('obstacle');
  const [maxSegments, setMaxSegments] = useState<4 | 6 | 8 | 12>(6);
  const [visibility, setVisibility] = useState<ContentVisibility>('campaign_public');
  const [colorTheme, setColorTheme] = useState<string>('cyan');

  // Filter clocks based on role visibility
  const visibleClocks = clocks.filter((clock) => {
    if (!isGm && clock.visibility === 'gm_only') return false;
    if (filterType !== 'all' && clock.clock_type !== filterType) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateClock({
      campaign_id: '',
      name: name.trim(),
      description: description.trim(),
      clock_type: clockType,
      max_segments: maxSegments,
      current_segments: 0,
      visibility,
      color_theme: colorTheme
    });

    setName('');
    setDescription('');
    setShowCreateModal(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
          <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">Filter:</span>
          <div className="flex items-center gap-1">
            {['all', 'obstacle', 'danger', 'project', 'tug_of_war'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`text-xs px-2.5 py-1 rounded capitalize transition-all ${
                  filterType === type
                    ? 'bg-zinc-800 text-amber-400 font-semibold border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {isGm && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow"
          >
            <Plus className="w-4 h-4" /> New Progress Clock
          </button>
        )}
      </div>

      {/* Clocks Grid */}
      {visibleClocks.length === 0 ? (
        <div className="p-8 text-center bg-zinc-900/50 rounded-lg border border-zinc-800/80 text-zinc-500 text-sm">
          No progress clocks found matching the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visibleClocks.map((clock) => (
            <LinearClock
              key={clock.id}
              clock={clock}
              isGm={isGm}
              onUpdate={onUpdateClock}
              onDelete={onDeleteClock}
            />
          ))}
        </div>
      )}

      {/* Modal for Creating Clock */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-serif text-base font-bold text-amber-400">Create New Progress Clock</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Clock Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alarm Raised, Pick Master Vault, Spirit Possession..."
                className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Description (Optional)</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Consequences on completion or obstacle details..."
                className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-100 outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Clock Type</label>
                <select
                  value={clockType}
                  onChange={(e) => {
                    const k = e.target.value as ClockKind;
                    setClockType(k);
                    if (k === 'danger') setColorTheme('red');
                    else if (k === 'obstacle') setColorTheme('emerald');
                    else if (k === 'project') setColorTheme('amber');
                    else setColorTheme('cyan');
                  }}
                  className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                >
                  <option value="obstacle">Obstacle / Progress</option>
                  <option value="danger">Danger / Alert</option>
                  <option value="project">Long-Term Project</option>
                  <option value="tug_of_war">Tug-of-War</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Segments</label>
                <div className="grid grid-cols-4 gap-1">
                  {[4, 6, 8, 12].map((seg) => (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => setMaxSegments(seg as 4 | 6 | 8 | 12)}
                      className={`text-xs py-1.5 rounded border font-mono ${
                        maxSegments === seg
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {seg}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Visibility</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibility('campaign_public')}
                    className={`flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded border ${
                      visibility === 'campaign_public'
                        ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-semibold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <Eye className="w-3 h-3" /> Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility('gm_only')}
                    className={`flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded border ${
                      visibility === 'gm_only'
                        ? 'bg-purple-950/80 border-purple-600 text-purple-200 font-semibold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <EyeOff className="w-3 h-3" /> GM Only
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Bar Color</label>
                <select
                  value={colorTheme}
                  onChange={(e) => setColorTheme(e.target.value)}
                  className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                >
                  <option value="emerald">Emerald (Progress)</option>
                  <option value="red">Crimson (Danger)</option>
                  <option value="amber">Amber (Project)</option>
                  <option value="cyan">Cyan (Electroplasmic)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
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
                Create Clock
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
