'use client';

import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '@/lib/types';
import LeaderboardRow from './LeaderboardRow';
import { useAuth } from './AuthContext';
import { Search, Globe, Trophy, ArrowLeft, ArrowRight, Award } from 'lucide-react';

interface LeaderboardListProps {
  initialEntries: LeaderboardEntry[];
}

const ITEMS_PER_PAGE = 25;

export default function LeaderboardList({ initialEntries }: LeaderboardListProps) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries);
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique list of countries
  const countries = ['All', ...Array.from(new Set(
    initialEntries
      .map(e => e.profile?.country)
      .filter((c): c is string => !!c && c !== 'Unknown')
  ))].sort();

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const username = entry.profile?.username || '';
    const country = entry.profile?.country || '';
    
    const matchesSearch = username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'All' || country === selectedCountry;
    
    return matchesSearch && matchesCountry;
  });

  // Re-calculate ranks of filtered entries relative to themselves, or keep global ranks
  // The user prompt says "Global / By Country" which implies filtering down the global rankings.
  // We'll keep global rank values so players know where they stand globally even when looking at country list.
  
  // Pagination details
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
  }, [searchQuery, selectedCountry]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full select-none">
      
      {/* Reset Alert Badge */}
      <div className="bg-gaming-gold/15 border border-gaming-gold/30 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-gaming-gold animate-bounce shrink-0" />
          <div>
            <h4 className="text-xs font-mono font-black uppercase text-white tracking-widest">
              Weekly Top Predictor Reset
            </h4>
            <p className="text-[10px] text-text-muted mt-0.5 uppercase font-bold tracking-wider leading-relaxed">
              Every Sunday at 00:00 UTC, the top active predictor receives the <span className="text-gaming-gold">Weekly Champion Badge 👑</span>!
            </p>
          </div>
        </div>
        <span className="bg-gaming-gold text-black font-mono font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
          Weekly Prize
        </span>
      </div>

      {/* Search & Filter Panels */}
      <div className="gaming-panel p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-border-dark/60 bg-surface/50">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-gaming-gold" />
          <h3 className="text-xs font-mono font-black uppercase text-white tracking-widest">
            Rankings Filter
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Username Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search predictor usernames..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0f14] border border-border-dark text-white text-xs rounded-lg pl-9 pr-3 py-2 focus:border-gaming-green focus:outline-none"
            />
          </div>

          {/* Country Selection */}
          <div className="relative flex-1 sm:w-56">
            <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gaming-green" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-[#0d0f14] border border-border-dark text-white text-xs rounded-lg pl-9 pr-3 py-2.5 focus:border-gaming-green focus:outline-none font-bold"
            >
              <option value="All" className="bg-surface text-white">Global (All Countries)</option>
              {countries.filter(c => c !== 'All').map((c) => (
                <option key={c} value={c} className="bg-surface text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="gaming-panel rounded-xl overflow-hidden border border-border-dark/60 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#0c0d12]/90 border-b border-border-dark text-[9px] text-text-muted font-bold uppercase tracking-widest">
                <th className="py-3 px-4 text-center w-[60px]">Rank</th>
                <th className="py-3 px-4">Predictor</th>
                <th className="py-3 px-4 hidden sm:table-cell">Country</th>
                <th className="py-3 px-4 text-center hidden md:table-cell">Correct</th>
                <th className="py-3 px-4 text-center w-[90px]">Accuracy</th>
                <th className="py-3 px-4 text-center w-[80px]">Streak</th>
                <th className="py-3 px-4 text-center w-[120px]">Points</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEntries.length > 0 ? (
                paginatedEntries.map((entry) => (
                  <LeaderboardRow
                    key={entry.user_id}
                    entry={entry}
                    rank={entry.rank || 0}
                    isCurrentUser={user?.id === entry.user_id}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-text-muted font-bold uppercase tracking-wider">
                    No predictors match the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border-dark/30 pt-4 text-xs select-none">
          <span className="text-text-muted">
            Showing Page <span className="font-bold text-white">{currentPage}</span> of{' '}
            <span className="font-bold text-white">{totalPages}</span>
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-surface border border-border-dark text-white hover:border-gaming-green/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-surface border border-border-dark text-white hover:border-gaming-green/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
