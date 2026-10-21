'use client';

import React, { useState } from 'react';
import { Campaign, CampaignRole } from '@/types/blades';
import { Crown, User, ChevronDown, Plus, Shield } from 'lucide-react';

interface CampaignSwitcherProps {
  campaigns: Campaign[];
  activeCampaignId: string;
  userRole: CampaignRole;
  onSelectCampaign: (campaignId: string) => void;
  onToggleRole: () => void;
  onCreateCampaign: (name: string, description: string) => void;
}

export function CampaignSwitcher({
  campaigns,
  activeCampaignId,
  userRole,
  onSelectCampaign,
  onToggleRole,
  onCreateCampaign
}: CampaignSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateCampaign(newName.trim(), newDesc.trim());
    setNewName('');
    setNewDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="relative flex items-center gap-3">
      {/* Campaign Selector Pill */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-100 text-sm font-medium transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="truncate max-w-[180px]">{activeCampaign ? activeCampaign.name : 'Select Campaign'}</span>
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-1 z-50">
            <div className="px-3 py-1.5 border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Active Campaigns
            </div>
            <div className="max-h-60 overflow-y-auto">
              {campaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCampaign(c.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-zinc-800 transition-colors ${
                    c.id === activeCampaignId ? 'bg-zinc-800/80 text-amber-300 font-semibold' : 'text-zinc-200'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {c.description && <span className="text-[10px] text-zinc-500 truncate">{c.description}</span>}
                </button>
              ))}
            </div>

            <div className="border-t border-zinc-800 p-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowCreateModal(true);
                }}
                className="w-full flex items-center justify-center gap-1.5 text-xs py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              >
                <Plus className="w-3.5 h-3.5" /> New Campaign
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role Indicator & Role Switcher */}
      <button
        onClick={onToggleRole}
        title="Toggle between GM and Player view"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wide transition-all ${
          userRole === 'gm'
            ? 'bg-purple-950/80 border-purple-600 text-purple-300 hover:bg-purple-900/80'
            : 'bg-blue-950/80 border-blue-600 text-blue-300 hover:bg-blue-900/80'
        }`}
      >
        {userRole === 'gm' ? (
          <>
            <Crown className="w-3.5 h-3.5 text-amber-400" /> Game Master
          </>
        ) : (
          <>
            <User className="w-3.5 h-3.5 text-blue-400" /> Scoundrel / Player
          </>
        )}
      </button>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-serif text-lg font-bold text-amber-400 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" /> Start New Campaign
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-medium text-zinc-400">Campaign Title</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Shadows of Crow's Foot..."
                className="bg-zinc-950 border border-zinc-700 focus:border-amber-500 rounded px-3 py-2 text-sm text-zinc-100 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase font-medium text-zinc-400">Description / Focus</label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="District setting, crew ambitions, or rivalries..."
                className="bg-zinc-950 border border-zinc-700 focus:border-amber-500 rounded px-3 py-2 text-sm text-zinc-100 outline-none resize-none"
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
                Create Campaign
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
