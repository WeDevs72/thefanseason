'use client';

import React, { useState, useEffect } from 'react';
import { Match, Prediction } from '@/lib/types';
import MatchCard from './MatchCard';
import CountdownTimer from './CountdownTimer';
import TimezoneSelector from './TimezoneSelector';
import { getUserTimezone } from '@/lib/utils';
import { useToast } from './Toast';
import { Star, Search, Shield, Filter, Award } from 'lucide-react';

interface FixturesListProps {
  initialMatches: Match[];
  initialPredictions: Prediction[];
}

const STAGES = ['All', 'Group Stage', 'Round of 16', 'Quarter Final', 'Semi Final', 'Final'];
const GROUPS = ['All', 'Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H', 'Group I', 'Group J', 'Group K', 'Group L'];

export default function FixturesList({ initialMatches, initialPredictions }: FixturesListProps) {
  const { showToast } = useToast();
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [predictions, setPredictions] = useState<Prediction[]>(initialPredictions);
  const [timezone, setTimezone] = useState('UTC');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedGroup, setSelectedGroup] = useState('All');

  useEffect(() => {
    setTimezone(getUserTimezone());
  }, []);

  // Sync predictions locally on submit
  const handlePredictionSubmit = async (
    matchId: number,
    predictedWinner: 'home' | 'away' | 'draw',
    predictedHomeScore: number | null,
    predictedAwayScore: number | null
  ) => {
    try {
      const response = await fetch('/api/predictions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          predictedWinner,
          predictedHomeScore,
          predictedAwayScore,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit prediction');
      }

      // Update local predictions array
      setPredictions((prev) => {
        const index = prev.findIndex((p) => p.match_id === matchId);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = result.prediction;
          return updated;
        }
        return [...prev, result.prediction];
      });

      showToast('success', 'Prediction Saved!', 'Good luck! Points will be awarded post-match.');
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Submission Failed', err.message || 'An error occurred.');
    }
  };

  // Find closest upcoming match for Countdown Timer
  const upcomingMatchesSorted = matches
    .filter((m) => m.status === 'upcoming' && new Date(m.match_date).getTime() > Date.now())
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
  
  const nextMatch = upcomingMatchesSorted[0];

  // Filtering Logic
  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      match.home_team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.away_team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (match.venue || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStage = selectedStage === 'All' || match.stage === selectedStage;
    
    const matchesGroup = selectedGroup === 'All' || match.group_name === selectedGroup;

    return matchesSearch && matchesStage && matchesGroup;
  });

  // Group filtered matches by Date
  const groupedMatches: { [key: string]: Match[] } = {};
  filteredMatches.forEach((match) => {
    try {
      const dateKey = new Date(match.match_date).toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groupedMatches[dateKey]) {
        groupedMatches[dateKey] = [];
      }
      groupedMatches[dateKey].push(match);
    } catch (e) {
      const fallbackKey = 'Matchday Schedule';
      if (!groupedMatches[fallbackKey]) {
        groupedMatches[fallbackKey] = [];
      }
      groupedMatches[fallbackKey].push(match);
    }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full select-none">
      
      {/* Hero Countdown Header Widget */}
      {nextMatch && (
        <div className="gaming-panel rounded-2xl p-6 border-gaming-green/35 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gaming-green opacity-60" />
          
          <span className="bg-gaming-green/10 text-gaming-green border border-gaming-green/20 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-widest inline-flex items-center gap-1.5 leading-none">
            <Star className="w-3 h-3 text-gaming-gold fill-gaming-gold animate-spin" /> Countdown to Kick-off
          </span>

          <h2 className="text-sm sm:text-base font-black uppercase text-white font-mono tracking-widest mt-3">
            {nextMatch.home_team} vs {nextMatch.away_team}
          </h2>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">
            {nextMatch.stage} • {nextMatch.venue}
          </p>

          <div className="mt-5">
            <CountdownTimer targetDate={nextMatch.match_date} />
          </div>
        </div>
      )}

      {/* Control Panels: Timezone & Filters */}
      <div className="gaming-panel p-4 rounded-xl space-y-4 border-border-dark/60 bg-surface/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gaming-green" />
            <h3 className="text-xs font-mono font-black uppercase text-white tracking-widest">
              Fixture Settings
            </h3>
          </div>
          
          {/* Timezone controller */}
          <div className="self-end sm:self-auto">
            <TimezoneSelector onTimezoneChange={(tz) => setTimezone(tz)} />
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search by team name */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search teams or stadiums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0f14] border border-border-dark text-white text-xs rounded-lg pl-9 pr-3 py-2.5 focus:border-gaming-green focus:outline-none"
            />
          </div>

          {/* Filter by Tournament Stage */}
          <div className="relative">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full bg-[#0d0f14] border border-border-dark text-white text-xs rounded-lg px-3 py-2.5 focus:border-gaming-green focus:outline-none font-bold"
            >
              {STAGES.map((s) => (
                <option key={s} value={s} className="bg-surface text-white">
                  {s === 'All' ? 'All Tournament Stages' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Group */}
          <div className="relative">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-[#0d0f14] border border-border-dark text-white text-xs rounded-lg px-3 py-2.5 focus:border-gaming-green focus:outline-none font-bold"
            >
              {GROUPS.map((g) => (
                <option key={g} value={g} className="bg-surface text-white">
                  {g === 'All' ? 'All Group Subdivisions' : g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fixtures List Split */}
      <div className="space-y-8">
        {Object.keys(groupedMatches).length > 0 ? (
          Object.keys(groupedMatches).map((dateKey) => (
            <div key={dateKey} className="space-y-4">
              {/* Date Header line */}
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-mono font-black uppercase text-gaming-green tracking-widest shrink-0">
                  📅 {dateKey}
                </h3>
                <div className="h-[1px] bg-border-dark/60 flex-1" />
              </div>

              {/* Matches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {groupedMatches[dateKey].map((match) => {
                  const matchPred = predictions.find((p) => p.match_id === match.id);
                  return (
                    <MatchCard
                      key={match.id}
                      match={match}
                      prediction={matchPred}
                      onPredictionSubmit={handlePredictionSubmit}
                      timezone={timezone}
                    />
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="gaming-panel rounded-2xl p-12 text-center border-dashed border-border-dark/80">
            <Shield className="w-12 h-12 text-text-muted mx-auto mb-3 animate-pulse" />
            <h4 className="text-sm font-black uppercase text-white font-mono tracking-widest">
              No Matching Fixtures Found
            </h4>
            <p className="text-xs text-text-muted mt-1 uppercase font-bold tracking-wider">
              Adjust your search keywords or subdivision filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStage('All');
                setSelectedGroup('All');
              }}
              className="btn-gaming-primary px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider mt-4"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
