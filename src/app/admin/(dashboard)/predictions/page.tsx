import React from 'react';
import { createAdminClient } from '@/lib/supabase-server';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export const revalidate = 0;

export default async function AdminPredictionsPage() {
  const admin = createAdminClient();

  const { data: predictions } = await admin
    .from('predictions')
    .select(`
      *,
      matches(home_team, away_team, home_score, away_score, status, stage),
      profiles(username)
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  const total = predictions?.length || 0;
  const correct = predictions?.filter(p => p.is_correct === true).length || 0;
  const pending = predictions?.filter(p => p.is_correct === null).length || 0;
  const avgPoints = total > 0
    ? (predictions!.reduce((sum, p) => sum + (p.points_earned || 0), 0) / total).toFixed(2)
    : '0.00';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-mono font-black uppercase tracking-widest text-white">
          Predictions <span className="text-gaming-green">Overview</span>
        </h1>
        <p className="text-[11px] text-text-muted font-bold mt-1 uppercase tracking-wider">
          Last 200 predictions across all users
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, color: 'text-white' },
          { label: 'Correct', value: correct, color: 'text-gaming-green' },
          { label: 'Pending', value: pending, color: 'text-gaming-gold' },
          { label: 'Avg Points', value: avgPoints, color: 'text-gaming-neon' },
        ].map(({ label, value, color }) => (
          <div key={label} className="gaming-panel rounded-xl p-4 border border-border-dark text-center">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{label}</p>
            <p className={`font-mono text-2xl font-black mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="gaming-panel rounded-xl border border-border-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#070709] text-[9px] text-text-muted font-black uppercase tracking-wider border-b border-border-dark">
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Match</th>
                <th className="px-4 py-3 text-center">Predicted</th>
                <th className="px-4 py-3 text-center">Score Pred.</th>
                <th className="px-4 py-3 text-center">Actual</th>
                <th className="px-4 py-3 text-center">Result</th>
                <th className="px-4 py-3 text-center">Points</th>
                <th className="px-4 py-3 text-center">Date</th>
              </tr>
            </thead>
            <tbody>
              {!predictions || predictions.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-xs text-text-muted font-bold uppercase">No predictions found.</td></tr>
              ) : predictions.map(pred => (
                <tr key={pred.id} className="border-b border-border-dark/30 last:border-0 hover:bg-surface/20 transition-colors text-xs">
                  <td className="px-4 py-2.5 font-bold text-gaming-neon">@{pred.profiles?.username}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-mono font-bold text-white">{pred.matches?.home_team} vs {pred.matches?.away_team}</div>
                    <div className="text-[9px] text-text-muted uppercase">{pred.matches?.stage}</div>
                  </td>
                  <td className="px-4 py-2.5 text-center font-black text-white uppercase">{pred.predicted_winner}</td>
                  <td className="px-4 py-2.5 text-center font-mono font-bold text-text-muted">
                    {pred.predicted_home_score !== null ? `${pred.predicted_home_score}–${pred.predicted_away_score}` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono font-bold text-white">
                    {pred.matches?.status === 'finished' ? `${pred.matches?.home_score}–${pred.matches?.away_score}` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {pred.is_correct === null ? (
                      <Clock className="w-3.5 h-3.5 text-gaming-gold mx-auto" />
                    ) : pred.is_correct ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-gaming-green mx-auto" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono font-black text-gaming-gold">
                    {pred.is_correct === null ? '—' : `+${pred.points_earned}`}
                  </td>
                  <td className="px-4 py-2.5 text-center text-[9px] text-text-muted font-bold">
                    {new Date(pred.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
