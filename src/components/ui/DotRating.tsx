'use client';

import React from 'react';

interface DotRatingProps {
  label: string;
  value: number; // 0 to 4
  max?: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
}

export function DotRating({ label, value, max = 4, onChange, readOnly = false }: DotRatingProps) {
  const handleClick = (index: number) => {
    if (readOnly || !onChange) return;
    // Clicking index i (1-indexed): if value == i, toggle to i - 1; else set to i
    const nextVal = value === index ? index - 1 : index;
    onChange(Math.max(0, Math.min(max, nextVal)));
  };

  return (
    <div className="flex items-center justify-between py-1 group">
      <span className="text-xs font-medium uppercase tracking-wider text-zinc-300 group-hover:text-amber-400 transition-colors">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: max }, (_, i) => {
          const dotNum = i + 1;
          const isFilled = dotNum <= value;

          return (
            <button
              key={dotNum}
              type="button"
              disabled={readOnly}
              onClick={() => handleClick(dotNum)}
              title={`${label}: ${dotNum}`}
              className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                isFilled
                  ? 'bg-amber-400 border-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                  : 'bg-zinc-900 border-zinc-700 hover:border-zinc-500'
              } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
            />
          );
        })}
      </div>
    </div>
  );
}
