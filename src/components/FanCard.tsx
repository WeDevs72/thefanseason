'use client';

import React, { forwardRef } from 'react';
import { Profile, LeaderboardEntry, UserBadge } from '@/lib/types';
import { Trophy, Flame, Target, Award, Star } from 'lucide-react';

interface FanCardProps {
  profile: Profile;
  stats?: LeaderboardEntry | null;
  badges?: any[] | null;
  theme?: 'free' | 'gold' | 'neon' | 'galaxy';
  titleBadge?: string | null;
}

const FanCard = forwardRef<HTMLDivElement, FanCardProps>(({
  profile,
  stats,
  badges,
  theme = 'free',
  titleBadge
}, ref) => {
  const username = profile.username || 'Fan';
  const fullName = profile.full_name || 'World Cup Predictor';
  const supportedTeam = profile.supported_team || 'Neutral';
  const country = profile.country || 'Unknown';

  // Calculate defaults
  const totalPredictions = stats?.total_predictions ?? 0;
  const accuracyPercent = stats?.accuracy_percent ? Math.round(Number(stats.accuracy_percent)) : 0;
  const currentStreak = stats?.current_streak ?? 0;
  const rank = stats?.rank ?? '1000+';
  const tier = profile.fan_card_tier || 'rookie';

  // Background pattern CSS
  const cardThemeStyles = {
    free: 'bg-zinc-950 border border-zinc-800 text-white',
    gold: 'card-premium-gold text-white',
    neon: 'card-premium-neon text-white',
    galaxy: 'card-premium-galaxy text-white'
  };

  // Flag emoji mapper helper
  const getFlagEmoji = (c: string) => {
    const mapping: { [key: string]: string } = {
      'india': '🇮🇳', 'united states': '🇺🇸', 'usa': '🇺🇸', 'canada': '🇨🇦', 'mexico': '🇲🇽',
      'brazil': '🇧🇷', 'argentina': '🇦🇷', 'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'france': '🇫🇷', 'germany': '🇩🇪',
      'spain': '🇪🇸', 'italy': '🇮🇹', 'portugal': '🇵🇹', 'netherlands': '🇳🇱', 'belgium': '🇧🇪',
      'croatia': '🇭🇷', 'uruguay': '🇺🇾', 'senegal': '🇸🇳', 'morocco': '🇲🇦', 'japan': '🇯🇵',
      'south korea': '🇰🇷', 'australia': '🇦🇺', 'saudi arabia': '🇸🇦'
    };
    return mapping[c.toLowerCase().trim()] || '🏳️';
  };

  const isPremium = profile.is_premium && theme !== 'free';

  return (
    <div
      ref={ref}
      className={`w-[320px] h-[480px] rounded-2xl relative p-5 flex flex-col justify-between overflow-hidden shadow-2xl transition-all select-none border-t-4 ${cardThemeStyles[theme]
        }`}
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.03) 0%, transparent 80%)',
        borderTopColor: theme === 'gold' ? '#FFD700' : theme === 'neon' ? '#00C853' : theme === 'galaxy' ? '#8B5CF6' : '#1F2937'
      }}
    >
      {/* Cyber Grid Sub-Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Futuristic Scanline Layer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

      {/* TOP HEADER BLOCK: Card Tier & Title Badge */}
      <div className="flex items-center justify-between z-10">
        <span className={`font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest border ${tier === 'legend' ? 'bg-gaming-gold/20 text-gaming-gold border-gaming-gold/30' :
            tier === 'expert' ? 'bg-gaming-neon/20 text-gaming-neon border-gaming-neon/30' :
              tier === 'analyst' ? 'bg-gaming-purple/20 text-gaming-purple border-gaming-purple/30' :
                'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}>
          {tier}
        </span>

        {isPremium && titleBadge && (
          <span className="flex items-center gap-1 bg-white/10 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-white/20 uppercase tracking-wider">
            <Star className="w-2.5 h-2.5 text-gaming-gold fill-gaming-gold" />
            {titleBadge}
          </span>
        )}
      </div>

      {/* MAIN BIO ROW: Avatar circle & User Details */}
      <div className="flex flex-col items-center justify-center text-center mt-3 z-10 gap-2">
        {/* Avatar */}
        <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center font-mono font-black text-3xl shadow-lg relative ${theme === 'gold' ? 'border-gaming-gold bg-gaming-gold/10 text-gaming-gold' :
            theme === 'neon' ? 'border-gaming-green bg-gaming-green/10 text-gaming-green' :
              theme === 'galaxy' ? 'border-gaming-purple bg-gaming-purple/10 text-gaming-purple' :
                'border-zinc-700 bg-zinc-800 text-white'
          }`}>
          {username[0]?.toUpperCase()}
          {/* Pro tag overlay */}
          {profile.is_premium && (
            <div className="absolute -bottom-1 -right-1 bg-gaming-gold text-black rounded px-1.5 py-0.2 font-mono text-[7px] font-black uppercase border border-black tracking-widest shadow">
              PRO
            </div>
          )}
        </div>

        {/* Name block */}
        <div>
          <h2 className="text-lg font-black tracking-wider text-white uppercase font-mono leading-none">
            {username}
          </h2>
          <p className="text-[10px] text-zinc-400 font-bold mt-1 tracking-wide">
            {fullName}
          </p>
        </div>

        {/* Flags and Teams */}
        <div className="flex items-center gap-2 mt-1 bg-black/40 px-3 py-1 rounded-full border border-border-dark/60">
          <span className="text-xs">{getFlagEmoji(country)}</span>
          <span className="text-[8px] font-black uppercase tracking-wider text-zinc-300">
            {country}
          </span>
          <span className="text-zinc-600 font-black">|</span>
          <span className="text-[8px] font-black uppercase tracking-wider text-gaming-green">
            ⚽ {supportedTeam}
          </span>
        </div>
      </div>

      {/* STATS MATRIX SECTION */}
      <div className="grid grid-cols-2 gap-2 mt-4 z-10">
        {/* Stat 1: Predictions Count */}
        <div className="bg-[#0b0c10]/80 p-2.5 rounded-lg border border-border-dark flex items-center gap-2.5">
          <Award className="w-5 h-5 text-gaming-neon" />
          <div className="flex flex-col">
            <span className="text-[7px] text-zinc-500 font-bold uppercase leading-none tracking-wider">Predicts</span>
            <span className="font-mono text-sm font-black text-white leading-none mt-1">{totalPredictions}</span>
          </div>
        </div>

        {/* Stat 2: Accuracy Ratio */}
        <div className="bg-[#0b0c10]/80 p-2.5 rounded-lg border border-border-dark flex items-center gap-2.5">
          <Target className="w-5 h-5 text-gaming-green" />
          <div className="flex flex-col">
            <span className="text-[7px] text-zinc-500 font-bold uppercase leading-none tracking-wider">Accuracy</span>
            <span className="font-mono text-sm font-black text-white leading-none mt-1">{accuracyPercent}%</span>
          </div>
        </div>

        {/* Stat 3: Leaderboard Rank */}
        <div className="bg-[#0b0c10]/80 p-2.5 rounded-lg border border-border-dark flex items-center gap-2.5">
          <Trophy className="w-5 h-5 text-gaming-gold" />
          <div className="flex flex-col">
            <span className="text-[7px] text-zinc-500 font-bold uppercase leading-none tracking-wider">Rank</span>
            <span className="font-mono text-sm font-black text-white leading-none mt-1">#{rank}</span>
          </div>
        </div>

        {/* Stat 4: Active Win Streak */}
        <div className="bg-[#0b0c10]/80 p-2.5 rounded-lg border border-border-dark flex items-center gap-2.5">
          <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[7px] text-zinc-500 font-bold uppercase leading-none tracking-wider">Streak</span>
            <span className="font-mono text-sm font-black text-white leading-none mt-1">{currentStreak}</span>
          </div>
        </div>
      </div>

      {/* ACHIEVEMENTS / BADGES CONTAINER */}
      <div className="mt-4 z-10">
        <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest text-center mb-1.5">
          Earned Badges
        </p>

        <div className="flex items-center justify-center gap-2.5 min-h-[28px] bg-black/30 py-1 px-2 rounded-lg border border-border-dark/30">
          {badges && badges.length > 0 ? (
            badges.slice(0, 5).map((ub, idx) => {
              const b = ub.badge || ub;
              return (
                <div
                  key={idx}
                  title={b.name}
                  className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs shadow hover:scale-110 transition-transform cursor-help"
                >
                  {b.icon || '🏆'}
                </div>
              );
            })
          ) : (
            <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
              No Badges Earned
            </span>
          )}
        </div>
      </div>

      {/* BRANDING STRIP */}
      <div className="border-t border-border-dark/40 pt-2.5 text-center mt-3 z-10">
        <span className="font-mono text-[8px] font-black tracking-widest text-zinc-500">
          <span className="text-gaming-green">THEFANSEASON</span> 2026
        </span>
      </div>
    </div>
  );
});

FanCard.displayName = 'FanCard';

export default FanCard;
