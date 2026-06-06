import React from 'react';
import { Scale, ShieldAlert, ShoppingCart, Award, AlertCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full select-none">
      
      {/* Header section */}
      <div className="border-b border-border-dark pb-6 mb-8 text-center sm:text-left">
        <span className="bg-gaming-neon/10 text-gaming-neon border border-gaming-neon/20 text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded tracking-widest inline-flex items-center gap-1.5 leading-none mb-3">
          <Scale className="w-3.5 h-3.5" /> Legal Codex
        </span>
        <h1 className="text-2xl sm:text-3xl font-mono font-black uppercase text-white tracking-widest leading-none">
          TERMS OF <span className="text-gaming-green">SERVICE</span>
        </h1>
        <p className="text-[10px] text-text-muted mt-2.5 uppercase font-bold tracking-wider">
          Effective Date: June 6, 2026. Please read the arena rules and compliance guidelines.
        </p>
      </div>

      {/* Main content panel */}
      <div className="gaming-panel p-6 sm:p-8 rounded-2xl border-border-dark bg-surface/30 relative overflow-hidden space-y-8">
        {/* Glow accent */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gaming-neon/45" />

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-mono font-black text-white uppercase tracking-wider">
            <Award className="w-4 h-4 text-gaming-green" />
            1. Gamification and Predictions
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            **TheFanSeason 2026** is a fan engagement and prediction game.
          </p>
          <ul className="list-disc pl-5 text-xs text-text-muted space-y-1">
            <li>Predictions are strictly for gamification points, leaderboard positioning, and badge achievements.</li>
            <li>**No real-money betting or gambling is supported, allowed, or encouraged.** Points have no monetary cash value.</li>
            <li>Predictions lock automatically once the corresponding match starts (using current server time). Retroactive predictions are impossible.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-mono font-black text-white uppercase tracking-wider">
            <ShoppingCart className="w-4 h-4 text-gaming-gold" />
            2. Purchases and Digital Shop
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            We list spreadsheets, strategies, and high-tier visual styles for purchase.
          </p>
          <ul className="list-disc pl-5 text-xs text-text-muted space-y-1">
            <li>Payments are handled securely via Razorpay. Transactions are finalized server-side.</li>
            <li>**All digital product sales and premium upgrades are final and non-refundable** due to the immediate download nature of digital goods.</li>
            <li>Users are provided signed download links which expire after a preset duration to secure products against unauthorized duplication.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-mono font-black text-white uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-gaming-neon" />
            3. Conduct and Fair Play
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            To maintain a competitive global leaderboard, you agree not to:
          </p>
          <ul className="list-disc pl-5 text-xs text-text-muted space-y-1">
            <li>Submit automated requests or bots to predict fixtures.</li>
            <li>Exploit bugs in point calculations, fixture synchronization, or leaderboard cron routines.</li>
            <li>Use offensive, vulgar, or copyrighted names in your editable Username and Display Name handles.</li>
          </ul>
          <p className="text-xs text-text-muted leading-relaxed mt-2">
            Violators will have their profiles deleted, licenses revoked, and leaderboard metrics permanently zeroed.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-mono font-black text-white uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-gaming-neon" />
            4. Service Outages and Score Delays
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Fixture listings and actual results rely on third-party sports APIs. We are not liable for delayed leaderboard updates, missing statistics, or sync glitches. Match evaluation rules are applied programmatically based on final match scores (regular time + extra time, excluding penalty shootouts as defined by points rules).
          </p>
        </section>
      </div>

      <div className="text-[9px] font-mono text-center text-text-muted mt-8 uppercase tracking-widest">
        THEFANSEASON COMPLIANCE SYSTEM • LEGAL PROTOCOL 1.0.6
      </div>
    </div>
  );
}
