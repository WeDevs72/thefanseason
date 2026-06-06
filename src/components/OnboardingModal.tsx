'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { createClientComponentClient } from '@/lib/supabase';
import { useToast } from './Toast';
import { User, Globe, Trophy, ShieldAlert } from 'lucide-react';

const COUNTRIES = [
  'Argentina', 'Australia', 'Belgium', 'Brazil', 'Canada', 'Croatia', 'Denmark',
  'England', 'France', 'Germany', 'India', 'Italy', 'Japan', 'Mexico', 'Morocco',
  'Netherlands', 'Portugal', 'Saudi Arabia', 'Senegal', 'South Korea', 'Spain',
  'Uruguay', 'USA'
];

export default function OnboardingModal() {
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [supportedTeam, setSupportedTeam] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    // Show onboarding if logged in but username starts with 'fan_' (default auto-gen) or team/country is missing
    if (user && profile) {
      const isDefaultUsername = profile.username.startsWith('fan_');
      const isMissingDetails = !profile.country || profile.country === 'Unknown' || !profile.supported_team || profile.supported_team === 'Neutral';

      if (isDefaultUsername || isMissingDetails) {
        setIsOpen(true);
        setUsername(isDefaultUsername ? '' : profile.username);
        setFullName(profile.full_name || '');
        setCountry(profile.country && profile.country !== 'Unknown' ? profile.country : '');
        setSupportedTeam(profile.supported_team && profile.supported_team !== 'Neutral' ? profile.supported_team : '');
      } else {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !country || !supportedTeam) {
      showToast('error', 'Incomplete Details', 'Please fill in all required fields.');
      return;
    }

    // Clean username (alphanumeric and underscores only)
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3) {
      showToast('error', 'Invalid Username', 'Username must be at least 3 characters and alphanumeric.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Verify if username is already taken by someone else
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .neq('id', user!.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingUser) {
        showToast('error', 'Username Taken', 'This username is already claimed by another fan.');
        setSubmitting(false);
        return;
      }

      // 2. Save profile updates
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: cleanUsername,
          full_name: fullName.trim() || 'World Cup Fan',
          country,
          supported_team: supportedTeam,
        })
        .eq('id', user!.id);

      if (updateError) throw updateError;

      showToast('success', 'Profile Activated!', 'Welcome to TheFanSeason 2026.');
      setIsOpen(false);
      await refreshProfile();
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Activation Failed', err.message || 'An error occurred while updating your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="gaming-panel rounded-2xl max-w-md w-full p-6 border-gaming-green/40 shadow-[0_0_30px_rgba(0,200,83,0.15)] relative overflow-hidden">
        {/* Glowing top line */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gaming-green" />

        <div className="text-center mb-6">
          <h2 className="text-xl font-mono font-black tracking-widest text-white uppercase">
            FAN PRO<span className="text-gaming-green">FILE</span> ACTIVATION
          </h2>
          <p className="text-xs text-text-muted mt-1">Set up your unique card handle, country origin, and support team.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">
              <User className="w-3.5 h-3.5 text-gaming-green" />
              Username Handle <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. neymar_fan"
              className="w-full bg-[#0d0f14] border border-border-dark text-white text-sm rounded-lg p-2.5 font-mono focus:border-gaming-green focus:outline-none"
            />
          </div>

          {/* Full Name Input */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-gaming-neon" />
              Display Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Leo Messi"
              className="w-full bg-[#0d0f14] border border-border-dark text-white text-sm rounded-lg p-2.5 focus:border-gaming-green focus:outline-none"
            />
          </div>

          {/* Country Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">
              <Globe className="w-3.5 h-3.5 text-gaming-gold" />
              Home Country <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-[#0d0f14] border border-border-dark text-white text-sm rounded-lg p-2.5 focus:border-gaming-green focus:outline-none"
            >
              <option value="">Select country...</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="bg-surface text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Supported Team Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">
              <Trophy className="w-3.5 h-3.5 text-gaming-green" />
              Supported Team <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={supportedTeam}
              onChange={(e) => setSupportedTeam(e.target.value)}
              className="w-full bg-[#0d0f14] border border-border-dark text-white text-sm rounded-lg p-2.5 focus:border-gaming-green focus:outline-none"
            >
              <option value="">Select supported team...</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="bg-surface text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg btn-gaming-primary font-black tracking-widest text-xs uppercase transition-all mt-4"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              'Activate Fan License'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
