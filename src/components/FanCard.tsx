'use client';

import React, { forwardRef } from 'react';
import { Profile, LeaderboardEntry, UserBadge } from '@/lib/types';
import { Trophy, Flame, Target, Award, Star } from 'lucide-react';

interface FanCardProps {
  profile: Profile;
  stats?: LeaderboardEntry | null;
  badges?: any[] | null;
  theme?: string;
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
  const avatarLetter = username[0]?.toUpperCase() || 'U';
  const isShield = theme.startsWith('shield_');
  let shieldStyle = 'classic';
  let shieldColor = 'blue';

  if (isShield) {
    const parts = theme.split('_');
    if (parts.length === 2) {
      shieldStyle = 'classic';
      shieldColor = parts[1] || 'blue';
    } else if (parts.length === 3) {
      shieldStyle = parts[1] || 'classic';
      shieldColor = parts[2] || 'blue';
    }
  }

  const shieldClipPaths = {
    classic: 'polygon(0% 0%, 100% 0%, 100% 88%, 50% 100%, 0% 88%)',
    apex: 'polygon(0% 0%, 100% 0%, 100% 80%, 50% 100%, 0% 80%)',
    cyber: 'polygon(12% 0%, 88% 0%, 100% 12%, 100% 88%, 50% 100%, 0% 88%, 0% 12%)',
    banner: 'polygon(0% 0%, 50% 4%, 100% 0%, 100% 88%, 50% 100%, 0% 88%)',
    titan: 'polygon(0% 12%, 50% 0%, 100% 12%, 100% 85%, 50% 100%, 0% 85%)'
  };

  const shieldColorData = {
    blue: {
      bg: 'from-[#0a1e3f] to-[#040810]',
      border: 'from-[#00E5FF] to-[#3B82F6]',
      glow: 'shadow-[0_0_25px_rgba(0,229,255,0.3)] border-[#00E5FF]/30',
      sphere: 'bg-[#00E5FF] shadow-[0_0_12px_#00E5FF]',
      textAccent: 'text-gaming-neon',
    },
    gold: {
      bg: 'from-[#2a1d04] to-[#080501]',
      border: 'from-[#FFD700] to-[#D97706]',
      glow: 'shadow-[0_0_25px_rgba(255,215,0,0.3)] border-[#FFD700]/30',
      sphere: 'bg-[#FFD700] shadow-[0_0_12px_#FFD700]',
      textAccent: 'text-gaming-gold',
    },
    red: {
      bg: 'from-[#2c050a] to-[#0a0203]',
      border: 'from-[#EF4444] to-[#991B1B]',
      glow: 'shadow-[0_0_25px_rgba(239,68,68,0.3)] border-[#EF4444]/30',
      sphere: 'bg-[#EF4444] shadow-[0_0_12px_#EF4444]',
      textAccent: 'text-red-500',
    },
    green: {
      bg: 'from-[#012211] to-[#020804]',
      border: 'from-[#00C853] to-[#065F46]',
      glow: 'shadow-[0_0_25px_rgba(0,200,83,0.3)] border-[#00C853]/30',
      sphere: 'bg-[#00C853] shadow-[0_0_12px_#00C853]',
      textAccent: 'text-gaming-green',
    },
    purple: {
      bg: 'from-[#1c082e] to-[#06020a]',
      border: 'from-[#A855F7] to-[#5B21B6]',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.3)] border-[#A855F7]/30',
      sphere: 'bg-[#A855F7] shadow-[0_0_12px_#A855F7]',
      textAccent: 'text-purple-400',
    },
    orange: {
      bg: 'from-[#2d1203] to-[#090300]',
      border: 'from-[#F97316] to-[#C2410C]',
      glow: 'shadow-[0_0_25px_rgba(249,115,22,0.3)] border-[#F97316]/30',
      sphere: 'bg-[#F97316] shadow-[0_0_12px_#F97316]',
      textAccent: 'text-orange-400',
    },
    cyan: {
      bg: 'from-[#031d26] to-[#01060a]',
      border: 'from-[#06B6D4] to-[#0891B2]',
      glow: 'shadow-[0_0_25px_rgba(6,182,212,0.3)] border-[#06B6D4]/30',
      sphere: 'bg-[#06B6D4] shadow-[0_0_12px_#06B6D4]',
      textAccent: 'text-cyan-400',
    },
    pink: {
      bg: 'from-[#2b031b] to-[#0a0006]',
      border: 'from-[#EC4899] to-[#BE185D]',
      glow: 'shadow-[0_0_25px_rgba(236,72,153,0.3)] border-[#EC4899]/30',
      sphere: 'bg-[#EC4899] shadow-[0_0_12px_#EC4899]',
      textAccent: 'text-pink-400',
    }
  };

  const futTheme = (isShield ? 'free' : theme) as 'free' | 'gold' | 'neon' | 'galaxy';
  const clipPathVal = shieldClipPaths[shieldStyle as keyof typeof shieldClipPaths] || shieldClipPaths.classic;
  const sTheme = shieldColorData[shieldColor as keyof typeof shieldColorData] || shieldColorData.blue;

  if (isShield) {
    const ratingValue = stats?.accuracy_percent ? Math.round(Number(stats.accuracy_percent)) : 65;

    return (
      <div
        ref={ref}
        className={`fancard-component w-[320px] h-[480px] relative transition-all duration-300 hover:scale-[1.02] ${sTheme.glow}`}
        style={{
          clipPath: clipPathVal,
        }}
      >
        {/* Outer border wrapper */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${sTheme.border}`}
          style={{ clipPath: clipPathVal }}
        >
          {/* Inner card background */}
          <div 
            className={`absolute inset-[1.5px] p-5 flex flex-col justify-between overflow-hidden bg-gradient-to-b ${sTheme.bg}`}
            style={{ clipPath: clipPathVal }}
          >
            {/* Background grid */}
            <div className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 50% 30%, rgba(255,255,255,0.06) 0%, transparent 60%),
                  linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 20px 20px, 20px 20px'
              }}
            />

            {/* Glowing wireframe hexagon design behind player portrait */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[180px] h-[180px] border border-white/5 rotate-45 pointer-events-none flex items-center justify-center">
              <div className="w-[140px] h-[140px] border border-white/5 rotate-45" />
            </div>

            {/* TOP BAR */}
            <div className="flex items-start justify-between z-10">
              {/* Top Left: Season & Rarity Serial */}
              <div className="flex flex-col font-mono">
                <span className="text-[9px] font-bold text-white/50 tracking-wider">2026-27</span>
                <span className="text-[12px] font-black text-white leading-none mt-1 tracking-widest">
                  {stats?.rank ? `1/${stats.rank}` : '1/100'}
                </span>
              </div>
              
              {/* Top Right: Flag & Rating Score */}
              <div className="flex flex-col items-end font-mono">
                <span className="text-sm leading-none">{getFlagEmoji(country)}</span>
                <span className={`text-[15px] font-black leading-none mt-1 ${sTheme.textAccent}`}>
                  {ratingValue}
                </span>
              </div>
            </div>

            {/* CENTER PORTRAIT AREA */}
            <div className="flex flex-col items-center justify-center z-10 relative">
              <div className="w-32 h-32 relative flex items-center justify-center overflow-hidden border border-white/10 bg-black/40"
                style={{
                  clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'
                }}
              >
                {/* Image inset */}
                <div className={`absolute inset-[2px] bg-gradient-to-b ${sTheme.bg} flex items-center justify-center`}
                  style={{
                    clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'
                  }}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={username}
                      className="w-full h-full object-cover scale-[1.05]"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center font-mono font-black text-4xl bg-white/5 ${sTheme.textAccent}`}>
                      {avatarLetter}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LOWER BIO INFO */}
            <div className="flex flex-col items-center justify-center text-center z-10 relative">
              <h2 className="text-xl font-black uppercase text-white font-mono leading-none tracking-wider select-text">
                {username}
              </h2>
              {titleBadge && (
                <span className="bg-white/5 border border-white/10 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mt-1.5 inline-block">
                  {titleBadge}
                </span>
              )}
            </div>

            {/* BOTTOM STATS MATRIX */}
            <div className="grid grid-cols-3 gap-1 z-10 relative mt-2 bg-black/45 border border-white/5 p-2 rounded-xl">
              <div className="text-center border-r border-white/5">
                <span className="text-[7px] text-white/45 font-bold uppercase tracking-wider block">Points</span>
                <span className="font-mono text-xs font-black text-white block mt-0.5">{stats?.total_points ?? 0}</span>
              </div>
              <div className="text-center border-r border-white/5">
                <span className="text-[7px] text-white/45 font-bold uppercase tracking-wider block">Tier</span>
                <span className={`font-mono text-[9px] font-bold block mt-1 uppercase ${sTheme.textAccent}`}>{tier}</span>
              </div>
              <div className="text-center">
                <span className="text-[7px] text-white/45 font-bold uppercase tracking-wider block">Streak</span>
                <span className="font-mono text-xs font-black text-white block mt-0.5">🔥 {currentStreak}</span>
              </div>
            </div>

            {/* BOTTOM Brand & Seal Ball */}
            <div className="flex flex-col items-center justify-center gap-1.5 mt-2 z-10 relative">
              <div className="text-[7px] font-mono text-white/30 uppercase tracking-widest leading-none">
                THEFANSEASON CARD SYSTEM
              </div>
              
              {/* Colored marble sphere seal */}
              <div className={`w-2.5 h-2.5 rounded-full mb-1 ${sTheme.sphere}`} />
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`fancard-component w-[320px] h-[480px] rounded-2xl relative p-5 flex flex-col justify-between overflow-hidden shadow-2xl transition-all select-none border-t-4 ${cardThemeStyles[futTheme]
        }`}
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.03) 0%, transparent 80%)',
        borderTopColor: futTheme === 'gold' ? '#FFD700' : futTheme === 'neon' ? '#00C853' : futTheme === 'galaxy' ? '#8B5CF6' : '#1F2937'
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
