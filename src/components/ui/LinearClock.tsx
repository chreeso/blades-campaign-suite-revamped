'use client';

import React from 'react';
import { Clock } from '@/types/blades';
import { EyeOff, Eye, Plus, Minus, RotateCcw } from 'lucide-react';

interface LinearClockProps {
  clock: Clock;
  isGm?: boolean;
  onUpdate?: (updatedClock: Clock) => void;
  onDelete?: (clockId: string) => void;
}

export function LinearClock({ clock, isGm = false, onUpdate, onDelete }: LinearClockProps) {
  const { name, description, clock_type, max_segments, current_segments, visibility, color_theme } = clock;

  const handleSegmentClick = (segmentIndex: number) => {
    if (!onUpdate) return;
    // Clicking segment i (1-indexed): if current == i, toggle to i - 1; otherwise set to i
    const newCount = current_segments === segmentIndex ? segmentIndex - 1 : segmentIndex;
    onUpdate({
      ...clock,
      current_segments: Math.max(0, Math.min(max_segments, newCount)),
      updated_at: new Date().toISOString()
    });
  };

  const increment = () => {
    if (!onUpdate || current_segments >= max_segments) return;
    onUpdate({
      ...clock,
      current_segments: current_segments + 1,
      updated_at: new Date().toISOString()
    });
  };

  const decrement = () => {
    if (!onUpdate || current_segments <= 0) return;
    onUpdate({
      ...clock,
      current_segments: current_segments - 1,
      updated_at: new Date().toISOString()
    });
  };

  const reset = () => {
    if (!onUpdate) return;
    onUpdate({
      ...clock,
      current_segments: 0,
      updated_at: new Date().toISOString()
    });
  };

  // Color schemes based on clock type or custom theme
  const getThemeClasses = () => {
    if (color_theme === 'red' || clock_type === 'danger') {
      return {
        fill: 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]',
        border: 'border-red-900/50',
        badge: 'text-red-400 bg-red-950/60 border-red-800/60',
        text: 'text-red-300'
      };
    }
    if (color_theme === 'emerald' || clock_type === 'obstacle') {
      return {
        fill: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]',
        border: 'border-emerald-900/50',
        badge: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
        text: 'text-emerald-300'
      };
    }
    if (color_theme === 'amber' || clock_type === 'project') {
      return {
        fill: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
        border: 'border-amber-900/50',
        badge: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
        text: 'text-amber-300'
      };
    }
    // Default cyan / electroplasm
    return {
      fill: 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]',
      border: 'border-cyan-900/50',
      badge: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
      text: 'text-cyan-300'
    };
  };

  const theme = getThemeClasses();
  const isComplete = current_segments >= max_segments;

  return (
    <div className={`p-4 rounded-lg bg-zinc-900/90 border ${theme.border} text-zinc-100 flex flex-col gap-3 shadow-md transition-all`}>
      {/* Clock Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-base tracking-wide text-zinc-100">{name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full border uppercase tracking-wider font-mono font-medium ${theme.badge}`}>
              {clock_type}
            </span>
            {visibility === 'gm_only' ? (
              <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-purple-300 border border-purple-800/50">
                <EyeOff className="w-3 h-3" /> GM Only
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                <Eye className="w-3 h-3" /> Public
              </span>
            )}
          </div>
          {description && <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{description}</p>}
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-1 font-mono text-sm font-bold bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
          <span className={isComplete ? theme.text : 'text-zinc-200'}>{current_segments}</span>
          <span className="text-zinc-500">/</span>
          <span className="text-zinc-400">{max_segments}</span>
        </div>
      </div>

      {/* Segmented Linear Progress Bar */}
      <div className="w-full flex items-center gap-1.5 h-7 p-1 bg-zinc-950 rounded border border-zinc-800">
        {Array.from({ length: max_segments }, (_, i) => {
          const segmentNum = i + 1;
          const isFilled = segmentNum <= current_segments;

          return (
            <button
              key={segmentNum}
              type="button"
              onClick={() => handleSegmentClick(segmentNum)}
              title={`Set to ${segmentNum} segment${segmentNum > 1 ? 's' : ''}`}
              className={`flex-1 h-full rounded-sm transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 ${
                isFilled
                  ? `${theme.fill} border border-white/20`
                  : 'bg-zinc-800/40 hover:bg-zinc-700/60 border border-zinc-800/80'
              }`}
            />
          );
        })}
      </div>

      {/* Quick Action Controls */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-800/60">
        <span className="italic text-[11px] text-zinc-500">
          {isComplete ? '✨ Completed' : `${max_segments - current_segments} ticks remaining`}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={decrement}
            disabled={current_segments <= 0}
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200"
            title="Decrement by 1"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={increment}
            disabled={current_segments >= max_segments}
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200"
            title="Increment by 1"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={reset}
            disabled={current_segments === 0}
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200"
            title="Reset to 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {isGm && onDelete && (
            <button
              onClick={() => onDelete(clock.id)}
              className="ml-2 text-[11px] px-1.5 py-0.5 rounded bg-red-950/50 hover:bg-red-900/60 text-red-400 border border-red-900/40"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
