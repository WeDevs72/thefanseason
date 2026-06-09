'use client';

import React, { useState } from 'react';
import { Users, Search, Star, ChevronDown } from 'lucide-react';

const TIERS = ['rookie', 'follower', 'analyst', 'expert', 'legend'] as const;
type Tier = typeof TIERS[number];

const tierColors: Record<Tier, string> = {
  rookie: 'text-zinc-400 border-zinc-700 bg-zinc-800/50',
  follower: 'text-gaming-neon border-gaming-neon/30 bg-gaming-neon/10',
  analyst: 'text-gaming-green border-gaming-green/30 bg-gaming-green/10',
  expert: 'text-gaming-purple border-gaming-purple/30 bg-gaming-purple/10',
  legend: 'text-gaming-gold border-gaming-gold/30 bg-gaming-gold/10',
};

export default function AdminUsersClient({ initialProfiles }: { initialProfiles: any[] }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [tierDropdown, setTierDropdown] = useState<string | null>(null);

  const filtered = profiles.filter(p =>
    p.username?.toLowerCase().includes(search.toLowerCase()) ||
    p.country?.toLowerCase().includes(search.toLowerCase())
  );

  const handleTogglePremium = async (userId: string, current: boolean) => {
    setLoading(userId + '-premium');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, is_premium: !current }),
      });
      if (res.ok) {
        setProfiles(prev => prev.map(p => p.id === userId ? { ...p, is_premium: !current } : p));
      }
    } finally {
      setLoading(null);
    }
  };

  const handleChangeTier = async (userId: string, tier: Tier) => {
    setLoading(userId + '-tier');
    setTierDropdown(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fan_card_tier: tier }),
      });
      if (res.ok) {
        setProfiles(prev => prev.map(p => p.id === userId ? { ...p, fan_card_tier: tier } : p));
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-mono font-black uppercase tracking-widest text-white">
            User <span className="text-gaming-green">Management</span>
          </h1>
          <p className="text-[11px] text-text-muted font-bold mt-1 uppercase tracking-wider">
            {profiles.length} registered fans
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search username or country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-lg bg-surface border border-border-dark text-xs text-white placeholder-text-muted focus:outline-none focus:border-gaming-green/50 w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="gaming-panel rounded-xl border border-border-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#070709] text-[9px] text-text-muted font-black uppercase tracking-wider border-b border-border-dark">
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Country</th>
                <th className="px-4 py-3 text-center">Tier</th>
                <th className="px-4 py-3 text-center">Points</th>
                <th className="px-4 py-3 text-center">Accuracy</th>
                <th className="px-4 py-3 text-center">Rank</th>
                <th className="px-4 py-3 text-center">Premium</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-text-muted font-bold uppercase">
                    No users found.
                  </td>
                </tr>
              ) : filtered.map(profile => {
                const lb = profile.leaderboard?.[0] || {};
                const tier = (profile.fan_card_tier || 'rookie') as Tier;
                const isLoadingPremium = loading === profile.id + '-premium';
                const isLoadingTier = loading === profile.id + '-tier';

                return (
                  <tr key={profile.id} className="border-b border-border-dark/30 last:border-0 hover:bg-surface/20 transition-colors">
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gaming-green/10 border border-gaming-green/30 flex items-center justify-center text-gaming-green font-black text-xs uppercase shrink-0">
                          {profile.username?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">@{profile.username || 'unknown'}</p>
                          <p className="text-[9px] text-text-muted">{profile.supported_team || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Country */}
                    <td className="px-4 py-3 text-xs font-bold text-text-muted">{profile.country || '—'}</td>

                    {/* Tier */}
                    <td className="px-4 py-3 text-center">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setTierDropdown(tierDropdown === profile.id ? null : profile.id)}
                          disabled={isLoadingTier}
                          className={`text-[9px] font-black uppercase px-2 py-1 rounded border flex items-center gap-1 ${tierColors[tier]}`}
                        >
                          {isLoadingTier ? '...' : tier}
                          <ChevronDown className="w-2.5 h-2.5" />
                        </button>
                        {tierDropdown === profile.id && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-surface border border-border-dark rounded-lg py-1 z-10 w-28 shadow-xl">
                            {TIERS.map(t => (
                              <button
                                key={t}
                                onClick={() => handleChangeTier(profile.id, t)}
                                className={`w-full text-left px-3 py-1.5 text-[9px] font-black uppercase hover:bg-surface-hover transition-colors ${tierColors[t]}`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Points */}
                    <td className="px-4 py-3 text-center font-mono text-xs font-black text-gaming-green">
                      {lb.total_points ?? 0}
                    </td>

                    {/* Accuracy */}
                    <td className="px-4 py-3 text-center font-mono text-xs font-bold text-text-muted">
                      {lb.accuracy_percent ? `${Math.round(lb.accuracy_percent)}%` : '—'}
                    </td>

                    {/* Rank */}
                    <td className="px-4 py-3 text-center font-mono text-xs font-black text-gaming-gold">
                      {lb.rank ? `#${lb.rank}` : '—'}
                    </td>

                    {/* Premium Toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePremium(profile.id, profile.is_premium)}
                        disabled={isLoadingPremium}
                        className={`text-[9px] font-black uppercase px-2 py-1 rounded border transition-all ${
                          profile.is_premium
                            ? 'bg-gaming-gold/10 text-gaming-gold border-gaming-gold/30 hover:bg-gaming-gold/20'
                            : 'bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:border-gaming-gold/40'
                        }`}
                      >
                        {isLoadingPremium ? '...' : profile.is_premium ? (
                          <span className="flex items-center gap-1"><Star className="w-2.5 h-2.5 fill-gaming-gold" /> PRO</span>
                        ) : 'Free'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <a
                        href={`/u/${profile.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black uppercase px-2 py-1 rounded border border-border-dark text-text-muted hover:text-gaming-neon hover:border-gaming-neon/40 transition-all"
                      >
                        View →
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
