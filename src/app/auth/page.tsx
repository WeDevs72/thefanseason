'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { createClientComponentClient } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import { Star, ShieldAlert } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const supabase = createClientComponentClient();

  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      showToast('error', 'OAuth Failed', err.message || 'Failed to initiate Google OAuth.');
      setAuthLoading(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gaming-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[80vh] relative select-none">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gaming-green/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="gaming-panel rounded-2xl max-w-md w-full p-6 sm:p-8 border-border-dark shadow-2xl relative overflow-hidden">
        {/* Glow top border line */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gaming-green shadow-[0_0_15px_#00C853]" />

        <div className="text-center mb-8">
          <span className="bg-gaming-green/10 text-gaming-green border border-gaming-green/20 text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded tracking-widest inline-flex items-center gap-1.5 leading-none">
            <Star className="w-3 h-3 text-gaming-gold fill-gaming-gold" /> Fan Gate
          </span>
          <h2 className="text-2xl font-mono font-black tracking-widest text-white mt-4 uppercase">
            ENTER THE ARENA
          </h2>
          <p className="text-xs text-text-muted mt-2 leading-relaxed">
            Verify your identity through Google to access predictions, standings, and claim your exclusive World Cup 2026 fan card.
          </p>
        </div>

        <div className="space-y-6">
          {/* Info notification */}
          <div className="flex gap-2.5 bg-gaming-neon/5 border border-gaming-neon/15 rounded-lg p-3 text-xs text-text-muted">
            <ShieldAlert className="w-4 h-4 text-gaming-neon shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Gmail Access Only:</span> Registration is restricted to verified Google accounts to ensure fair play on the prediction leaderboards.
            </div>
          </div>

          {/* Google Single Sign-On Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={authLoading}
            type="button"
            className="w-full py-3.5 px-4 rounded-lg bg-surface border border-border-dark hover:border-gaming-green/50 hover:bg-surface-hover hover:shadow-[0_0_15px_rgba(0,200,83,0.1)] text-xs text-white font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 relative disabled:opacity-50"
          >
            {authLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Sign In / Register with Google
              </>
            )}
          </button>
        </div>

        <div className="text-[10px] font-mono text-center text-text-muted mt-8 uppercase tracking-widest">
          SYSTEM VERIFICATION SECURE
        </div>
      </div>
    </div>
  );
}
