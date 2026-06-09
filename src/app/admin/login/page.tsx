'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase';
import { Shield, Eye, EyeOff, AlertTriangle, Lock } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('error') === 'unauthorized') {
      setError('Access denied. Your account does not have admin privileges.');
      // Sign out any existing non-admin session
      supabase.auth.signOut();
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        setError(authError.message || 'Invalid credentials. Please try again.');
        return;
      }

      if (!data.user) {
        setError('Login failed. Please try again.');
        return;
      }

      // Verify the email is in ADMIN_EMAILS via a lightweight server check
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS_HINT || '').split(',');
      // Note: real auth check is enforced server-side in the layout.
      // Client just redirects; server layout will redirect back if not admin.
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gaming-green/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-gaming-purple/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid lines */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,200,83,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,83,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gaming-green/10 border border-gaming-green/30 mb-4 shadow-[0_0_30px_rgba(0,200,83,0.15)]">
            <Shield className="w-7 h-7 text-gaming-green" />
          </div>
          <h1 className="font-mono font-black text-xl tracking-widest text-white uppercase">
            THEFAN<span className="text-gaming-green">SEASON</span>
          </h1>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
            Admin Control Panel
          </p>
        </div>

        {/* Card */}
        <div className="relative bg-[#0d0f14]/90 backdrop-blur-xl border border-border-dark rounded-2xl p-7 shadow-2xl overflow-hidden">
          {/* Top green line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gaming-green to-transparent shadow-[0_0_15px_rgba(0,200,83,0.6)]" />

          <div className="mb-6">
            <h2 className="text-sm font-mono font-black text-white uppercase tracking-widest">
              Admin Sign In
            </h2>
            <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-wider">
              Restricted access — authorised personnel only
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-950/40 border border-red-800/50 rounded-lg p-3 mb-5 text-xs text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-bold leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1.5"
              >
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-lg bg-surface border border-border-dark text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-gaming-green/60 focus:shadow-[0_0_12px_rgba(0,200,83,0.15)] transition-all font-mono"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-surface border border-border-dark text-sm text-white placeholder-text-muted/50 focus:outline-none focus:border-gaming-green/60 focus:shadow-[0_0_12px_rgba(0,200,83,0.15)] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="admin-login-submit"
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 rounded-lg btn-gaming-primary font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-[9px] text-text-muted font-bold uppercase tracking-widest mt-6">
            Use the Supabase email registered for admin access
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-5">
          <a
            href="/"
            className="text-[10px] text-text-muted hover:text-gaming-green font-bold uppercase tracking-wider transition-colors"
          >
            ← Back to TheFanSeason
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gaming-green border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
