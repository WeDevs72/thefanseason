'use client';

import React from 'react';
import { LeaderboardEntry } from '@/lib/types';
import { Trophy, Flame, Target } from 'lucide-react';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
  isCurrentUser: boolean;
}

export default function LeaderboardRow({ entry, rank, isCurrentUser }: LeaderboardRowProps) {
  const profile = entry.profile;
  const username = profile?.username || 'Unknown';
  const country = profile?.country || 'Unknown';
  const flagEmoji = profile?.country ? getFlagEmoji(profile.country) : '🏳️';
  
  // Custom rank styling
  const getRankBadge = () => {
    if (rank === 1) {
      return (
        <div className="w-6 h-6 rounded-full bg-gaming-gold text-black flex items-center justify-center font-mono font-black text-xs shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-6 h-6 rounded-full bg-slate-300 text-black flex items-center justify-center font-mono font-black text-xs">
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-6 h-6 rounded-full bg-amber-700 text-white flex items-center justify-center font-mono font-black text-xs">
          3
        </div>
      );
    }
    return <span className="font-mono font-bold text-xs text-text-muted">{rank}</span>;
  };

  return (
    <tr
      className={`transition-all ${
        isCurrentUser
          ? 'bg-gaming-green/5 border-l-4 border-l-gaming-green border-y border-y-gaming-green/20'
          : 'border-b border-border-dark hover:bg-surface-hover/20'
      }`}
    >
      {/* Rank */}
      <td className="px-4 py-3 text-center">
        <div className="flex justify-center">{getRankBadge()}</div>
      </td>

      {/* Profile / Username */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold uppercase font-mono ${
            isCurrentUser ? 'border-gaming-green bg-gaming-green/10 text-gaming-green' : 'border-border-dark bg-zinc-800 text-white'
          }`}>
            {username[0]}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${isCurrentUser ? 'text-gaming-green font-extrabold' : 'text-white'}`}>
                {username}
              </span>
              {isCurrentUser && (
                <span className="bg-gaming-green/20 text-gaming-green border border-gaming-green/30 text-[8px] font-black uppercase px-1 py-0.2 rounded leading-none tracking-wider">
                  You
                </span>
              )}
              {profile?.is_premium && (
                <span className="bg-gaming-gold/20 text-gaming-gold border border-gaming-gold/30 text-[8px] font-black uppercase px-1 py-0.2 rounded leading-none tracking-wider shadow-[0_0_5px_rgba(255,215,0,0.2)]">
                  PRO
                </span>
              )}
            </div>
            {profile?.supported_team && (
              <span className="text-[9px] text-text-muted font-bold block leading-tight">
                Support: {profile.supported_team}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Country */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <div className="flex items-center gap-1.5 text-xs text-white">
          <span>{flagEmoji}</span>
          <span className="truncate max-w-[120px]">{country}</span>
        </div>
      </td>

      {/* Predictions Stats */}
      <td className="px-4 py-3 text-center font-mono text-xs font-semibold text-text-muted hidden md:table-cell">
        {entry.correct_predictions} / {entry.total_predictions}
      </td>

      {/* Accuracy */}
      <td className="px-4 py-3 text-center">
        <div className="inline-flex items-center justify-center gap-1 text-xs font-mono font-bold text-white">
          <Target className="w-3.5 h-3.5 text-gaming-neon shrink-0" />
          <span>{Math.round(entry.accuracy_percent)}%</span>
        </div>
      </td>

      {/* Streak */}
      <td className="px-4 py-3 text-center">
        <div className="inline-flex items-center justify-center gap-1 text-xs font-mono font-bold text-white">
          <Flame className={`w-3.5 h-3.5 shrink-0 ${entry.current_streak >= 3 ? 'text-gaming-gold animate-pulse' : 'text-text-muted'}`} />
          <span>{entry.current_streak}</span>
        </div>
      </td>

      {/* Total Points */}
      <td className="px-4 py-3 text-center">
        <div className="inline-flex items-center justify-center gap-1 text-xs font-mono font-black text-gaming-green bg-gaming-green/10 border border-gaming-green/20 px-2 py-0.5 rounded-md">
          <Trophy className="w-3.5 h-3.5 text-gaming-gold fill-gaming-gold" />
          <span>{entry.total_points} PTS</span>
        </div>
      </td>
    </tr>
  );
}

// Simple country name to flag emoji mapper
function getFlagEmoji(countryName: string): string {
  const mapping: { [key: string]: string } = {
    'india': '🇮🇳',
    'united states': '🇺🇸',
    'usa': '🇺🇸',
    'canada': '🇨🇦',
    'mexico': '🇲🇽',
    'brazil': '🇧🇷',
    'argentina': '🇦🇷',
    'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'france': '🇫🇷',
    'germany': '🇩🇪',
    'spain': '🇪🇸',
    'italy': '🇮🇹',
    'portugal': '🇵🇹',
    'netherlands': '🇳🇱',
    'belgium': '🇧🇪',
    'croatia': '🇭🇷',
    'uruguay': '🇺🇾',
    'senegal': '🇸🇳',
    'morocco': '🇲🇦',
    'japan': '🇯🇵',
    'south korea': '🇰🇷',
    'australia': '🇦🇺',
    'saudi arabia': '🇸🇦'
  };
  
  const key = countryName.toLowerCase().trim();
  return mapping[key] || '🏳️';
}
