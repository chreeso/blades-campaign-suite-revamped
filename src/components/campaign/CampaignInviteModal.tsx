'use client';

import React, { useState } from 'react';
import { Campaign, CampaignRole } from '@/types/blades';
import { UserPlus, Copy, Check, Shield, Key } from 'lucide-react';

interface CampaignInviteModalProps {
  campaign: Campaign;
  onJoinByCode: (code: string) => void;
  onClose: () => void;
}

export function CampaignInviteModal({
  campaign,
  onJoinByCode,
  onClose
}: CampaignInviteModalProps) {
  const [activeTab, setActiveTab] = useState<'invite' | 'join'>('invite');
  const [inviteRole, setInviteRole] = useState<CampaignRole>('player');
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Generated shareable code
  const encodedCode = btoa(
    JSON.stringify({
      campaignId: campaign.id,
      name: campaign.name,
      role: inviteRole
    })
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(encodedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    onJoinByCode(joinCode.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-zinc-100">Campaign Invitations</h3>
              <p className="text-xs text-zinc-400">Multiplayer campaign sharing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-zinc-200 p-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('invite')}
            className={`flex-1 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === 'invite' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400'
            }`}
          >
            Invite Others
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === 'join' ? 'bg-amber-500 text-black shadow' : 'text-zinc-400'
            }`}
          >
            Join Campaign
          </button>
        </div>

        {activeTab === 'invite' ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Invite Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setInviteRole('player')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    inviteRole === 'player'
                      ? 'bg-blue-950/80 border-blue-500 text-blue-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" /> Player Invite
                </button>
                <button
                  type="button"
                  onClick={() => setInviteRole('gm')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    inviteRole === 'gm'
                      ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" /> Co-GM Invite
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Shareable Invite Code</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={encodedCode}
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 italic">
              Send this token to players or fellow Game Masters to grant them instant access to{' '}
              <strong>{campaign.name}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Enter Invite Code</label>
              <textarea
                rows={3}
                required
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Paste the base64 campaign token provided by your GM..."
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 outline-none focus:border-amber-500 resize-none"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Join Campaign
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
