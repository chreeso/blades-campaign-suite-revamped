'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { ShieldCheck, LogIn, LogOut, Key, Server, Check, ExternalLink } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const isSupabaseConfigured = Boolean(supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setMessage(null);
    setIsError(false);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password
        });
        if (error) throw error;
        setMessage('Sign-up link or confirmation email sent! Check your inbox.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) throw error;
        setMessage('Successfully authenticated!');
        setTimeout(() => onClose(), 800);
      }
    } catch (err: unknown) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setMessage('Signed out successfully.');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-zinc-100">Supabase Authentication</h3>
              <p className="text-xs text-zinc-400">Multi-campaign identity & sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-zinc-200 p-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Connection Status Badge */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
            isSupabaseConfigured
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-amber-950/40 border-amber-800 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            <span className="font-semibold">
              {isSupabaseConfigured ? '⚡ Supabase Connected' : '💾 Local / Offline Mode'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
            {isSupabaseConfigured ? 'Live Backend' : 'Demo State'}
          </span>
        </div>

        {!isSupabaseConfigured ? (
          /* Guide when Supabase is not yet connected */
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-2.5 text-xs">
            <span className="font-bold text-amber-400 uppercase tracking-wide">
              How to connect your live Supabase project:
            </span>
            <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 leading-relaxed">
              <li>
                Create a project at{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 underline inline-flex items-center gap-0.5"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
              <li>
                In the Supabase SQL Editor, run the prepared schema migration:
                <code className="block mt-1 p-2 bg-zinc-900 rounded font-mono text-[11px] text-zinc-300">
                  supabase/migrations/20261020000000_init_blades.sql
                </code>
              </li>
              <li>
                Create a <code className="text-amber-300">.env.local</code> file in the project root:
                <pre className="mt-1 p-2 bg-zinc-900 rounded font-mono text-[11px] text-zinc-300 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
                </pre>
              </li>
              <li>Restart the Next.js dev server.</li>
            </ol>
            <p className="text-[11px] text-zinc-500 italic mt-1">
              The application fully works in Local/Demo Mode in the meantime without needing credentials!
            </p>
          </div>
        ) : user ? (
          /* Logged In View */
          <div className="flex flex-col gap-3 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-xs text-zinc-400">Signed in as:</span>
                <span className="font-bold text-sm text-zinc-100 font-mono">{user.email}</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-2 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        ) : (
          /* Auth Form */
          <form onSubmit={handleAuth} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scoundrel@doskvol.underworld"
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-medium text-zinc-400">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>

            {message && (
              <div
                className={`p-2.5 rounded-lg text-xs ${
                  isError ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading ? (
                'Processing...'
              ) : isSignUp ? (
                <>
                  <Check className="w-4 h-4" /> Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage(null);
              }}
              className="text-xs text-zinc-400 hover:text-amber-300 underline underline-offset-2 text-center"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
