'use client';

import React, { useState } from 'react';
import { JournalEntry, Transaction, ContentVisibility } from '@/types/blades';
import { BookOpen, Coins, Plus, EyeOff, Eye, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface JournalLedgerProps {
  entries: JournalEntry[];
  transactions: Transaction[];
  isGm: boolean;
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>) => void;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'created_at'>) => void;
}

export function JournalLedger({
  entries,
  transactions,
  isGm,
  onAddEntry,
  onAddTransaction
}: JournalLedgerProps) {
  const [activeTab, setActiveTab] = useState<'journal' | 'economy'>('journal');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);

  // Journal form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryType, setEntryType] = useState<JournalEntry['entry_type']>('session');
  const [visibility, setVisibility] = useState<ContentVisibility>('campaign_public');

  // Transaction form state
  const [txAmount, setTxAmount] = useState(1);
  const [txTarget, setTxTarget] = useState<Transaction['currency_target']>('purse');
  const [txReason, setTxReason] = useState('');

  const visibleEntries = entries.filter((e) => {
    if (!isGm && e.visibility === 'gm_only') return false;
    return true;
  });

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddEntry({
      campaign_id: '',
      author_id: 'current_user',
      title: title.trim(),
      content: content.trim(),
      entry_type: entryType,
      visibility
    });

    setTitle('');
    setContent('');
    setShowEntryModal(false);
  };

  const handleCreateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txReason.trim()) return;

    onAddTransaction({
      campaign_id: '',
      amount: txAmount,
      currency_target: txTarget,
      reason: txReason.trim()
    });

    setTxReason('');
    setShowTxModal(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Switcher & Action Button */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'journal'
                ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Campaign Journal ({visibleEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('economy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'economy'
                ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Coins className="w-4 h-4" /> Economy Ledger ({transactions.length})
          </button>
        </div>

        {activeTab === 'journal' ? (
          <button
            onClick={() => setShowEntryModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow"
          >
            <Plus className="w-4 h-4" /> New Entry
          </button>
        ) : (
          <button
            onClick={() => setShowTxModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow"
          >
            <Plus className="w-4 h-4" /> Log Transaction
          </button>
        )}
      </div>

      {/* Tab 1: Journal Entries */}
      {activeTab === 'journal' && (
        <div className="flex flex-col gap-3">
          {visibleEntries.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/50 rounded-lg border border-zinc-800 text-zinc-500 text-sm">
              No journal logs written for this campaign yet.
            </div>
          ) : (
            visibleEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col gap-2 shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-zinc-100">{entry.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded uppercase font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {entry.entry_type}
                    </span>
                  </div>

                  {entry.visibility === 'gm_only' ? (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-mono">
                      <EyeOff className="w-3 h-3" /> GM Only
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      <Eye className="w-3 h-3" /> Public
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>

                <span className="text-[10px] text-zinc-500 italic mt-1">
                  Recorded: {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Economy Ledger */}
      {activeTab === 'economy' && (
        <div className="flex flex-col gap-2">
          {transactions.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/50 rounded-lg border border-zinc-800 text-zinc-500 text-sm">
              No financial payoffs or expenses recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800 bg-zinc-900/90 rounded-lg border border-zinc-800 overflow-hidden shadow">
              {transactions.map((tx) => {
                const isPositive = tx.amount >= 0;
                return (
                  <div key={tx.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-full ${
                          isPositive
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {isPositive ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-200">{tx.reason}</span>
                        <span className="text-[10px] text-zinc-500 capitalize font-mono">
                          Target: {tx.currency_target.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`font-mono font-bold text-sm ${
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: New Journal Entry */}
      {showEntryModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateEntry}
            className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-serif text-base font-bold text-amber-400">Write Journal Entry</h3>
              <button
                type="button"
                onClick={() => setShowEntryModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Session 1: Heist at the Docks..."
                className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Entry Type</label>
                <select
                  value={entryType}
                  onChange={(e) => setEntryType(e.target.value as JournalEntry['entry_type'])}
                  className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-2 text-xs text-zinc-100 outline-none"
                >
                  <option value="session">Session Log</option>
                  <option value="score_log">Score Summary</option>
                  <option value="character_note">Character Note</option>
                  <option value="gm_secret">GM Secret</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as ContentVisibility)}
                  className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-2 text-xs text-zinc-100 outline-none"
                >
                  <option value="campaign_public">Public to Campaign</option>
                  {isGm && <option value="gm_only">GM Only</option>}
                  <option value="character_private">Private to Author</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Content</label>
              <textarea
                rows={5}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write logs, discoveries, entanglements, or secret notes..."
                className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-100 outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowEntryModal(false)}
                className="px-3 py-1.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-black shadow"
              >
                Save Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: New Transaction */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateTx}
            className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-serif text-base font-bold text-amber-400">Log Financial Transaction</h3>
              <button
                type="button"
                onClick={() => setShowTxModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Amount (+ or -)</label>
                <input
                  type="number"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase font-medium text-zinc-400">Currency Target</label>
                <select
                  value={txTarget}
                  onChange={(e) => setTxTarget(e.target.value as Transaction['currency_target'])}
                  className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-2 text-xs text-zinc-100 outline-none"
                >
                  <option value="purse">Scoundrel Purse (Coin)</option>
                  <option value="stash">Scoundrel Stash (Coin)</option>
                  <option value="crew_vault">Crew Coin Vault</option>
                  <option value="rep">Crew Rep</option>
                  <option value="heat">Crew Heat</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Reason / Description</label>
              <input
                type="text"
                required
                value={txReason}
                onChange={(e) => setTxReason(e.target.value)}
                placeholder="e.g. Score payoff, Bluecoat bribe, Vice indulgence..."
                className="bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowTxModal(false)}
                className="px-3 py-1.5 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-400 text-black shadow"
              >
                Log Transaction
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
