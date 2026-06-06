'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { createClientComponentClient } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import { User, Mail, Globe, Trophy, ArrowLeft, Save, AlertTriangle, ShieldCheck } from 'lucide-react';

const COUNTRIES = [
  'Argentina', 'Australia', 'Belgium', 'Brazil', 'Canada', 'Croatia', 'Denmark',
  'England', 'France', 'Germany', 'India', 'Italy', 'Japan', 'Mexico', 'Morocco',
  'Netherlands', 'Portugal', 'Saudi Arabia', 'Senegal', 'South Korea', 'Spain',
  'Uruguay', 'USA'
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const supabase = createClientComponentClient();

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [supportedTeam, setSupportedTeam] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setCountry(profile.country || '');
      setSupportedTeam(profile.supported_team || '');
    }
  }, [profile]);

  // Debounced/Triggered Username check
  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(clean);
    setUsernameAvailable(null);
  };

  const verifyUsernameUniqueness = async () => {
    if (!username.trim() || username.length < 3) {
      setUsernameAvailable(false);
      return;
    }

    if (profile && username === profile.username) {
      setUsernameAvailable(true);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user!.id)
        .maybeSingle();

      if (error) throw error;
      setUsernameAvailable(!data);
    } catch (err) {
      console.error(err);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) return;

    if (username.length < 3) {
      showToast('error', 'Validation Error', 'Username must be at least 3 characters.');
      return;
    }

    setSaving(true);

    try {
      // 1. Confirm username uniqueness if changed
      if (username !== profile.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existingUser) {
          showToast('error', 'Username Taken', 'This username is already claimed by another fan.');
          setSaving(false);
          return;
        }
      }

      // 2. Perform DB update
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: username.trim().toLowerCase(),
          full_name: fullName.trim() || 'World Cup Fan',
          country: country || 'Unknown',
          supported_team: supportedTeam || 'Neutral',
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      showToast('success', 'Changes Saved!', 'Your prediction ID has been updated.');
      await refreshProfile();
      setUsernameAvailable(null);
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Save Failed', err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gaming-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const avatarLetter = profile.username ? profile.username[0].toUpperCase() : 'U';
  const isDefaultUsername = profile.username.startsWith('abc_');

  return (
    <div className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full select-none">
      {/* Return link */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-white uppercase font-bold tracking-wider mb-6 group transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Return to Arena
      </button>

      {/* Page Header */}
      <div className="border-b border-border-dark pb-5 mb-8">
        <h2 className="text-xl sm:text-2xl font-mono font-black uppercase text-white tracking-widest leading-none flex items-center gap-2">
          <span>License Settings</span>
          <span className="text-gaming-green">/</span>
          <span className="text-[11px] font-bold text-gaming-green bg-gaming-green/10 border border-gaming-green/20 px-2 py-0.5 rounded tracking-widest font-mono">
            {profile.fan_card_tier || 'rookie'}
          </span>
        </h2>
        <p className="text-[10px] text-text-muted mt-2 uppercase font-bold tracking-wider leading-relaxed">
          Manage your fan identity credentials, check stats, and customize your prediction profile.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Avatar Display & Read-Only Stats */}
        <div className="md:col-span-4 flex flex-col items-center gap-4 text-center">
          <div className="relative group">
            {/* Outer neon border glow */}
            <div className="absolute inset-0 bg-gaming-green/15 rounded-full blur-md opacity-70 group-hover:bg-gaming-green/35 transition-all" />
            
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-24 h-24 rounded-full border-2 border-gaming-green shadow-[0_0_15px_rgba(0,200,83,0.3)] object-cover relative z-10"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-gaming-green bg-gaming-green/5 shadow-[0_0_15px_rgba(0,200,83,0.3)] flex items-center justify-center text-gaming-green font-mono text-3xl font-black relative z-10">
                {avatarLetter}
              </div>
            )}
          </div>

          <div className="mt-2">
            <div className="text-sm font-bold text-white leading-tight">
              {profile.full_name || 'World Cup Fan'}
            </div>
            <div className="text-[10px] font-mono text-text-muted mt-1 uppercase font-bold tracking-widest">
              @{profile.username}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="w-full gaming-panel bg-surface/40 p-3 rounded-lg border-border-dark grid grid-cols-2 gap-2 mt-2">
            <div className="p-1 border-r border-border-dark/60 text-center">
              <span className="text-[7px] text-text-muted font-bold uppercase tracking-wider block">License Tier</span>
              <span className="text-[9px] font-mono font-black text-gaming-gold block mt-0.5 uppercase">
                {profile.fan_card_tier || 'rookie'}
              </span>
            </div>
            <div className="p-1 text-center">
              <span className="text-[7px] text-text-muted font-bold uppercase tracking-wider block">Status Rating</span>
              <span className="text-[9px] font-mono font-black text-gaming-green block mt-0.5 uppercase">
                {profile.is_premium ? 'PREMIUM' : 'FREE'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Configuration Inputs */}
        <div className="md:col-span-8 space-y-6">
          <div className="gaming-panel p-5 sm:p-6 rounded-2xl border-border-dark space-y-5 relative overflow-hidden bg-surface/30">
            {/* Top accent glow line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gaming-green/60" />

            {/* Email (Read-Only) */}
            <div>
              <label className="flex items-center gap-1.5 text-[9px] text-text-muted font-black uppercase tracking-widest mb-1.5">
                <Mail className="w-3.5 h-3.5 text-gaming-neon" />
                Verified Email Address
              </label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full bg-[#0d0f14]/80 border border-border-dark text-text-muted text-xs rounded-lg p-3 cursor-not-allowed font-mono outline-none"
              />
              <span className="text-[8px] font-mono text-text-muted mt-1 block uppercase">
                Email handles are verification-locked and linked to your Google ID.
              </span>
            </div>

            {/* Username */}
            <div>
              <label className="flex items-center justify-between text-[9px] text-text-muted font-black uppercase tracking-widest mb-1.5">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gaming-green" />
                  Username Handle <span className="text-red-500">*</span>
                </span>
                {isDefaultUsername && (
                  <span className="text-[8px] text-gaming-gold font-bold uppercase animate-pulse">
                    ⚠️ Default handle detected
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="e.g. mbappe_fan"
                    className="w-full bg-[#0d0f14] border border-border-dark text-white text-xs rounded-lg p-3 pl-3 font-mono focus:border-gaming-green focus:outline-none focus:ring-1 focus:ring-gaming-green"
                  />
                  {usernameAvailable !== null && (
                    <div className="absolute right-3 top-3">
                      {usernameAvailable ? (
                        <ShieldCheck className="w-4 h-4 text-gaming-green" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={verifyUsernameUniqueness}
                  disabled={checkingUsername || !username.trim() || username.length < 3 || username === profile.username}
                  className="px-3.5 rounded-lg bg-surface border border-border-dark text-[9px] text-white font-bold uppercase tracking-wider hover:border-gaming-green transition-colors disabled:opacity-50"
                >
                  {checkingUsername ? 'checking...' : 'verify'}
                </button>
              </div>
              
              <div className="mt-1 flex flex-col gap-1">
                <span className="text-[8px] font-mono text-text-muted block uppercase">
                  Can contain lowercase letters, numbers, and underscores only. Min 3 characters.
                </span>
                
                {/* Public URL warn alert */}
                {username !== profile.username && (
                  <div className="flex gap-1.5 items-start mt-2 bg-gaming-gold/5 border border-gaming-gold/20 text-gaming-gold text-[8px] font-mono p-2 rounded uppercase font-bold tracking-wider">
                    <AlertTriangle className="w-3 h-3 text-gaming-gold shrink-0 mt-0.5" />
                    <span>Warning: Changing your username will modify your public card url to /u/{username || '[new]'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="flex items-center gap-1.5 text-[9px] text-text-muted font-black uppercase tracking-widest mb-1.5">
                <User className="w-3.5 h-3.5 text-gaming-neon" />
                Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Leo Messi"
                className="w-full bg-[#0d0f14] border border-border-dark text-white text-xs rounded-lg p-3 focus:border-gaming-green focus:outline-none focus:ring-1 focus:ring-gaming-green"
              />
            </div>

            {/* Country Selection */}
            <div>
              <label className="flex items-center gap-1.5 text-[9px] text-text-muted font-black uppercase tracking-widest mb-1.5">
                <Globe className="w-3.5 h-3.5 text-gaming-gold" />
                Home Country <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#0d0f14] border border-border-dark text-white text-xs rounded-lg p-3 focus:border-gaming-green focus:outline-none"
              >
                <option value="" className="bg-surface text-text-muted">Select country...</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} className="bg-surface text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Supported Team Selection */}
            <div>
              <label className="flex items-center gap-1.5 text-[9px] text-text-muted font-black uppercase tracking-widest mb-1.5">
                <Trophy className="w-3.5 h-3.5 text-gaming-green" />
                Supported Team <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={supportedTeam}
                onChange={(e) => setSupportedTeam(e.target.value)}
                className="w-full bg-[#0d0f14] border border-border-dark text-white text-xs rounded-lg p-3 focus:border-gaming-green focus:outline-none"
              >
                <option value="" className="bg-surface text-text-muted">Select supported team...</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} className="bg-surface text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={saving || (usernameAvailable === false)}
              className="w-full py-3.5 rounded-lg btn-gaming-primary font-black tracking-widest text-[10px] uppercase transition-all mt-4 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 text-black" />
                  Save Identity Profile
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
