'use client';

import React, { useState } from 'react';
import { Character, Crew, IncarcerationOutcome } from '@/types/blades';
import { resolveIncarcerationRoll } from '@/lib/roller';
import { ShieldAlert, Dices, Lock, Check, Coins, Users, AlertTriangle, Sparkles } from 'lucide-react';

interface IncarcerationModalProps {
  crew: Crew;
  characters: Character[];
  onCommitIncarceration: (
    updatedCrew: Crew,
    updatedCharacter?: Character,
    summaryLog?: string
  ) => void;
  onClose: () => void;
}

export function IncarcerationModal({
  crew,
  characters,
  onCommitIncarceration,
  onClose
}: IncarcerationModalProps) {
  const [selectedPrisonerType, setSelectedPrisonerType] = useState<'character' | 'cohort' | 'scapegoat'>('character');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(characters[0]?.id || '');
  const [bribeCoin, setBribeCoin] = useState<number>(0);
  const [hasFactionFavor, setHasFactionFavor] = useState<boolean>(false);
  const [selectedClaim, setSelectedClaim] = useState<string>('');
  const [isRolling, setIsRolling] = useState(false);
  const [outcome, setOutcome] = useState<IncarcerationOutcome | null>(null);

  const selectedChar = characters.find((c) => c.id === selectedCharacterId);
  const availableCoin = crew.coin_vault + (selectedChar ? selectedChar.coin : 0);

  const baseDice = crew.wanted_level;
  const modifierDice = bribeCoin + (hasFactionFavor ? 1 : 0);
  const totalDice = Math.max(0, baseDice + modifierDice);

  const handleRoll = () => {
    setIsRolling(true);
    setTimeout(() => {
      const res = resolveIncarcerationRoll(baseDice, modifierDice);
      setOutcome(res);
      if (res.prisonClaimsAvailable && res.prisonClaimsAvailable.length > 0) {
        setSelectedClaim(res.prisonClaimsAvailable[0]);
      }
      setIsRolling(false);
    }, 250);
  };

  const handleApplySentence = () => {
    if (!outcome) return;

    // Update crew: Heat resets to 0, Wanted level decrements by 1 (or to 0 if wanted was 1)
    const newWanted = Math.max(0, crew.wanted_level - 1);
    const newClaims = [...crew.claims];

    if (outcome.outcome === 'critical' && selectedClaim && !newClaims.includes(selectedClaim)) {
      newClaims.push(`Prison Claim: ${selectedClaim}`);
    }

    // Deduct bribe coin from crew vault if used
    const newVault = Math.max(0, crew.coin_vault - bribeCoin);

    const updatedCrew: Crew = {
      ...crew,
      heat: 0,
      wanted_level: newWanted,
      coin_vault: newVault,
      claims: newClaims,
      updated_at: new Date().toISOString()
    };

    let updatedChar: Character | undefined = undefined;

    if (selectedPrisonerType === 'character' && selectedChar) {
      const charClone = { ...selectedChar };

      if (outcome.outcome === 'bad_outcome') {
        // Apply Level 3 Harm
        charClone.harm = {
          ...charClone.harm,
          level3: charClone.harm.level3 ? `${charClone.harm.level3}, Maimed in Ironhook` : 'Maimed in Ironhook Yard'
        };
      } else if (outcome.outcome === 'partial_success') {
        // Apply Level 2 Harm
        const slot = !charClone.harm.level2[0] ? 0 : 1;
        const newL2 = [...charClone.harm.level2] as [string, string];
        newL2[slot] = 'Ironhook Bruises & Contusions';
        charClone.harm = {
          ...charClone.harm,
          level2: newL2
        };
      }

      updatedChar = charClone;
    }

    const prisonerLabel =
      selectedPrisonerType === 'character' && selectedChar
        ? selectedChar.name
        : selectedPrisonerType === 'cohort'
        ? 'Crew Cohort (Taking the Fall)'
        : 'Underworld Scapegoat / Patsy';

    const summaryLog = `Incarceration Resolved: ${prisonerLabel} served sentence in Ironhook Prison. Outcome: ${outcome.title}. Crew Heat reset to 0, Wanted level reduced to ${newWanted}.`;

    onCommitIncarceration(updatedCrew, updatedChar, summaryLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-zinc-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-zinc-100">
                Ironhook Prison Incarceration
              </h3>
              <p className="text-xs text-zinc-400">
                Serve time to clear Heat and reduce Wanted level (RAW p. 148–151)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg bg-zinc-800"
          >
            ✕
          </button>
        </div>

        {/* Prisoner Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-medium text-zinc-400">Who is serving the sentence?</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedPrisonerType('character')}
              className={`p-2.5 rounded-lg border text-xs flex flex-col items-center gap-1 font-semibold ${
                selectedPrisonerType === 'character'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              <span>Scoundrel PC</span>
              <span className="text-[10px] text-zinc-500 font-normal">Takes harm / trauma</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPrisonerType('cohort')}
              className={`p-2.5 rounded-lg border text-xs flex flex-col items-center gap-1 font-semibold ${
                selectedPrisonerType === 'cohort'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              <span>Crew Cohort</span>
              <span className="text-[10px] text-zinc-500 font-normal">Gang / Expert jailed</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPrisonerType('scapegoat')}
              className={`p-2.5 rounded-lg border text-xs flex flex-col items-center gap-1 font-semibold ${
                selectedPrisonerType === 'scapegoat'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              <span>Framed Patsy</span>
              <span className="text-[10px] text-zinc-500 font-normal">Take the fall</span>
            </button>
          </div>

          {selectedPrisonerType === 'character' && (
            <select
              value={selectedCharacterId}
              onChange={(e) => setSelectedCharacterId(e.target.value)}
              className="mt-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none"
            >
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.playbook})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Dice Pool & Influences */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <span className="text-xs uppercase font-bold text-zinc-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" /> Incarceration Dice Pool
            </span>
            <span className="text-sm font-mono font-bold text-amber-400">
              {totalDice}d pool {totalDice === 0 && '(rolls 2d min)'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400">Base Wanted Level:</span>
              <span className="font-mono font-bold text-red-400">+{baseDice}d</span>
            </div>

            {/* Bribe Magistra / Prison Guards */}
            <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> Bribe (+1d/Coin):
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setBribeCoin(Math.max(0, bribeCoin - 1))}
                  className="w-5 h-5 rounded bg-zinc-800 text-zinc-200 font-bold"
                >
                  -
                </button>
                <span className="font-mono font-bold text-amber-400 w-4 text-center">
                  {bribeCoin}
                </span>
                <button
                  type="button"
                  onClick={() => setBribeCoin(Math.min(availableCoin, bribeCoin + 1))}
                  className="w-5 h-5 rounded bg-zinc-800 text-zinc-200 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Faction Favor Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 pt-1">
            <input
              type="checkbox"
              checked={hasFactionFavor}
              onChange={(e) => setHasFactionFavor(e.target.checked)}
              className="rounded border-zinc-700 text-amber-500 focus:ring-0"
            />
            <span>Call in High-Tier City Faction Favor (+1d to roll)</span>
          </label>
        </div>

        {/* Roll Button */}
        {!outcome && (
          <button
            type="button"
            disabled={isRolling}
            onClick={handleRoll}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-serif font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Dices className="w-5 h-5" />
            {isRolling ? 'Rolling Incarceration...' : 'ROLL INCARCERATION FORTUNE'}
          </button>
        )}

        {/* Outcome Display */}
        {outcome && (
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2">
              {outcome.dice.map((d, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-serif text-xl font-black border ${
                    d === outcome.chosenDie
                      ? 'bg-amber-400 text-black border-amber-300 scale-105'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-1 text-center pt-2 border-t border-zinc-800">
              <span
                className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold ${
                  outcome.outcome === 'critical'
                    ? 'bg-amber-400 text-black'
                    : outcome.outcome === 'full_success'
                    ? 'bg-emerald-500 text-black'
                    : outcome.outcome === 'partial_success'
                    ? 'bg-amber-500/80 text-black'
                    : 'bg-red-600 text-white'
                }`}
              >
                {outcome.title}
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-md pt-1">
                {outcome.narrative}
              </p>
            </div>

            {/* Critical: Prison Claim Picker */}
            {outcome.outcome === 'critical' && outcome.prisonClaimsAvailable && (
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/40 flex flex-col gap-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Choose Prison Claim to Unlock:
                </span>
                <select
                  value={selectedClaim}
                  onChange={(e) => setSelectedClaim(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-zinc-100 outline-none"
                >
                  {outcome.prisonClaimsAvailable.map((claim) => (
                    <option key={claim} value={claim}>
                      {claim}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sentence Summary Benefits */}
            <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-1 text-xs text-zinc-400">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Guaranteed Crew Benefits:
              </span>
              <span>&bull; Crew Heat completely reset to 0</span>
              <span>
                &bull; Crew Wanted Level reduced to {Math.max(0, crew.wanted_level - 1)}
              </span>
            </div>

            {/* Apply Sentence Button */}
            <button
              type="button"
              onClick={handleApplySentence}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-serif font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all mt-1"
            >
              <Check className="w-4 h-4" /> Apply Sentence &amp; Update Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
