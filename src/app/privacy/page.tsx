import React from 'react';
import { Shield, Lock, Eye, FileText, Globe } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full select-none">

      {/* Header section */}
      <div className="border-b border-border-dark pb-6 mb-8 text-center sm:text-left">
        <span className="bg-gaming-green/10 text-gaming-green border border-gaming-green/20 text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded tracking-widest inline-flex items-center gap-1.5 leading-none mb-3">
          <Shield className="w-3.5 h-3.5" /> Security Center
        </span>
        <h1 className="text-2xl sm:text-3xl font-mono font-black uppercase text-white tracking-widest leading-none">
          PRIVACY <span className="text-gaming-green">POLICY</span>
        </h1>
        <p className="text-[10px] text-text-muted mt-2.5 uppercase font-bold tracking-wider">
          Effective Date: June 6, 2026. Review how we protect your fan license credentials and data.
        </p>
      </div>

      {/* Main content panel */}
      <div className="gaming-panel p-6 sm:p-8 rounded-2xl border-border-dark bg-surface/30 relative overflow-hidden space-y-8">
        {/* Glow accent */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gaming-green/45" />

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-mono font-black text-white uppercase tracking-wider">
            <Lock className="w-4 h-4 text-gaming-green" />
            1. Data We Access and Collect
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            To participate in **TheFanSeason 2026**, users register and authenticate using Google OAuth (Gmail). Through this OAuth flow, we collect:
          </p>
          <ul className="list-disc pl-5 text-xs text-text-muted space-y-1">
            <li>Your primary email address (to identify and secure your account).</li>
            <li>Your display name and Google profile picture (to generate your custom digital Fan Card).</li>
            <li>System metadata (signup timestamp, prediction records, and performance tier status).</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-mono font-black text-white uppercase tracking-wider">
            <Eye className="w-4 h-4 text-gaming-neon" />
            2. How We Use Your Information
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Your credentials and fan records are processed to:
          </p>
          <ul className="list-disc pl-5 text-xs text-text-muted space-y-1">
            <li>Generate, update, and display your public and private FUT-style Fan Card.</li>
            <li>Aggregate points, streaks, and prediction statistics for the public standings Leaderboard.</li>
            <li>Deliver digital products purchased through our store (e.g., templates, sheets) and verify orders.</li>
            <li>Validate match prediction locks to prevent manipulation or double-submitting.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-mono font-black text-white uppercase tracking-wider">
            <Globe className="w-4 h-4 text-gaming-gold" />
            3. Public Profiles and Standings
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            By registering in the arena, you acknowledge that your chosen **Username**, **Display Name**, **Home Country**, **Supported Team**, **badges earned**, and **prediction statistics** will be visible to other users. Your email address is kept private and is never shown publicly or shared.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-mono font-black text-white uppercase tracking-wider">
            <FileText className="w-4 h-4 text-gaming-green" />
            4. Cookies and State Management
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            We use secure cookies and browser local storage to maintain active login sessions (via Supabase Auth) and cache your localized timezone selections (so match fixture countdowns are shown in your local time). If you clear cookies, you will be signed out of the arena.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-mono font-black text-white uppercase tracking-wider">
            <Shield className="w-4 h-4 text-gaming-neon" />
            5. Security Protocols
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            All database connections are encrypted over SSL. Payments processed via Razorpay run inside secure payment sandboxes and verify transaction signatures server-side. If you wish to delete your profile and erase your prediction records permanently, please contact our support team.
          </p>
        </section>
      </div>

      <div className="text-[9px] font-mono text-center text-text-muted mt-8 uppercase tracking-widest">
        THEFANSEASON SECURITY FRAMEWORK • FOOTBALL WORLD CUP 2026 EDITION
      </div>
    </div>
  );
}
