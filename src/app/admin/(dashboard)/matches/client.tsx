'use client';

import React, { useState } from 'react';
import { Calendar, Plus, X, Check, Edit2, AlertTriangle } from 'lucide-react';

type MatchStatus = 'upcoming' | 'live' | 'finished';

const statusColors: Record<MatchStatus, string> = {
  upcoming: 'text-gaming-neon border-gaming-neon/30 bg-gaming-neon/5',
  live: 'text-gaming-green border-gaming-green/40 bg-gaming-green/10',
  finished: 'text-zinc-400 border-zinc-700 bg-zinc-800/50',
};

const defaultNewMatch = {
  home_team: '',
  away_team: '',
  match_date: '',
  stage: '',
  group_name: '',
  venue: '',
};

export default function AdminMatchesClient({ initialMatches }: { initialMatches: any[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [filter, setFilter] = useState<'all' | MatchStatus>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMatch, setNewMatch] = useState(defaultNewMatch);
  const [addLoading, setAddLoading] = useState(false);
  const [editingScore, setEditingScore] = useState<{ matchId: number; home: string; away: string; status: MatchStatus } | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = filter === 'all' ? matches : matches.filter(m => m.status === filter);

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatch.home_team || !newMatch.away_team || !newMatch.match_date) return;
    setAddLoading(true);
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMatch),
      });
      const data = await res.json();
      if (res.ok) {
        setMatches(prev => [data.match, ...prev]);
        setNewMatch(defaultNewMatch);
        setShowAddForm(false);
        showToast('success', 'Match created successfully!');
      } else {
        showToast('error', data.error || 'Failed to create match');
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateScore = async () => {
    if (!editingScore) return;
    setScoreLoading(true);
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: editingScore.matchId,
          home_score: parseInt(editingScore.home) || 0,
          away_score: parseInt(editingScore.away) || 0,
          status: editingScore.status,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMatches(prev => prev.map(m =>
          m.id === editingScore.matchId
            ? { ...m, home_score: parseInt(editingScore.home), away_score: parseInt(editingScore.away), status: editingScore.status }
            : m
        ));
        setEditingScore(null);
        showToast('success', 'Match updated! Predictions scored.');
      } else {
        showToast('error', data.error || 'Update failed');
      }
    } finally {
      setScoreLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider shadow-xl border ${
          toast.type === 'success' ? 'bg-gaming-green/10 border-gaming-green/30 text-gaming-green' : 'bg-red-950/50 border-red-800/50 text-red-400'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-mono font-black uppercase tracking-widest text-white">
            Match <span className="text-gaming-green">Management</span>
          </h1>
          <p className="text-[11px] text-text-muted font-bold mt-1 uppercase tracking-wider">
            {matches.length} total matches
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg btn-gaming-primary text-xs font-black uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          Add Match
        </button>
      </div>

      {/* Add Match Form */}
      {showAddForm && (
        <div className="gaming-panel rounded-xl border border-gaming-green/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono font-black uppercase tracking-widest text-gaming-green">New Match</h2>
            <button onClick={() => setShowAddForm(false)} className="text-text-muted hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleAddMatch} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'home_team', label: 'Home Team *', placeholder: 'Brazil' },
              { key: 'away_team', label: 'Away Team *', placeholder: 'Argentina' },
              { key: 'match_date', label: 'Match Date/Time *', type: 'datetime-local', placeholder: '' },
              { key: 'stage', label: 'Stage', placeholder: 'Group Stage' },
              { key: 'group_name', label: 'Group', placeholder: 'Group A' },
              { key: 'venue', label: 'Venue', placeholder: 'Estadio...' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">{label}</label>
                <input
                  type={type || 'text'}
                  placeholder={placeholder}
                  value={(newMatch as any)[key]}
                  onChange={e => setNewMatch(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border-dark text-xs text-white placeholder-text-muted focus:outline-none focus:border-gaming-green/50"
                />
              </div>
            ))}
            <div className="col-span-2 md:col-span-3 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-lg btn-gaming-secondary text-xs font-black uppercase">Cancel</button>
              <button type="submit" disabled={addLoading} className="px-4 py-2 rounded-lg btn-gaming-primary text-xs font-black uppercase disabled:opacity-50">
                {addLoading ? 'Creating...' : 'Create Match'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Score Edit Modal */}
      {editingScore && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="gaming-panel rounded-xl border border-gaming-green/30 p-6 w-80 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-black uppercase tracking-widest text-gaming-green">Update Score</h2>
              <button onClick={() => setEditingScore(null)} className="text-text-muted hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Home Score</label>
                <input
                  type="number"
                  min="0"
                  value={editingScore.home}
                  onChange={e => setEditingScore(prev => prev ? { ...prev, home: e.target.value } : null)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border-dark text-xs text-white focus:outline-none focus:border-gaming-green/50 text-center font-mono text-lg font-black"
                />
              </div>
              <span className="text-text-muted font-bold mt-4">:</span>
              <div className="flex-1">
                <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Away Score</label>
                <input
                  type="number"
                  min="0"
                  value={editingScore.away}
                  onChange={e => setEditingScore(prev => prev ? { ...prev, away: e.target.value } : null)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border-dark text-xs text-white focus:outline-none focus:border-gaming-green/50 text-center font-mono text-lg font-black"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Match Status</label>
              <select
                value={editingScore.status}
                onChange={e => setEditingScore(prev => prev ? { ...prev, status: e.target.value as MatchStatus } : null)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border-dark text-xs text-white focus:outline-none focus:border-gaming-green/50"
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="finished">Finished</option>
              </select>
            </div>

            {editingScore.status === 'finished' && (
              <div className="flex items-center gap-2 text-[10px] text-gaming-gold bg-gaming-gold/5 border border-gaming-gold/20 rounded-lg p-2">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Setting to Finished will auto-score all predictions for this match.
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setEditingScore(null)} className="flex-1 px-3 py-2 rounded-lg btn-gaming-secondary text-xs font-black uppercase">Cancel</button>
              <button onClick={handleUpdateScore} disabled={scoreLoading} className="flex-1 px-3 py-2 rounded-lg btn-gaming-primary text-xs font-black uppercase disabled:opacity-50">
                {scoreLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'upcoming', 'live', 'finished'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
              filter === f
                ? 'bg-gaming-green/10 text-gaming-green border-gaming-green/30'
                : 'text-text-muted border-border-dark hover:border-gaming-green/20 hover:text-white'
            }`}
          >
            {f} ({f === 'all' ? matches.length : matches.filter(m => m.status === f).length})
          </button>
        ))}
      </div>

      {/* Matches Table */}
      <div className="gaming-panel rounded-xl border border-border-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#070709] text-[9px] text-text-muted font-black uppercase tracking-wider border-b border-border-dark">
                <th className="px-4 py-3 text-left">Match</th>
                <th className="px-4 py-3 text-center">Date</th>
                <th className="px-4 py-3 text-center">Stage</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Score</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-xs text-text-muted font-bold uppercase">No matches found.</td></tr>
              ) : filtered.map(match => (
                <tr key={match.id} className="border-b border-border-dark/30 last:border-0 hover:bg-surface/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-black text-white">
                      {match.home_team} <span className="text-text-muted">vs</span> {match.away_team}
                    </div>
                    {match.venue && <div className="text-[9px] text-text-muted mt-0.5">{match.venue}</div>}
                  </td>
                  <td className="px-4 py-3 text-center text-[10px] font-mono font-bold text-text-muted">
                    {new Date(match.match_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-center text-[10px] font-bold text-text-muted">{match.stage || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${statusColors[match.status as MatchStatus]}`}>
                      {match.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-sm font-black text-white">
                    {match.status !== 'upcoming' && match.home_score !== null
                      ? `${match.home_score} – ${match.away_score}`
                      : <span className="text-text-muted text-xs">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setEditingScore({
                        matchId: match.id,
                        home: match.home_score?.toString() ?? '0',
                        away: match.away_score?.toString() ?? '0',
                        status: match.status,
                      })}
                      className="flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded text-[9px] font-black uppercase border border-border-dark text-text-muted hover:text-gaming-green hover:border-gaming-green/40 transition-all"
                    >
                      <Edit2 className="w-3 h-3" /> Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
