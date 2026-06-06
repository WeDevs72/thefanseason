'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { Menu, X, User, Trophy, Calendar, ShoppingBag, ShieldAlert, Award, LogOut, LayoutDashboard, CreditCard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const navLinks = [
    { name: 'Fixtures', href: '/fixtures', icon: Calendar },
    { name: 'Predict', href: '/predict', icon: ShieldAlert },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Store', href: '/store', icon: ShoppingBag },
    { name: 'Fan Card', href: '/fancard', icon: Award },
  ];

  const getActiveStyle = (href: string) => {
    return pathname === href
      ? 'text-gaming-green border-gaming-green bg-gaming-green/5'
      : 'text-text-muted hover:text-white border-transparent hover:border-gaming-green/20';
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border-dark bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-mono text-xl font-black tracking-widest text-white flex items-center">
                THEFAN<span className="text-gaming-green text-shadow-[0_0_10px_rgba(0,200,83,0.5)]">SEASON</span>
              </span>
              <span className="bg-gaming-gold/20 text-gaming-gold border border-gaming-gold/30 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider group-hover:scale-105 transition-transform">
                2026
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 rounded-t-md transition-all ${getActiveStyle(
                    link.href
                  )}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="h-9 w-24 bg-surface rounded animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface border border-border-dark hover:border-gaming-green/40 transition-colors text-left"
                >
                  {/* Avatar or Initial */}
                  <div className="w-8 h-8 rounded-full border border-gaming-green/60 bg-gaming-green/10 flex items-center justify-center text-gaming-green font-bold text-sm uppercase">
                    {profile?.username ? profile.username[0] : 'U'}
                  </div>
                  
                  {/* User details */}
                  <div className="hidden lg:block">
                    <div className="text-xs font-bold text-white max-w-[120px] truncate leading-tight">
                      {profile?.username || 'User'}
                    </div>
                    <div className="text-[10px] text-gaming-green font-bold flex items-center gap-1 leading-none mt-0.5">
                      <Trophy className="w-2.5 h-2.5 text-gaming-gold fill-gaming-gold" />
                      <span>{profile?.fan_card_tier || 'rookie'}</span>
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-md bg-surface border border-border-dark shadow-2xl z-20 py-1 divide-y divide-border-dark">
                      <div className="px-4 py-3">
                        <p className="text-[10px] uppercase font-bold text-text-muted">Logged in as</p>
                        <p className="text-sm font-bold text-white truncate">{profile?.username}</p>
                        {profile?.supported_team && (
                          <p className="text-[10px] font-bold text-gaming-green mt-1">
                            Team: {profile.supported_team}
                          </p>
                        )}
                      </div>
                      
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-white hover:bg-surface-hover transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gaming-green" />
                          Dashboard
                        </Link>
                        <Link
                          href="/fancard"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-white hover:bg-surface-hover transition-colors"
                        >
                          <Award className="w-4 h-4 text-gaming-gold" />
                          My Fan Card
                        </Link>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-500 hover:bg-surface-hover transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="btn-gaming-primary px-4 py-2 rounded-lg text-xs font-bold uppercase"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-text-muted hover:text-white hover:bg-surface-hover focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border-dark bg-background/95 backdrop-blur-md px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold uppercase tracking-wider transition-colors ${
                  pathname === link.href ? 'text-gaming-green bg-gaming-green/5' : 'text-text-muted hover:text-white hover:bg-surface-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
          
          <div className="border-t border-border-dark mt-4 pt-4 px-3">
            {loading ? (
              <div className="h-9 w-full bg-surface rounded animate-pulse" />
            ) : user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-gaming-green/60 bg-gaming-green/10 flex items-center justify-center text-gaming-green font-bold text-sm uppercase">
                    {profile?.username ? profile.username[0] : 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{profile?.username}</div>
                    <div className="text-[10px] text-gaming-gold font-bold uppercase">{profile?.fan_card_tier || 'rookie'}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-md bg-surface border border-border-dark text-xs font-bold uppercase text-white"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-gaming-green" />
                    Dash
                  </Link>
                  <Link
                    href="/fancard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-md bg-surface border border-border-dark text-xs font-bold uppercase text-white"
                  >
                    <Award className="w-3.5 h-3.5 text-gaming-gold" />
                    Card
                  </Link>
                </div>
                
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-red-900/10 border border-red-900/30 text-xs font-bold uppercase text-red-400"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center btn-gaming-primary py-2.5 rounded-lg text-xs font-bold uppercase"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
