'use client';

import React, { useState } from 'react';
import { Match, Prediction } from '@/lib/types';
import { Trophy, CheckCircle, Info } from 'lucide-react';

interface PredictionFormProps {
  match: Match;
  existingPrediction?: Prediction | null;
  onSubmit: (winner: 'home' | 'away' | 'draw', homeScore: number | null, awayScore: number | null) => Promise<void>;
}

export default function PredictionForm({ match, existingPrediction, onSubmit }: PredictionFormProps) {
  const [winner, setWinner] = useState<'home' | 'away' | 'draw' | null>(
    existingPrediction ? (existingPrediction.predicted_winner as 'home' | 'away' | 'draw') : null
  );
  const [homeScore, setHomeScore] = useState<string>(
    existingPrediction?.predicted_home_score !== undefined && existingPrediction?.predicted_home_score !== null
      ? String(existingPrediction.predicted_home_score)
      : ''
  );
  const [awayScore, setAwayScore] = useState<string>(
    existingPrediction?.predicted_away_score !== undefined && existingPrediction?.predicted_away_score !== null
      ? String(existingPrediction.predicted_away_score)
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isMatchStarted = new Date(match.match_date).getTime() < Date.now();

  const handlePredictWinner = (choice: 'home' | 'away' | 'draw') => {
    if (isMatchStarted || existingPrediction && isMatchStarted) return;
    setWinner(choice);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!winner || isMatchStarted) return;

    setLoading(true);
    try {
      const hScore = homeScore.trim() !== '' ? parseInt(homeScore) : null;
      const aScore = awayScore.trim() !== '' ? parseInt(awayScore) : null;
      
      await onSubmit(winner, hScore, aScore);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isLocked = isMatchStarted;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {/* Choice Selector Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Home Win Button */}
        <button
          type="button"
          disabled={isLocked}
          onClick={() => handlePredictWinner('home')}
          className={`p-3 rounded-lg border text-center font-bold text-xs uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 ${
            winner === 'home'
              ? 'border-gaming-green bg-gaming-green/10 text-gaming-green shadow-[0_0_12px_rgba(0,200,83,0.2)]'
              : 'border-border-dark bg-background text-text-muted hover:border-gaming-green/35 hover:text-white'
          } ${isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
        >
          <span className="text-center font-mono truncate max-w-full">{match.home_team}</span>
          <span className="text-[10px] font-black tracking-widest opacity-80">Win</span>
        </button>

        {/* Draw Button */}
        <button
          type="button"
          disabled={isLocked}
          onClick={() => handlePredictWinner('draw')}
          className={`p-3 rounded-lg border text-center font-bold text-xs uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 ${
            winner === 'draw'
              ? 'border-gaming-green bg-gaming-green/10 text-gaming-green shadow-[0_0_12px_rgba(0,200,83,0.2)]'
              : 'border-border-dark bg-background text-text-muted hover:border-gaming-green/35 hover:text-white'
          } ${isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
        >
          <span>Draw</span>
          <span className="text-[10px] font-black tracking-widest opacity-80">Equal</span>
        </button>

        {/* Away Win Button */}
        <button
          type="button"
          disabled={isLocked}
          onClick={() => handlePredictWinner('away')}
          className={`p-3 rounded-lg border text-center font-bold text-xs uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 ${
            winner === 'away'
              ? 'border-gaming-green bg-gaming-green/10 text-gaming-green shadow-[0_0_12px_rgba(0,200,83,0.2)]'
              : 'border-border-dark bg-background text-text-muted hover:border-gaming-green/35 hover:text-white'
          } ${isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
        >
          <span className="text-center font-mono truncate max-w-full">{match.away_team}</span>
          <span className="text-[10px] font-black tracking-widest opacity-80">Win</span>
        </button>
      </div>

      {/* Bonus Exact Scores inputs */}
      <div className="p-3 bg-[#0d0f14] border border-border-dark rounded-lg">
        <div className="flex items-center gap-1.5 text-[10px] text-gaming-gold font-bold uppercase tracking-wider mb-2">
          <Trophy className="w-3.5 h-3.5" />
          <span>Bonus: Predict Exact Score (+2 points)</span>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-text-muted font-bold truncate max-w-[80px]">
              {match.home_team}
            </span>
            <input
              type="number"
              min="0"
              disabled={isLocked}
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              placeholder="0"
              className="w-12 py-1.5 text-center bg-background border border-border-dark text-white rounded font-mono font-bold focus:border-gaming-green focus:outline-none"
            />
          </div>

          <span className="text-sm font-bold text-border-dark mt-4">-</span>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-text-muted font-bold truncate max-w-[80px]">
              {match.away_team}
            </span>
            <input
              type="number"
              min="0"
              disabled={isLocked}
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              placeholder="0"
              className="w-12 py-1.5 text-center bg-background border border-border-dark text-white rounded font-mono font-bold focus:border-gaming-green focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Info Tooltip Points explanation */}
      <div className="flex items-start gap-1.5 text-[10px] text-text-muted leading-tight">
        <Info className="w-3.5 h-3.5 text-gaming-neon shrink-0" />
        <span>Points: Winner correct = 1 pt. Winner + Exact Score = 3 pts. Match locks when kick-off starts.</span>
      </div>

      {/* Submit Button */}
      {!isLocked && (
        <button
          type="submit"
          disabled={loading || !winner}
          className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            success 
              ? 'bg-gaming-green text-black font-black' 
              : 'btn-gaming-primary'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : success ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved!
            </>
          ) : existingPrediction ? (
            'Update Prediction'
          ) : (
            'Lock Prediction'
          )}
        </button>
      )}

      {isLocked && existingPrediction && (
        <div className="py-2.5 px-3 rounded-lg border border-border-dark/60 bg-surface/50 text-center text-xs font-mono font-bold text-text-muted flex items-center justify-center gap-2 select-none uppercase tracking-wider">
          🔒 Prediction Locked: {existingPrediction.predicted_winner.toUpperCase()} (
          {existingPrediction.predicted_home_score !== null ? existingPrediction.predicted_home_score : '?'} -{' '}
          {existingPrediction.predicted_away_score !== null ? existingPrediction.predicted_away_score : '?'})
        </div>
      )}
    </form>
  );
}
