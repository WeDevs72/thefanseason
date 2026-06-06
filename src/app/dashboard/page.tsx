import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server';
import FanCard from '@/components/FanCard';
import { Profile, LeaderboardEntry, Prediction, Badge } from '@/lib/types';
import { Trophy, ShieldAlert, Award, Calendar, ChevronRight, Lock, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export const revalidate = 0; // Fresh dashboard updates always

export default async function DashboardPage() {
  const supabase = createServerComponentClient();

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth');
  }

  const supabaseAdmin = createAdminClient();

  // 2. Fetch profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profile: Profile = profileData as Profile;

  // 3. Fetch leaderboard stats
  const { data: statsData } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const stats: LeaderboardEntry | null = statsData as LeaderboardEntry | null;

  // 4. Fetch last 10 predictions joined with matches
  const { data: predictionsData } = await supabase
    .from('predictions')
    .select(`
      *,
      matches(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const predictions = predictionsData || [];

  // 5. Fetch all badges & user earned badge IDs
  const { data: allBadgesData } = await supabase
    .from('badges')
    .select('*')
    .order('id', { ascending: true });

  const allBadges: Badge[] = allBadgesData || [];

  const { data: userBadgesData } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', user.id);

  const earnedBadgeIds = userBadgesData ? userBadgesData.map(ub => ub.badge_id) : [];

  // 6. Calculate predictions left to submit today (starts in the next 24 hours)
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  
  const { data: matchesNext24h } = await supabase
    .from('matches')
    .select('id')
    .eq('status', 'upcoming')
    .gte('match_date', now.toISOString())
    .lte('match_date', next24Hours);

  const matchIdsNext24h = matchesNext24h ? matchesNext24h.map(m => m.id) : [];
  
  // Count how many of these the user has already predicted
  let unpredictedCount = 0;
  if (matchIdsNext24h.length > 0) {
    const { count: predictedNext24hCount } = await supabase
      .from('predictions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('match_id', matchIdsNext24h);
    
    unpredictedCount = matchIdsNext24h.length - (predictedNext24hCount || 0);
  }

  // Formatting variables
  const points = stats?.total_points ?? 0;
  const rank = stats?.rank ? `#${stats.rank}` : '1000+';
  const accuracy = stats?.accuracy_percent ? Math.round(Number(stats.accuracy_percent)) : 0;
  const streak = stats?.current_streak ?? 0;

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 select-none">
      
      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border-dark/60 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-mono font-black uppercase text-white tracking-widest leading-none">
            Welcome back, <span className="text-gaming-green">@{profile.username}</span>
          </h2>
          <p className="text-[10px] text-text-muted mt-1.5 uppercase font-bold tracking-wider">
            Review your performance indices and predict matches to raise your license rating.
          </p>
        </div>
        
        {/* Quick navigation actions */}
        <div className="flex gap-2 w-full md:w-auto">
          <Link
            href="/predict"
            className="flex-1 md:flex-none px-4 py-2.5 rounded-lg btn-gaming-primary text-[10px] font-black uppercase tracking-wider text-center"
          >
            Predict Matches
          </Link>
          <Link
            href="/fancard"
            className="flex-1 md:flex-none px-4 py-2.5 rounded-lg bg-surface border border-border-dark hover:border-gaming-green/40 text-[10px] font-black uppercase text-white tracking-wider text-center"
          >
            Customize Card
          </Link>
        </div>
      </div>

      {/* Grid Layout Dashboard Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SPLIT: Card Mini-Preview & Quick Stats widgets */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-xs font-mono font-black uppercase text-text-muted tracking-widest">
            💳 Account Profile
          </h3>
          
          <div className="bg-[#0d0f14] p-4 border border-border-dark rounded-3xl shadow-xl flex justify-center">
            <FanCard
              profile={profile}
              stats={stats}
              badges={predictions} // Using predictions as mock badge references if needed, or null
              theme={(profile.card_theme as 'free' | 'gold' | 'neon' | 'galaxy') || 'free'}
              titleBadge={profile.title_badge}
            />
          </div>

          {/* Quick HUD Metrics */}
          <div className="gaming-panel p-4 rounded-xl border-border-dark/60 bg-surface/50 grid grid-cols-2 gap-3 text-center">
            <div className="p-2 border-r border-b border-border-dark/40">
              <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider block">Accuracy</span>
              <span className="font-mono text-base font-black text-gaming-neon block mt-0.5">{accuracy}%</span>
            </div>
            <div className="p-2 border-b border-border-dark/40">
              <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider block">Rank</span>
              <span className="font-mono text-base font-black text-gaming-gold block mt-0.5">{rank}</span>
            </div>
            <div className="p-2 border-r border-border-dark/40">
              <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider block">Streak</span>
              <span className="font-mono text-base font-black text-white block mt-0.5">🔥 {streak}</span>
            </div>
            <div className="p-2">
              <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider block">Alerts</span>
              <span className="font-mono text-xs font-black text-gaming-green block mt-1 uppercase tracking-wider">
                {unpredictedCount > 0 ? `${unpredictedCount} Left` : 'All Clear'}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER SPLIT: Recent Predictions Logs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-black uppercase text-text-muted tracking-widest">
              📊 Recent Forecasts
            </h3>
            <Link
              href="/predict"
              className="text-[9px] font-black uppercase text-gaming-green hover:underline tracking-wider"
            >
              Predictions Center →
            </Link>
          </div>

          <div className="space-y-4">
            {predictions.length > 0 ? (
              predictions.map((pred) => {
                const match = pred.matches;
                const isWinnerCorrect = pred.is_correct;
                const hasScoreline = pred.predicted_home_score !== null;

                return (
                  <div
                    key={pred.id}
                    className="gaming-panel rounded-xl p-3 border-border-dark/60 hover:border-gaming-green/30 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-[9px] text-text-muted font-bold uppercase">
                        <span>{match.stage}</span>
                        <span>•</span>
                        <span className="text-white">
                          Forecast: {pred.predicted_winner.toUpperCase()}
                          {hasScoreline && ` (${pred.predicted_home_score}-${pred.predicted_away_score})`}
                        </span>
                      </div>
                      
                      <div className="text-xs font-mono font-black text-white mt-1.5">
                        {match.home_team} vs {match.away_team}
                      </div>

                      {match.status === 'finished' && (
                        <div className="text-[9px] font-mono text-text-muted font-bold mt-0.5">
                          Actual Score: {match.home_score} - {match.away_score}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      {isWinnerCorrect === null ? (
                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Pending
                        </span>
                      ) : isWinnerCorrect ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider bg-gaming-green/10 text-gaming-green border border-gaming-green/30 inline-flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Correct
                          </span>
                          <span className="text-[9px] font-mono font-black text-gaming-gold">
                            +{pred.points_earned} PTS
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider bg-red-950 text-red-500 border border-red-800 inline-flex items-center gap-0.5">
                          <XCircle className="w-2.5 h-2.5" /> Incorrect
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="gaming-panel rounded-xl p-8 text-center border-dashed border-border-dark">
                <p className="text-xs text-text-muted uppercase font-bold tracking-wider">
                  No prediction records found.
                </p>
                <Link
                  href="/predict"
                  className="btn-gaming-primary px-4 py-2 text-[9px] font-black rounded-lg uppercase inline-block mt-3"
                >
                  Make Your First Forecast
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SPLIT: Badges / Achievements progressions */}
        <div className="lg:col-span-3 space-y-6">
          <h3 className="text-xs font-mono font-black uppercase text-text-muted tracking-widest">
            🏆 Arena Accomplishments
          </h3>

          <div className="gaming-panel p-4 rounded-xl border border-border-dark space-y-4">
            {allBadges.map((badge) => {
              const isEarned = earnedBadgeIds.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex items-start gap-3 transition-opacity ${isEarned ? 'opacity-100' : 'opacity-40'}`}
                >
                  {/* Badge emblem */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 border border-dashed ${
                      isEarned 
                        ? 'bg-gaming-gold/15 border-gaming-gold text-gaming-gold shadow-[0_0_8px_rgba(255,215,0,0.25)]' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider leading-tight ${isEarned ? 'text-white' : 'text-zinc-400'}`}>
                      {badge.name}
                    </h4>
                    <p className="text-[9px] text-text-muted mt-0.5 leading-tight">
                      {badge.description}
                    </p>
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
