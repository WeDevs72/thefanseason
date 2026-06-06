import React from 'react';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase-server';
import { Match, Prediction } from '@/lib/types';
import FixturesList from '@/components/FixturesList';

export const revalidate = 0; // Fresh predictions always

export default async function PredictPage() {
  const supabase = createServerComponentClient();

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth');
  }

  // 2. Load user stats from leaderboard
  const { data: lbStats } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  // 3. Load all upcoming matches
  const { data: matchesData } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'upcoming')
    .order('match_date', { ascending: true });

  const matches: Match[] = (matchesData as Match[]) || [];

  // Filter out matches that have already started
  const now = Date.now();
  const activeUpcomingMatches = matches.filter(m => new Date(m.match_date).getTime() > now);

  // 4. Load predictions
  const { data: predsData } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id);

  const predictions: Prediction[] = (predsData as Prediction[]) || [];

  const totalPredictions = lbStats?.total_predictions ?? 0;
  const accuracyPercent = lbStats?.accuracy_percent ? Math.round(Number(lbStats.accuracy_percent)) : 0;
  const currentStreak = lbStats?.current_streak ?? 0;
  const totalPoints = lbStats?.total_points ?? 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* Title Header */}
      <section className="bg-[#070709] border-b border-border-dark py-6 text-center select-none">
        <h1 className="text-xl sm:text-2xl font-mono font-black tracking-widest text-white uppercase">
          🔮 PREDICTION CENTER
        </h1>
        <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-wider">
          Forecast upcoming match outcomes, lock scorelines, and secure leaderboard points.
        </p>
      </section>

      {/* User Stats Mini-Dashboard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-8 select-none">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#0d0f14]/80 border border-border-dark p-4 rounded-xl">
          <div className="text-center p-2 border-r border-border-dark/30 last:border-r-0">
            <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Your Points</span>
            <span className="font-mono text-base sm:text-lg font-black text-gaming-green block mt-1">{totalPoints} PTS</span>
          </div>
          <div className="text-center p-2 border-r border-border-dark/30 last:border-r-0">
            <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Predictions</span>
            <span className="font-mono text-base sm:text-lg font-black text-white block mt-1">{totalPredictions} Made</span>
          </div>
          <div className="text-center p-2 border-r border-border-dark/30 last:border-r-0">
            <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Accuracy Rate</span>
            <span className="font-mono text-base sm:text-lg font-black text-gaming-neon block mt-1">{accuracyPercent}%</span>
          </div>
          <div className="text-center p-2">
            <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Win Streak</span>
            <span className="font-mono text-base sm:text-lg font-black text-gaming-gold block mt-1">🔥 {currentStreak}</span>
          </div>
        </div>
      </section>

      {/* Interactive matches predictions */}
      {activeUpcomingMatches.length > 0 ? (
        <FixturesList initialMatches={activeUpcomingMatches} initialPredictions={predictions} />
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 text-center select-none">
          <div className="gaming-panel rounded-2xl p-12 border-dashed border-border-dark/80 max-w-lg mx-auto">
            <h3 className="text-base font-mono font-black uppercase text-white tracking-widest">
              No Upcoming Matches Available
            </h3>
            <p className="text-xs text-text-muted mt-2 uppercase font-bold tracking-wider leading-relaxed">
              All currently synced fixtures are already locked or in play. Keep checking as teams advance!
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
