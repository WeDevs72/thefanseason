'use client';

import React, { useState } from 'react';
import { Match, Prediction } from '@/lib/types';
import { formatMatchDate, getUserTimezone } from '@/lib/utils';
import PredictionForm from './PredictionForm';
import { useAuth } from './AuthContext';
import Link from 'next/link';
import { Calendar, MapPin, ChevronDown, ChevronUp, Lock } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  prediction?: Prediction | null;
  onPredictionSubmit?: (matchId: number, winner: 'home' | 'away' | 'draw', homeScore: number | null, awayScore: number | null) => Promise<void>;
  timezone: string;
}

export default function MatchCard({ match, prediction, onPredictionSubmit, timezone }: MatchCardProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const isMatchStarted = new Date(match.match_date).getTime() < Date.now();
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  
  // Format local date
  const formattedDate = formatMatchDate(match.match_date, timezone);

  // Status badge styles
  const getStatusBadge = () => {
    if (isFinished) {
      return (
        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">
          Finished
        </span>
      );
    }
    if (isLive) {
      return (
        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-950 text-red-500 border border-red-800 animate-pulse">
          Live
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-gaming-green/10 text-gaming-green border border-gaming-green/30">
        Upcoming
      </span>
    );
  };

  // Team avatar fallback helper
  const TeamLogo = ({ name, logo }: { name: string; logo: string | null }) => {
    if (logo) {
      return (
        <img
          src={logo}
          alt={name}
          className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }
    
    // Short letters fallback
    const initials = name.slice(0, 3).toUpperCase();
    return (
      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-border-dark flex items-center justify-center font-mono font-black text-xs text-white">
        {initials}
      </div>
    );
  };

  return (
    <div className="gaming-panel rounded-xl overflow-hidden transition-all duration-300 hover:border-gaming-green/40">
      {/* Top Meta Info Bar */}
      <div className="px-4 py-2 border-b border-border-dark bg-background/40 flex items-center justify-between text-[10px] text-text-muted font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <span>{match.stage}</span>
          {match.group_name && (
            <>
              <span className="text-border-dark">•</span>
              <span>{match.group_name}</span>
            </>
          )}
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Main Scoreboard Layout */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center text-center gap-2 select-none">
          <TeamLogo name={match.home_team} logo={match.home_team_logo} />
          <span className="text-xs sm:text-sm font-bold tracking-wide text-white font-mono truncate max-w-full">
            {match.home_team}
          </span>
        </div>

        {/* Score/Time Center Section */}
        <div className="flex flex-col items-center justify-center text-center px-2 min-w-[100px]">
          {isFinished || isLive ? (
            <div className="flex items-center gap-3 font-mono font-black text-2xl sm:text-3xl text-white tracking-widest bg-black/40 px-3 py-1 rounded-lg border border-border-dark">
              <span className={isLive && match.home_score !== null ? 'text-gaming-green' : ''}>
                {match.home_score !== null ? match.home_score : '-'}
              </span>
              <span className="text-border-dark text-lg">:</span>
              <span className={isLive && match.away_score !== null ? 'text-gaming-green' : ''}>
                {match.away_score !== null ? match.away_score : '-'}
              </span>
            </div>
          ) : (
            <div className="text-[10px] sm:text-xs text-white font-mono font-black uppercase tracking-wider bg-black/40 px-2.5 py-1 rounded border border-border-dark flex flex-col items-center">
              <span className="text-gaming-green">{formattedDate.split(',')[1]?.trim() || formattedDate}</span>
              <span className="text-[9px] text-text-muted font-bold mt-0.5">{formattedDate.split(',')[0]}</span>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center text-center gap-2 select-none">
          <TeamLogo name={match.away_team} logo={match.away_team_logo} />
          <span className="text-xs sm:text-sm font-bold tracking-wide text-white font-mono truncate max-w-full">
            {match.away_team}
          </span>
        </div>
      </div>

      {/* Match Details: Venue & Date */}
      <div className="px-4 pb-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-text-muted font-bold uppercase tracking-wider border-t border-border-dark/30 pt-3">
        <div className="flex items-center gap-1.5 truncate max-w-[200px]">
          <MapPin className="w-3.5 h-3.5 text-gaming-green shrink-0" />
          <span className="truncate">{match.venue || 'Stadium'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gaming-neon" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Predictions Drawer Trigger */}
      {onPredictionSubmit && (
        <div className="border-t border-border-dark bg-[#0a0c10]/60">
          {!user ? (
            <Link
              href="/auth"
              className="w-full py-2.5 text-center text-xs font-bold text-gaming-green hover:underline uppercase tracking-wider block"
            >
              🔐 Sign in to make predictions
            </Link>
          ) : (
            <div>
              {prediction ? (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="w-full py-2.5 px-4 flex items-center justify-between text-xs font-mono font-bold text-gaming-green hover:bg-surface-hover/30 transition-colors uppercase tracking-wider"
                >
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-gaming-gold" />
                    <span>
                      Prediction: {prediction.predicted_winner.toUpperCase()} (
                      {prediction.predicted_home_score !== null ? prediction.predicted_home_score : '?'} -{' '}
                      {prediction.predicted_away_score !== null ? prediction.predicted_away_score : '?'})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    {prediction.points_earned > 0 && (
                      <span className="text-gaming-gold bg-gaming-gold/10 px-1.5 py-0.5 rounded mr-2 border border-gaming-gold/20">
                        +{prediction.points_earned} PTS
                      </span>
                    )}
                    {isMatchStarted ? 'LOCKED' : showForm ? 'HIDE' : 'EDIT'}
                    {showForm ? <ChevronUp className="w-4 h-4 ml-0.5" /> : <ChevronDown className="w-4 h-4 ml-0.5" />}
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="w-full py-2.5 px-4 flex items-center justify-between text-xs font-bold text-white hover:bg-surface-hover/30 transition-colors uppercase tracking-wider"
                >
                  <span>🤖 Submit your prediction</span>
                  <div className="flex items-center">
                    {showForm ? 'CLOSE' : 'PREDICT'}
                    {showForm ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                  </div>
                </button>
              )}

              {/* Form Drawer */}
              {showForm && (
                <div className="p-4 border-t border-border-dark bg-background/50">
                  <PredictionForm
                    match={match}
                    existingPrediction={prediction}
                    onSubmit={async (winner, homeScore, awayScore) => {
                      await onPredictionSubmit(match.id, winner, homeScore, awayScore);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
