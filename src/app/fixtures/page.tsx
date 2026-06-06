import React from 'react';
import { createServerComponentClient } from '@/lib/supabase-server';
import FixturesList from '@/components/FixturesList';
import { Match, Prediction } from '@/lib/types';

export const revalidate = 0; // Disable server caching to load fresh matches/predictions

export default async function FixturesPage() {
  const supabase = createServerComponentClient();

  // 1. Fetch user session
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Fetch all matches
  const { data: matchesData } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true });

  const matches: Match[] = (matchesData as Match[]) || [];

  // 3. Fetch predictions if authenticated
  let predictions: Prediction[] = [];
  if (user) {
    const { data: predsData } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id);
    predictions = (predsData as Prediction[]) || [];
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Title Header */}
      <section className="bg-[#070709] border-b border-border-dark py-6 text-center select-none">
        <h1 className="text-xl sm:text-2xl font-mono font-black tracking-widest text-white uppercase">
          🏆 MATCH CENTER & SCHEDULE
        </h1>
        <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-wider">
          Track all 104 matches of the  World Cup 2026 localized to your timezone.
        </p>
      </section>

      {/* Fixtures component */}
      <FixturesList initialMatches={matches} initialPredictions={predictions} />
    </div>
  );
}
