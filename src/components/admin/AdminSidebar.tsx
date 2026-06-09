'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Trophy,
  ShoppingBag,
  Award,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { createClientComponentClient } from '@/lib/supabase';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/matches', label: 'Matches', icon: Calendar },
  { href: '/admin/predictions', label: 'Predictions', icon: BarChart3 },
  { href: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/admin/store', label: 'Store', icon: ShoppingBag },
  { href: '/admin/badges', label: 'Badges', icon: Award },
];

export default function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-[#070709] border-r border-border-dark flex flex-col shrink-0">
      {/* Logo / Header */}
      <div className="px-5 py-5 border-b border-border-dark">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-gaming-green" />
          <span className="font-mono font-black text-sm tracking-widest text-white uppercase">
            Admin Panel
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <div className="w-2 h-2 rounded-full bg-gaming-green animate-pulse" />
          <span className="text-[10px] text-text-muted font-bold truncate">{adminEmail}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all group ${
                active
                  ? 'bg-gaming-green/10 text-gaming-green border border-gaming-green/20'
                  : 'text-text-muted hover:text-white hover:bg-surface'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-gaming-green' : 'group-hover:text-white'}`} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-gaming-green" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-border-dark space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-text-muted hover:text-gaming-neon hover:bg-surface transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          View Site
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all text-left"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
