'use client';

import React from 'react';
import { Crew } from '@/types/blades';
import { CREW_CLAIMS_MAPS, ClaimNode } from '@/lib/constants/claims';
import { MapPin, Shield, Check, Award } from 'lucide-react';

interface ClaimsMapProps {
  crew: Crew;
  isGm?: boolean;
  onUpdateCrew: (updated: Crew) => void;
}

export function ClaimsMap({ crew, onUpdateCrew }: ClaimsMapProps) {
  const claimsNodes = CREW_CLAIMS_MAPS[crew.playbook] || CREW_CLAIMS_MAPS.Shadows;

  // Lair is always held by default
  const heldClaims = new Set(crew.claims || []);

  const toggleClaim = (node: ClaimNode) => {
    if (node.isLair) return; // Lair cannot be toggled off directly

    const nextClaims = new Set(heldClaims);
    if (nextClaims.has(node.id)) {
      nextClaims.delete(node.id);
    } else {
      nextClaims.add(node.id);
    }

    onUpdateCrew({
      ...crew,
      claims: Array.from(nextClaims),
      updated_at: new Date().toISOString()
    });
  };

  // Calculate held turf count (max 6)
  const turfNodes = claimsNodes.filter((n) => n.isTurf);
  const heldTurfCount = Math.min(
    6,
    turfNodes.filter((n) => heldClaims.has(n.id)).length
  );

  const requiredRep = Math.max(6, 12 - heldTurfCount);

  return (
    <div className="p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 flex flex-col gap-4 shadow-xl">
      {/* Header & Metrics */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-serif text-base font-bold text-zinc-100">
              {crew.playbook} Claims & Turf Map
            </h3>
            <p className="text-xs text-zinc-400">
              Seize adjacent claims through scores to expand territory and reduce development costs.
            </p>
          </div>
        </div>

        {/* Turf & Rep Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">Held Turf:</span>
            <span className="font-bold text-amber-300">
              {heldTurfCount} / {turfNodes.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-400">Req Rep to Advance:</span>
            <span className="font-bold text-emerald-300">
              {requiredRep} Rep (12 - {heldTurfCount})
            </span>
          </div>
        </div>
      </div>

      {/* 3x4 Grid of Claims */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {claimsNodes.map((node) => {
          const isHeld = node.isLair || heldClaims.has(node.id);

          return (
            <button
              key={node.id}
              type="button"
              onClick={() => toggleClaim(node)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between min-h-[96px] transition-all relative ${
                node.isLair
                  ? 'bg-amber-950/70 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)] cursor-default'
                  : isHeld
                  ? node.isTurf
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                    : 'bg-zinc-800/90 border-amber-500/80 text-zinc-100 shadow'
                  : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              {/* Node Header */}
              <div className="flex items-start justify-between gap-1 w-full">
                <span
                  className={`text-xs font-bold ${
                    node.isLair
                      ? 'text-amber-400 tracking-wider font-serif font-black'
                      : isHeld
                      ? node.isTurf
                        ? 'text-emerald-400'
                        : 'text-amber-300'
                      : 'text-zinc-400'
                  }`}
                >
                  {node.name}
                </span>

                {isHeld && (
                  <span className="p-0.5 rounded-full bg-emerald-500 text-black">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Node Description */}
              <p className="text-[11px] text-zinc-400 leading-snug mt-1">
                {node.description}
              </p>

              {/* Footer Pill */}
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-800/60 text-[10px] font-mono uppercase tracking-wider">
                <span
                  className={
                    node.isLair
                      ? 'text-amber-400 font-bold'
                      : node.isTurf
                      ? 'text-emerald-400 font-semibold'
                      : 'text-zinc-500'
                  }
                >
                  {node.isLair ? 'Lair' : node.isTurf ? 'Turf Claim' : 'Facility'}
                </span>
                <span className={isHeld ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>
                  {isHeld ? 'Seized' : 'Available'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 italic pt-1 border-t border-zinc-800/80">
        <span>Click any claim square to toggle seizure status after an operation score.</span>
        <span>Min Rep cost to develop is always 6.</span>
      </div>
    </div>
  );
}
