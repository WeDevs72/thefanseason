import React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase-server';
import { Trophy, Calendar, ShieldCheck, Flame, Star, Users, CheckSquare, Play } from 'lucide-react';
import OnboardingModal from '@/components/OnboardingModal';

// Force dynamic rendering to always load fresh prediction stats and matches
export const revalidate = 0;

export default async function HomePage() {
  const supabase = createAdminClient();

  // 1. Fetch upcoming 3 matches
  const { data: upcomingMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'upcoming')
    .order('match_date', { ascending: true })
    .limit(3);

  // 2. Fetch top 5 leaderboard entries with profile details
  const { data: topLeaderboard } = await supabase
    .from('leaderboard')
    .select(`
      *,
      profile:profiles(*)
    `)
    .order('total_points', { ascending: false })
    .order('accuracy_percent', { ascending: false })
    .limit(5);

  // 3. Fetch aggregates for stats bar
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true });

  const { count: totalPredictions } = await supabase
    .from('predictions')
    .select('id', { count: 'exact', head: true });

  const { count: finishedMatches } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'finished');

  const matchesRemaining = 104 - (finishedMatches || 0);

  // Simulated animated aggregates if table counts are initial/low for testing UI
  const displayUsers = totalUsers && totalUsers > 0 ? totalUsers : 2490;
  const displayPredictions = totalPredictions && totalPredictions > 0 ? totalPredictions : 11840;

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-gaming-green/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[500px] right-10 w-[300px] h-[300px] bg-gaming-purple/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center relative z-10">
        <span className="bg-gaming-green/15 text-gaming-green border border-gaming-green/30 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,200,83,0.15)] animate-bounce">
          <Star className="w-3.5 h-3.5 text-gaming-gold fill-gaming-gold" />
          Football World Cup 2026 Prediction Arena
        </span>

        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider text-white mt-6 font-mono leading-none">
          Football 2026 <br className="sm:hidden" />
          <span className="text-neon-gradient text-shadow-[0_0_20px_rgba(0,229,255,0.2)]">THEFANSEASON</span>
        </h1>

        <p className="text-sm sm:text-lg text-text-muted max-w-xl mx-auto mt-4 uppercase font-bold tracking-wider leading-relaxed">
          Predict. Compete. Win. <br />
          <span className="text-white">Formulate scorelines, acquire badges, unlock tiers, and dominate the global rankings.</span>
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            href="/fancard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg btn-gaming-primary text-sm font-black tracking-widest flex items-center justify-center gap-2"
          >
            Create Your Fan Card (Free)
            <Play className="w-4 h-4 fill-black" />
          </Link>
          <Link
            href="/predict"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg btn-gaming-secondary text-sm font-black tracking-widest"
          >
            Start Predicting
          </Link>
        </div>
      </section>

      {/* Stats HUD Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 z-10">
        <div className="grid grid-cols-3 gap-3 bg-[#0d0f14]/80 backdrop-blur border border-border-dark p-4 rounded-2xl relative overflow-hidden">
          {/* Shimmer top trim */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-gaming-green to-transparent" />

          {/* Stat 1: Total Users */}
          <div className="flex flex-col items-center justify-center text-center p-2 border-r border-border-dark/60">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Users className="w-4 h-4 text-gaming-neon" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Active Fans</span>
            </div>
            <span className="font-mono text-lg sm:text-2xl font-black text-white mt-1">
              {displayUsers.toLocaleString()}+
            </span>
          </div>

          {/* Stat 2: Predictions Made */}
          <div className="flex flex-col items-center justify-center text-center p-2 border-r border-border-dark/60">
            <div className="flex items-center gap-1.5 text-text-muted">
              <CheckSquare className="w-4 h-4 text-gaming-green" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Predictions Lock</span>
            </div>
            <span className="font-mono text-lg sm:text-2xl font-black text-white mt-1">
              {displayPredictions.toLocaleString()}+
            </span>
          </div>

          {/* Stat 3: Matches Remaining */}
          <div className="flex flex-col items-center justify-center text-center p-2">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Calendar className="w-4 h-4 text-gaming-gold" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Matches Left</span>
            </div>
            <span className="font-mono text-lg sm:text-2xl font-black text-white mt-1">
              {matchesRemaining} / 104
            </span>
          </div>
        </div>
      </section>

      {/* Main Splits: Matches & Leaderboard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        {/* Left Split: Upcoming Matches Preview */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between border-b border-border-dark/60 pb-3">
            <h2 className="text-sm font-mono font-black uppercase tracking-widest text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gaming-green animate-pulse" />
              Featured Next Matchups
            </h2>
            <Link
              href="/fixtures"
              className="text-[10px] font-black uppercase text-gaming-green hover:underline tracking-wider"
            >
              All Fixtures →
            </Link>
          </div>

          {upcomingMatches && upcomingMatches.length > 0 ? (
            <div className="space-y-4">
              {upcomingMatches.map((match) => (
                <div
                  key={match.id}
                  className="gaming-panel rounded-xl p-4 flex items-center justify-between gap-4 border border-border-dark/60 hover:border-gaming-green/30 transition-all"
                >
                  <div className="flex-1 flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-white max-w-[100px] truncate">{match.home_team}</span>
                    <span className="text-[9px] text-text-muted font-bold">vs</span>
                    <span className="font-mono text-xs font-bold text-white max-w-[100px] truncate">{match.away_team}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-gaming-green font-bold block">
                      {new Date(match.match_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[8px] text-text-muted font-bold block uppercase tracking-wider mt-0.5">
                      {match.stage}
                    </span>
                  </div>
                  <Link
                    href="/predict"
                    className="px-3 py-1 rounded bg-surface border border-border-dark hover:border-gaming-green/40 hover:text-gaming-green text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Predict
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="gaming-panel rounded-xl p-8 text-center border border-dashed border-border-dark">
              <p className="text-xs text-text-muted uppercase font-bold tracking-wider">No upcoming matches available.</p>
              <Link href="/fixtures" className="btn-gaming-primary px-4 py-2 text-[10px] font-black rounded-lg uppercase inline-block mt-3">
                Reload Fixtures
              </Link>
            </div>
          )}
        </div>

        {/* Right Split: Top 5 Leaderboard Preview */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between border-b border-border-dark/60 pb-3">
            <h2 className="text-sm font-mono font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gaming-gold" />
              Leaderboard Top 5
            </h2>
            <Link
              href="/leaderboard"
              className="text-[10px] font-black uppercase text-gaming-green hover:underline tracking-wider"
            >
              Full Rankings →
            </Link>
          </div>

          <div className="gaming-panel rounded-xl overflow-hidden border border-border-dark/60">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-background/80 text-[9px] text-text-muted font-bold uppercase tracking-wider border-b border-border-dark">
                  <th className="py-2.5 px-3 text-center">Rank</th>
                  <th className="py-2.5 px-3 text-left">Fan Username</th>
                  <th className="py-2.5 px-3 text-center">Accuracy</th>
                  <th className="py-2.5 px-3 text-center">Points</th>
                </tr>
              </thead>
              <tbody>
                {topLeaderboard && topLeaderboard.length > 0 ? (
                  topLeaderboard.map((entry, index) => {
                    const rank = index + 1;
                    const username = entry.profile?.username || 'Unknown';
                    return (
                      <tr key={entry.user_id} className="border-b border-border-dark/30 last:border-0 hover:bg-surface-hover/10 text-xs">
                        <td className="py-3 px-3 text-center">
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                        </td>
                        <td className="py-3 px-3 text-left font-bold text-white flex items-center gap-1.5">
                          <span className="truncate max-w-[120px]">{username}</span>
                          {entry.profile?.is_premium && (
                            <span className="bg-gaming-gold/10 text-gaming-gold border border-gaming-gold/20 text-[7px] font-black px-1 rounded scale-90">
                              PRO
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-text-muted font-bold">
                          {Math.round(entry.accuracy_percent)}%
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-gaming-green">
                          {entry.total_points} PTS
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 px-4 text-center text-xs text-text-muted font-bold uppercase tracking-wider">
                      Leaderboard is currently empty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Profile Onboarding Trigger context modal */}
      <OnboardingModal />
    </div>
  );
}
