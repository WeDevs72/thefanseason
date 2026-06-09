'use client';

import React, { useState } from 'react';
import { Award, Gift, Trash2 } from 'lucide-react';

export default function AdminBadgesClient({
  badges,
  userBadges: initialUserBadges,
  profiles,
}: {
  badges: any[];
  userBadges: any[];
  profiles: any[];
}) {
  const [userBadges, setUserBadges] = useState(initialUserBadges);
  const [selectedBadge, setSelectedBadge] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [awardLoading, setAwardLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAward = async () => {
    if (!selectedBadge || !selectedUser) return;
    setAwardLoading(true);
    try {
      const res = await fetch('/api/admin/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser, badgeId: Number(selectedBadge) }),
      });
      const data = await res.json();
      if (res.ok) {
        const profile = profiles.find(p => p.id === selectedUser);
        const badge = badges.find(b => b.id === Number(selectedBadge));
        setUserBadges(prev => [{
          user_id: selectedUser,
          badge_id: Number(selectedBadge),
          earned_at: new Date().toISOString(),
          profiles: { username: profile?.username },
          ...badge,
        }, ...prev]);
        showToast('success', `Badge "${badge?.name}" awarded to @${profile?.username}!`);
        setSelectedBadge('');
        setSelectedUser('');
      } else {
        showToast('error', data.error || 'Failed to award badge');
      }
    } finally {
      setAwardLoading(false);
    }
  };

  const handleRevoke = async (userId: string, badgeId: number) => {
    if (!confirm('Revoke this badge from the user?')) return;
    try {
      const res = await fetch('/api/admin/badges', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, badgeId }),
      });
      if (res.ok) {
        setUserBadges(prev => prev.filter(ub => !(ub.user_id === userId && ub.badge_id === badgeId)));
        showToast('success', 'Badge revoked.');
      }
    } catch {
      showToast('error', 'Failed to revoke badge.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider shadow-xl border ${
          toast.type === 'success' ? 'bg-gaming-green/10 border-gaming-green/30 text-gaming-green' : 'bg-red-950/50 border-red-800/50 text-red-400'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-mono font-black uppercase tracking-widest text-white">
          Badge <span className="text-gaming-gold">Management</span>
        </h1>
        <p className="text-[11px] text-text-muted font-bold mt-1 uppercase tracking-wider">
          {badges.length} badges · {userBadges.length} total awards
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: All Badges + Award Tool */}
        <div className="space-y-4">
          {/* Award Tool */}
          <div className="gaming-panel rounded-xl border border-gaming-gold/20 p-5 space-y-4">
            <h2 className="text-xs font-mono font-black uppercase tracking-widest text-gaming-gold flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Award Badge to User
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Select Badge</label>
                <select
                  value={selectedBadge}
                  onChange={e => setSelectedBadge(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border-dark text-xs text-white focus:outline-none focus:border-gaming-gold/50"
                >
                  <option value="">— Choose a badge —</option>
                  {badges.map(b => (
                    <option key={b.id} value={b.id}>{b.icon} {b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Select User</label>
                <select
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border-dark text-xs text-white focus:outline-none focus:border-gaming-gold/50"
                >
                  <option value="">— Choose a user —</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>@{p.username}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAward}
                disabled={!selectedBadge || !selectedUser || awardLoading}
                className="w-full py-2.5 rounded-lg btn-gaming-gold text-xs font-black uppercase tracking-wider disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                {awardLoading ? 'Awarding...' : 'Award Badge'}
              </button>
            </div>
          </div>

          {/* All Badges List */}
          <div className="gaming-panel rounded-xl border border-border-dark p-4 space-y-3">
            <h2 className="text-xs font-mono font-black uppercase tracking-widest text-white">All Badges</h2>
            <div className="space-y-2">
              {badges.map(badge => {
                const awardsCount = userBadges.filter(ub => ub.badge_id === badge.id).length;
                return (
                  <div key={badge.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface/50 border border-border-dark/50">
                    <div className="w-10 h-10 rounded-full bg-gaming-gold/10 border border-gaming-gold/30 flex items-center justify-center text-xl">
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">{badge.name}</p>
                      <p className="text-[9px] text-text-muted">{badge.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-black text-gaming-gold">{awardsCount}</p>
                      <p className="text-[9px] text-text-muted">awarded</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Recent Badge Awards */}
        <div className="gaming-panel rounded-xl border border-border-dark overflow-hidden">
          <div className="px-4 py-3 border-b border-border-dark">
            <h2 className="text-xs font-mono font-black uppercase tracking-widest text-white">Badge Awards Log</h2>
          </div>
          <div className="divide-y divide-border-dark/40 max-h-[600px] overflow-y-auto">
            {userBadges.length === 0 ? (
              <div className="px-4 py-10 text-center text-xs text-text-muted font-bold uppercase">No badges awarded yet.</div>
            ) : userBadges.map((ub: any, idx: number) => {
              const badge = badges.find(b => b.id === (ub.badge_id || ub.id));
              return (
                <div key={idx} className="flex items-center justify-between px-4 py-3 hover:bg-surface/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{badge?.icon || '🏅'}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{badge?.name || 'Badge'}</p>
                      <p className="text-[9px] text-gaming-neon font-bold">@{ub.profiles?.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] text-text-muted font-bold">
                      {new Date(ub.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <button
                      onClick={() => handleRevoke(ub.user_id, ub.badge_id)}
                      className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-950/20 transition-colors"
                      title="Revoke"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
