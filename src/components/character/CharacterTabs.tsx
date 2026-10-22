'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Character } from '@/types/blades';
import { Plus, MoreVertical, Trash2, ChevronDown, User, AlertTriangle, X } from 'lucide-react';

interface CharacterTabsProps {
  characters: Character[];
  activeCharacterId: string;
  onSelectCharacter: (characterId: string) => void;
  onNewCharacter: () => void;
  onDeleteCharacter: (characterId: string) => void;
  maxVisibleTabs?: number;
}

export function CharacterTabs({
  characters,
  activeCharacterId,
  onSelectCharacter,
  onNewCharacter,
  onDeleteCharacter,
  maxVisibleTabs = 4
}: CharacterTabsProps) {
  const [activeMenuCharId, setActiveMenuCharId] = useState<string | null>(null);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuCharId(null);
      }
      if (overflowRef.current && !overflowRef.current.contains(event.target as Node)) {
        setIsOverflowOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute visible tabs vs overflow tabs
  // Ensure active character is included in visible tabs if possible
  const { visibleCharacters, overflowCharacters } = React.useMemo(() => {
    if (characters.length <= maxVisibleTabs) {
      return { visibleCharacters: characters, overflowCharacters: [] };
    }

    const activeIndex = characters.findIndex((c) => c.id === activeCharacterId);
    if (activeIndex === -1 || activeIndex < maxVisibleTabs) {
      return {
        visibleCharacters: characters.slice(0, maxVisibleTabs),
        overflowCharacters: characters.slice(maxVisibleTabs)
      };
    }

    // Active character is in overflow: swap so active character is visible
    const visible = characters.slice(0, maxVisibleTabs - 1);
    visible.push(characters[activeIndex]);
    const overflow = characters.filter((c) => !visible.some((v) => v.id === c.id));
    return { visibleCharacters: visible, overflowCharacters: overflow };
  }, [characters, activeCharacterId, maxVisibleTabs]);

  const handleConfirmDelete = () => {
    if (characterToDelete) {
      onDeleteCharacter(characterToDelete.id);
      setCharacterToDelete(null);
      setActiveMenuCharId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 flex-wrap">
        {/* Left Side: Tabs Row */}
        <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
          {visibleCharacters.map((char) => {
            const isActive = char.id === activeCharacterId;
            const isMenuOpen = activeMenuCharId === char.id;

            return (
              <div key={char.id} className="relative group">
                <div
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0}
                  onClick={() => onSelectCharacter(char.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectCharacter(char.id);
                    }
                  }}
                  className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all select-none ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-200 border border-amber-500/60 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span className="font-semibold text-zinc-100 truncate max-w-[140px]">
                    {char.name}
                    {char.alias ? (
                      <span className="text-zinc-400 font-normal ml-1">
                        &quot;{char.alias}&quot;
                      </span>
                    ) : null}
                  </span>

                  {/* Playbook Badge */}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${
                      isActive
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                    }`}
                  >
                    {char.playbook}
                  </span>

                  {/* 3-Dot Context Menu Trigger */}
                  <button
                    type="button"
                    title="Scoundrel options"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuCharId(isMenuOpen ? null : char.id);
                    }}
                    className={`p-1 rounded hover:bg-zinc-700/50 transition-colors ${
                      isActive ? 'text-amber-300 hover:text-amber-100' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3-Dot Contextual Dropdown */}
                {isMenuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute top-full left-0 mt-1.5 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-1 z-30"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCharacterToDelete(char);
                        setActiveMenuCharId(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Retire / Delete Scoundrel</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Overflow "+ More" Dropdown */}
          {overflowCharacters.length > 0 && (
            <div className="relative" ref={overflowRef}>
              <button
                type="button"
                onClick={() => setIsOverflowOpen(!isOverflowOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-all"
              >
                <span>+{overflowCharacters.length} More</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {isOverflowOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-56 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-1.5 z-30">
                  <div className="px-3 py-1 border-b border-zinc-800 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Additional Scoundrels
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {overflowCharacters.map((char) => {
                      const isActive = char.id === activeCharacterId;
                      return (
                        <div
                          key={char.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-zinc-800/80 cursor-pointer text-xs group"
                          onClick={() => {
                            onSelectCharacter(char.id);
                            setIsOverflowOpen(false);
                          }}
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span
                              className={`font-medium truncate ${
                                isActive ? 'text-amber-300 font-semibold' : 'text-zinc-200'
                              }`}
                            >
                              {char.name}
                              {char.alias ? ` "${char.alias}"` : ''}
                            </span>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                              {char.playbook}
                            </span>
                          </div>

                          <button
                            type="button"
                            title="Retire / Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCharacterToDelete(char);
                              setIsOverflowOpen(false);
                            }}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Primary Amber Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onNewCharacter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs shadow transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Scoundrel</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Character Retirement/Deletion */}
      {characterToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-zinc-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-950/80 text-red-400 border border-red-700/60">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-zinc-100">
                    Retire Scoundrel
                  </h3>
                  <p className="text-xs text-zinc-400">Campaign roster management</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCharacterToDelete(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Body */}
            <div className="flex flex-col gap-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                Are you sure you want to retire{' '}
                <strong className="text-zinc-100 font-semibold">
                  {characterToDelete.name}
                  {characterToDelete.alias ? ` "${characterToDelete.alias}"` : ''}
                </strong>{' '}
                ({characterToDelete.playbook})?
              </p>
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300">
                This action permanently removes this scoundrel and their character sheet from the
                active campaign roster.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setCharacterToDelete(null)}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm Retirement
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface EmptyScoundrelStateProps {
  onNewCharacter: () => void;
}

export function EmptyScoundrelState({ onNewCharacter }: EmptyScoundrelStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-zinc-900/50 border border-dashed border-zinc-800 max-w-2xl mx-auto my-8">
      <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
        <User className="w-8 h-8" />
      </div>
      <h3 className="font-serif text-xl font-bold text-zinc-100 mb-2">No Scoundrels in this Campaign</h3>
      <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
        Every crew needs shadows in the fog. Create your first scoundrel to step into the haunted streets of Doskvol.
      </p>
      <button
        type="button"
        onClick={onNewCharacter}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm shadow-lg transition-all hover:scale-105"
      >
        <Plus className="w-4 h-4" />
        Create First Scoundrel
      </button>
    </div>
  );
}
