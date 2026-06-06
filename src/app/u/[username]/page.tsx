import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase-server';
import FanCard from '@/components/FanCard';
import { Profile, LeaderboardEntry } from '@/lib/types';
import { ShieldCheck, Play, UserX } from 'lucide-react';

export const revalidate = 0; // Fresh info always

interface PublicProfileProps {
  params: { username: string };
}

// Simple country name to flag emoji helper
function getFlagEmoji(countryName: string): string {
  const mapping: { [key: string]: string } = {
    'india': '🇮🇳', 'united states': '🇺🇸', 'usa': '🇺🇸', 'canada': '🇨🇦', 'mexico': '🇲🇽',
    'brazil': '🇧🇷', 'argentina': '🇦🇷', 'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'france': '🇫🇷', 'germany': '🇩🇪',
    'spain': '🇪🇸', 'italy': '🇮🇹', 'portugal': '🇵🇹', 'netherlands': '🇳🇱', 'belgium': '🇧🇪',
    'croatia': '🇭🇷', 'uruguay': '🇺🇾', 'senegal': '🇸🇳', 'morocco': '🇲🇦', 'japan': '🇯🇵',
    'south korea': '🇰🇷', 'australia': '🇦🇺', 'saudi arabia': '🇸🇦'
  };
  return mapping[countryName.toLowerCase().trim()] || '🏳️';
}

// Generate dynamic Open Graph / SEO metadata
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const username = resolvedParams.username.toLowerCase();
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (!profile) {
    return {
      title: 'Fan Not Found | TheFanSeason 2026',
    };
  }

  const { data: stats } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('user_id', profile.id)
    .maybeSingle();

  const flag = profile.country ? getFlagEmoji(profile.country) : '🏳️';
  const rank = stats?.rank ? `#${stats.rank}` : 'unranked';
  const accuracy = stats?.accuracy_percent ? Math.round(Number(stats.accuracy_percent)) : 0;

  // Format Title: "🇮🇳 Rahul is #4 on TheFanSeason 2026 with 71% accuracy!"
  const ogTitle = `${flag} ${profile.username} is ${rank} on TheFanSeason 2026 with ${accuracy}% accuracy!`;
  const ogDescription = `Check out ${profile.username}'s predictions, stats, streaks, and earned badges. Join the prediction league!`;

  // Build og:image query URL pointing to /api/og
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const ogImage = new URL(`${siteUrl}/api/og`);
  ogImage.searchParams.set('username', profile.username);
  ogImage.searchParams.set('tier', profile.fan_card_tier || 'rookie');
  ogImage.searchParams.set('team', profile.supported_team || 'Neutral');
  ogImage.searchParams.set('accuracy', String(accuracy));
  ogImage.searchParams.set('points', String(stats?.total_points ?? 0));
  ogImage.searchParams.set('country', profile.country || 'Unknown');
  ogImage.searchParams.set('theme', profile.card_theme || 'free');

  return {
    title: `${profile.username} Fan Profile | TheFanSeason 2026`,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: [{ url: ogImage.toString() }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImage.toString()],
    },
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = resolvedParams.username.toLowerCase();
  const supabase = createAdminClient();

  // 1. Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 select-none text-center">
        <div className="gaming-panel rounded-2xl max-w-sm w-full p-8 border-red-500/40 text-center">
          <UserX className="w-12 h-12 text-red-500 mx-auto mb-3 animate-pulse" />
          <h2 className="text-base font-mono font-black uppercase text-white tracking-widest">
            Predictor License Missing
          </h2>
          <p className="text-xs text-text-muted mt-2 uppercase font-bold tracking-wider leading-relaxed">
            The username handle <span className="text-red-400 font-mono">@{username}</span> is not registered in TheFanSeason database.
          </p>
          <Link
            href="/"
            className="w-full mt-5 py-2.5 rounded-lg btn-gaming-secondary text-[10px] font-black uppercase tracking-wider block"
          >
            Create Your License
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch stats
  const { data: stats } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('user_id', profile.id)
    .maybeSingle();

  // 3. Fetch badges
  const { data: badgesData } = await supabase
    .from('user_badges')
    .select(`
      badge:badges(*)
    `)
    .eq('user_id', profile.id);

  const badges = badgesData || [];

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 select-none relative">
      {/* Dynamic background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gaming-green/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Main card panel */}
      <div className="z-10 p-4 bg-[#0d0f14]/80 border border-border-dark rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <FanCard
          profile={profile as Profile}
          stats={stats as LeaderboardEntry | null}
          badges={badges}
          theme={(profile.card_theme as 'free' | 'gold' | 'neon' | 'galaxy') || 'free'}
          titleBadge={profile.title_badge}
        />
      </div>

      {/* Public Visitor CTA */}
      <div className="z-10 mt-8 max-w-sm w-full px-4 text-center">
        <div className="gaming-panel rounded-2xl p-5 border-gaming-green/35 shadow-lg">
          <h4 className="text-xs font-mono font-black uppercase text-white tracking-widest flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-gaming-green" />
            Claim Your Free Card!
          </h4>
          <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-wider leading-relaxed">
            Predict  World Cup 2026 matches, earn achievements, and design your premium fan card!
          </p>
          <Link
            href="/"
            className="w-full mt-4 py-2.5 rounded-lg btn-gaming-primary text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            Create Your Fan Card
            <Play className="w-3 h-3 fill-black shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
