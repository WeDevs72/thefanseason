import React from 'react';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase-server';
import FanCardCustomizer from '@/components/FanCardCustomizer';
import { Profile, LeaderboardEntry } from '@/lib/types';

export const revalidate = 0; // Fresh info always

export default async function FanCardPage() {
  const supabase = createServerComponentClient();

  // 1. Authenticate user session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth');
  }

  // 2. Fetch user profile details
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profile: Profile = profileData as Profile;

  // 3. Fetch leaderboard stats (rank, accuracy, streak, etc.)
  const { data: statsData } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const stats: LeaderboardEntry | null = statsData as LeaderboardEntry | null;

  // 4. Fetch earned badges
  const { data: badgesData } = await supabase
    .from('user_badges')
    .select(`
      earned_at,
      badge:badges(*)
    `)
    .eq('user_id', user.id);

  const badges = badgesData || [];

  return (
    <div className="flex-1 flex flex-col">
      {/* Title Header */}
      <section className="bg-[#070709] border-b border-border-dark py-6 text-center select-none">
        <h1 className="text-xl sm:text-2xl font-mono font-black tracking-widest text-white uppercase">
          💳 FAN LICENSE & CARD CENTRE
        </h1>
        <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-wider">
          Customize, upgrade, and share your collectible sports card.
        </p>
      </section>

      {/* Card customizer */}
      <FanCardCustomizer initialProfile={profile} stats={stats} badges={badges} />
    </div>
  );
}
