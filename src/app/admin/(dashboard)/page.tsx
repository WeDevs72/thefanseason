import React from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase-server';
import StatCard from '@/components/admin/StatCard';
import { Users, Calendar, CheckSquare, ShoppingBag, Trophy, Award, ArrowRight, Clock } from 'lucide-react';

export const revalidate = 0;

export default async function AdminOverviewPage() {
  const admin = createAdminClient();

  // Fetch platform-wide stats in parallel
  const [
    { count: totalUsers },
    { count: totalPredictions },
    { count: finishedMatches },
    { count: upcomingMatches },
    { count: liveMatches },
    { count: totalProducts },
    { count: totalOrders },
    { data: recentUsers },
    { data: recentPredictions },
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('predictions').select('id', { count: 'exact', head: true }),
    admin.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'finished'),
    admin.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'upcoming'),
    admin.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'live'),
    admin.from('digital_products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    admin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
    admin.from('profiles').select('username, created_at, fan_card_tier, is_premium').order('created_at', { ascending: false }).limit(8),
    admin.from('predictions').select(`
      id, created_at, predicted_winner, is_correct,
      matches(home_team, away_team),
      profiles(username)
    `).order('created_at', { ascending: false }).limit(8),
  ]);

  // Revenue: sum of paid orders
  const { data: revenueData } = await admin
    .from('orders')
    .select('amount_inr')
    .eq('status', 'paid');

  const totalRevenue = revenueData ? revenueData.reduce((sum, o) => sum + (o.amount_inr || 0), 0) : 0;

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-mono font-black uppercase tracking-widest text-white">
          Admin <span className="text-gaming-green">Overview</span>
        </h1>
        <p className="text-[11px] text-text-muted font-bold mt-1 uppercase tracking-wider">
          Platform-wide metrics and recent activity — TheFanSeason World Cup 2026
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={(totalUsers || 0).toLocaleString()} icon={Users} color="green" />
        <StatCard label="Predictions" value={(totalPredictions || 0).toLocaleString()} icon={CheckSquare} color="neon" />
        <StatCard label="Revenue (USD)" value={`$${totalRevenue.toLocaleString()}`} icon={ShoppingBag} color="gold" />
        <StatCard label="Orders Paid" value={totalOrders || 0} icon={Trophy} color="purple" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Upcoming Matches" value={upcomingMatches || 0} icon={Calendar} color="neon" sub="Scheduled" />
        <StatCard label="Live Now" value={liveMatches || 0} icon={Calendar} color="green" sub="In Progress" />
        <StatCard label="Finished" value={finishedMatches || 0} icon={Calendar} color="purple" sub="Completed" />
        <StatCard label="Active Products" value={totalProducts || 0} icon={ShoppingBag} color="gold" sub="In Store" />
      </div>

      {/* Match Status Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/matches" className="gaming-panel rounded-xl p-4 border border-gaming-green/20 hover:border-gaming-green/50 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Manage Matches</p>
              <p className="text-sm font-mono font-black text-white mt-1">Update Scores & Status</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gaming-green group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link href="/admin/users" className="gaming-panel rounded-xl p-4 border border-gaming-neon/20 hover:border-gaming-neon/50 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Manage Users</p>
              <p className="text-sm font-mono font-black text-white mt-1">Premium & Tier Control</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gaming-neon group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link href="/admin/store" className="gaming-panel rounded-xl p-4 border border-gaming-gold/20 hover:border-gaming-gold/50 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Manage Store</p>
              <p className="text-sm font-mono font-black text-white mt-1">Products & Orders</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gaming-gold group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Users */}
        <div className="gaming-panel rounded-xl border border-border-dark overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-dark">
            <h2 className="text-xs font-mono font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-gaming-green" />
              Recent Sign-Ups
            </h2>
            <Link href="/admin/users" className="text-[10px] font-black uppercase text-gaming-green hover:underline">All Users →</Link>
          </div>
          <div className="divide-y divide-border-dark/40">
            {recentUsers && recentUsers.length > 0 ? recentUsers.map((u: any) => (
              <div key={u.username} className="flex items-center justify-between px-4 py-2.5 hover:bg-surface/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gaming-green/10 border border-gaming-green/30 flex items-center justify-center text-gaming-green font-black text-xs uppercase">
                    {u.username?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">@{u.username}</p>
                    <p className="text-[9px] text-text-muted uppercase font-bold">{u.fan_card_tier}</p>
                  </div>
                </div>
                <div className="text-right">
                  {u.is_premium && (
                    <span className="text-[9px] bg-gaming-gold/10 text-gaming-gold border border-gaming-gold/20 px-1.5 py-0.5 rounded font-black uppercase">PRO</span>
                  )}
                  <p className="text-[9px] text-text-muted font-bold mt-0.5 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )) : (
              <div className="px-4 py-6 text-center text-xs text-text-muted font-bold uppercase">No users yet</div>
            )}
          </div>
        </div>

        {/* Recent Predictions */}
        <div className="gaming-panel rounded-xl border border-border-dark overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-dark">
            <h2 className="text-xs font-mono font-black uppercase tracking-widest text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-gaming-neon" />
              Recent Predictions
            </h2>
            <Link href="/admin/predictions" className="text-[10px] font-black uppercase text-gaming-green hover:underline">All Predictions →</Link>
          </div>
          <div className="divide-y divide-border-dark/40">
            {recentPredictions && recentPredictions.length > 0 ? recentPredictions.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-surface/30 transition-colors">
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">
                    {p.matches?.home_team} vs {p.matches?.away_team}
                  </p>
                  <p className="text-[9px] text-text-muted font-bold mt-0.5">
                    @{p.profiles?.username} → <span className="text-white uppercase">{p.predicted_winner}</span>
                  </p>
                </div>
                <div>
                  {p.is_correct === null ? (
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded font-black uppercase">Pending</span>
                  ) : p.is_correct ? (
                    <span className="text-[9px] bg-gaming-green/10 text-gaming-green border border-gaming-green/30 px-1.5 py-0.5 rounded font-black uppercase">✓ Correct</span>
                  ) : (
                    <span className="text-[9px] bg-red-950/50 text-red-500 border border-red-800/50 px-1.5 py-0.5 rounded font-black uppercase">✗ Wrong</span>
                  )}
                </div>
              </div>
            )) : (
              <div className="px-4 py-6 text-center text-xs text-text-muted font-bold uppercase">No predictions yet</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
