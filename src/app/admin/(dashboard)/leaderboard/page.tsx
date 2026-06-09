import React from 'react';
import { createAdminClient } from '@/lib/supabase-server';
import { Trophy } from 'lucide-react';

export const revalidate = 0;

export default async function AdminLeaderboardPage() {
  const admin = createAdminClient();

  const { data: leaderboard } = await admin
    .from('leaderboard')
    .select(`
      *,
      profile:profiles(username, fan_card_tier, is_premium, country)
    `)
    .order('total_points', { ascending: false })
    .order('accuracy_percent', { ascending: false });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-mono font-black uppercase tracking-widest text-white">
          Leaderboard <span className="text-gaming-gold">Admin</span>
        </h1>
        <p className="text-[11px] text-text-muted font-bold mt-1 uppercase tracking-wider">
          {leaderboard?.length || 0} ranked fans — auto-updated on match scoring
        </p>
      </div>

      {/* Leaderboard Table */}
      <div className="gaming-panel rounded-xl border border-border-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#070709] text-[9px] text-text-muted font-black uppercase tracking-wider border-b border-border-dark">
                <th className="px-4 py-3 text-center">Rank</th>
                <th className="px-4 py-3 text-left">Fan</th>
                <th className="px-4 py-3 text-center">Points</th>
                <th className="px-4 py-3 text-center">Correct</th>
                <th className="px-4 py-3 text-center">Total Preds</th>
                <th className="px-4 py-3 text-center">Accuracy</th>
                <th className="px-4 py-3 text-center">Streak</th>
                <th className="px-4 py-3 text-center">Tier</th>
                <th className="px-4 py-3 text-center">Country</th>
              </tr>
            </thead>
            <tbody>
              {!leaderboard || leaderboard.length === 0 ? (
                <tr><td colSpan={9} className="py-10 text-center text-xs text-text-muted font-bold uppercase">Leaderboard is empty.</td></tr>
              ) : leaderboard.map((entry: any, index: number) => {
                const rank = index + 1;
                const profile = entry.profile;
                return (
                  <tr key={entry.user_id} className="border-b border-border-dark/30 last:border-0 hover:bg-surface/20 transition-colors">
                    <td className="px-4 py-3 text-center font-mono font-black text-lg">
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : <span className="text-text-muted text-xs">#{rank}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gaming-gold/10 border border-gaming-gold/30 flex items-center justify-center text-gaming-gold font-black text-xs uppercase">
                          {profile?.username?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">@{profile?.username}</p>
                          {profile?.is_premium && (
                            <span className="text-[8px] text-gaming-gold font-black uppercase">PRO</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-black text-gaming-green text-sm">{entry.total_points}</td>
                    <td className="px-4 py-3 text-center font-mono text-xs font-bold text-gaming-neon">{entry.correct_predictions}</td>
                    <td className="px-4 py-3 text-center font-mono text-xs font-bold text-text-muted">{entry.total_predictions}</td>
                    <td className="px-4 py-3 text-center font-mono text-xs font-bold text-gaming-gold">
                      {Math.round(entry.accuracy_percent)}%
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-white">🔥 {entry.current_streak}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[9px] font-black uppercase text-gaming-purple border border-gaming-purple/30 px-1.5 py-0.5 rounded">
                        {profile?.fan_card_tier || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-text-muted font-bold">{profile?.country || '—'}</td>
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
