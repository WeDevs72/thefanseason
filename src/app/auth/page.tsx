'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { createClientComponentClient } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import { Mail, Lock, User, Star } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const supabase = createClientComponentClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('error', 'Missing Fields', 'Please fill in both email and password.');
      return;
    }

    setAuthLoading(true);

    try {
      if (isSignUp) {
        // Sign Up flow
        const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (cleanUsername.length < 3) {
          showToast('error', 'Invalid Username', 'Username must be at least 3 alphanumeric characters.');
          setAuthLoading(false);
          return;
        }

        // Verify username uniqueness
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (existingUser) {
          showToast('error', 'Username Taken', 'This username is already taken. Try another.');
          setAuthLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: cleanUsername,
              full_name: cleanUsername,
            },
          },
        });

        if (error) throw error;
        
        showToast('success', 'Sign Up Successful!', 'Check your inbox for a verification email or sign in.');
      } else {
        // Sign In flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        showToast('success', 'Welcome Back!', 'Login successful. Loading arena...');
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Authentication Error', err.message || 'Verification or credentials error.');
    } finally {
      setAuthLoading(false);
    }
  };

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
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gaming-green" />

        <div className="text-center mb-8">
          <span className="bg-gaming-green/10 text-gaming-green border border-gaming-green/20 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-widest inline-flex items-center gap-1 leading-none">
            <Star className="w-3 h-3 text-gaming-gold fill-gaming-gold" /> Secure Auth
          </span>
          <h2 className="text-2xl font-mono font-black tracking-widest text-white mt-3 uppercase">
            {isSignUp ? 'REGISTER FAN ID' : 'AUTHENTICATE ID'}
          </h2>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            {isSignUp ? 'Create your official prediction license' : 'Enter your credential codes to gain entry'}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {/* Username (Sign Up Only) */}
          {isSignUp && (
            <div>
              <label className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">
                <User className="w-3.5 h-3.5 text-gaming-green" />
                Username Handle
              </label>
              <div className="relative">
                <input
                  type="text"
                  required={isSignUp}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. mbappe_goated"
                  className="w-full bg-[#0d0f14] border border-border-dark text-white text-sm rounded-lg p-2.5 pl-3 font-mono focus:border-gaming-green focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">
              <Mail className="w-3.5 h-3.5 text-gaming-neon" />
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. fan@worldcup2026.com"
              className="w-full bg-[#0d0f14] border border-border-dark text-white text-sm rounded-lg p-2.5 focus:border-gaming-green focus:outline-none font-mono"
            />
          </div>

          {/* Password */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">
              <Lock className="w-3.5 h-3.5 text-gaming-gold" />
              Password Keys
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0d0f14] border border-border-dark text-white text-sm rounded-lg p-2.5 focus:border-gaming-green focus:outline-none font-mono"
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3 rounded-lg btn-gaming-primary font-black tracking-widest text-xs uppercase transition-all mt-6"
          >
            {authLoading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            ) : isSignUp ? (
              'Create Prediction ID'
            ) : (
              'Access Predict Arena'
            )}
          </button>
        </form>

        {/* Toggle sign in / sign up link */}
        <div className="text-center mt-4 text-xs text-text-muted">
          {isSignUp ? 'Already have a fan profile?' : 'New predictor in the arena?'}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gaming-green hover:underline ml-1 font-bold font-mono"
          >
            {isSignUp ? 'SIGN IN CODE' : 'CREATE FREE ID'}
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-border-dark"></div>
          <span className="flex-shrink mx-4 text-[9px] text-text-muted font-mono uppercase font-black tracking-widest">
            OR COMMANDS
          </span>
          <div className="flex-grow border-t border-border-dark"></div>
        </div>

        {/* Google Single Sign-On */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-2.5 px-4 rounded-lg bg-surface border border-border-dark hover:border-gaming-green/40 text-xs text-white font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
        >
          {/* Custom inline Google SVG Logo */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
