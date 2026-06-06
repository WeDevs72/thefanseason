import React from 'react';
import { createServerComponentClient } from '@/lib/supabase-server';
import LeaderboardList from '@/components/LeaderboardList';
import { LeaderboardEntry } from '@/lib/types';

export const revalidate = 0; // Fresh rankings always

export default async function LeaderboardPage() {
  const supabase = createServerComponentClient();

  // Fetch leaderboard standings joined with profiles
  const { data: standings } = await supabase
    .from('leaderboard')
    .select(`
      *,
      profile:profiles(*)
    `)
    .order('total_points', { ascending: false })
    .order('accuracy_percent', { ascending: false });

  const entries: LeaderboardEntry[] = (standings as LeaderboardEntry[]) || [];

  return (
    <div className="flex-1 flex flex-col">
      {/* Title Header */}
      <section className="bg-[#070709] border-b border-border-dark py-6 text-center select-none">
        <h1 className="text-xl sm:text-2xl font-mono font-black tracking-widest text-white uppercase">
          🏆 GLOBAL LEADERBOARD
        </h1>
        <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-wider">
          Verify where you stand among the most skilled predictors on the planet.
        </p>
      </section>

      {/* Leaderboard tables */}
      <LeaderboardList initialEntries={entries} />
    </div>
  );
}
