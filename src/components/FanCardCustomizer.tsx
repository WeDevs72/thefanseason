'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Profile, LeaderboardEntry } from '@/lib/types';
import FanCard from './FanCard';
import { useToast } from './Toast';
import { useAuth } from './AuthContext';
import { createClientComponentClient } from '@/lib/supabase';
import { Download, Share2, Sparkles, Send, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

interface FanCardCustomizerProps {
  initialProfile: Profile;
  stats?: LeaderboardEntry | null;
  badges?: any[] | null;
}

const TITLE_BADGES = ['The Analyst', 'Goal God', 'Tactician', 'Oracle'];
const THEMES: { id: 'free' | 'gold' | 'neon' | 'galaxy' | 'shield_blue' | 'shield_gold' | 'shield_red' | 'shield_green' | 'shield_purple'; label: string; shortLabel: string; price: number }[] = [
  { id: 'free', label: 'Rookie Dark (Free)', shortLabel: 'Rookie', price: 0 },
  { id: 'gold', label: 'Championship Gold', shortLabel: 'Gold FUT', price: 249 },
  { id: 'neon', label: 'Esports Green', shortLabel: 'Green FUT', price: 249 },
  { id: 'galaxy', label: 'Hyperdrive Purple', shortLabel: 'Purple FUT', price: 249 },
  { id: 'shield_blue', label: 'Shield Sapphire (Blue)', shortLabel: 'Blue Shield', price: 249 },
  { id: 'shield_gold', label: 'Shield Aurum (Gold)', shortLabel: 'Gold Shield', price: 249 },
  { id: 'shield_red', label: 'Shield Ruby (Red)', shortLabel: 'Red Shield', price: 249 },
  { id: 'shield_green', label: 'Shield Emerald (Green)', shortLabel: 'Green Shield', price: 249 },
  { id: 'shield_purple', label: 'Shield Amethyst (Purple)', shortLabel: 'Purple Shield', price: 249 }
];

const SHIELD_STYLES = [
  { id: 'classic', label: 'Classic Shield' },
  { id: 'apex', label: 'Apex Crest' },
  { id: 'cyber', label: 'Cyber Edge' },
  { id: 'banner', label: 'Banner Guard' },
  { id: 'titan', label: 'Titan Aegis' }
] as const;

const SHIELD_COLORS = [
  { id: 'blue', label: 'Sapphire Blue', colorClass: 'bg-[#00E5FF]' },
  { id: 'gold', label: 'Aurum Gold', colorClass: 'bg-[#FFD700]' },
  { id: 'red', label: 'Ruby Red', colorClass: 'bg-[#EF4444]' },
  { id: 'green', label: 'Emerald Green', colorClass: 'bg-[#00C853]' },
  { id: 'purple', label: 'Amethyst Purple', colorClass: 'bg-[#A855F7]' },
  { id: 'orange', label: 'Amber Orange', colorClass: 'bg-[#F97316]' },
  { id: 'cyan', label: 'Diamond Cyan', colorClass: 'bg-[#06B6D4]' },
  { id: 'pink', label: 'Quartz Pink', colorClass: 'bg-[#EC4899]' }
] as const;

export default function FanCardCustomizer({ initialProfile, stats, badges }: FanCardCustomizerProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { refreshProfile } = useAuth();

  // Customization state
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [theme, setTheme] = useState<string>(
    initialProfile.card_theme || 'free'
  );
  const [titleBadge, setTitleBadge] = useState<string | null>(initialProfile.title_badge || null);
  const [isCopied, setIsCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Sub-states to parse and synchronize dynamic layouts & colors
  const [cardLayout, setCardLayout] = useState<'fut' | 'shield'>(
    (initialProfile.card_theme || 'free').startsWith('shield_') ? 'shield' : 'fut'
  );
  
  const [shieldStyle, setShieldStyle] = useState<'classic' | 'apex' | 'cyber' | 'banner' | 'titan'>(() => {
    const t = initialProfile.card_theme || 'free';
    if (t.startsWith('shield_')) {
      const parts = t.split('_');
      if (parts.length === 3) return parts[1] as any;
    }
    return 'classic';
  });

  const [shieldColor, setShieldColor] = useState<'blue' | 'gold' | 'red' | 'green' | 'purple' | 'orange' | 'cyan' | 'pink'>(() => {
    const t = initialProfile.card_theme || 'free';
    if (t.startsWith('shield_')) {
      const parts = t.split('_');
      if (parts.length === 2) return parts[1] as any;
      if (parts.length === 3) return parts[2] as any;
    }
    return 'blue';
  });

  const handleLayoutChange = (newLayout: 'fut' | 'shield') => {
    setCardLayout(newLayout);
    if (newLayout === 'fut') {
      setTheme((prev) => (prev.startsWith('shield_') ? 'free' : prev));
    } else {
      setTheme(`shield_${shieldStyle}_${shieldColor}`);
    }
  };

  const handleShieldStyleChange = (newStyle: 'classic' | 'apex' | 'cyber' | 'banner' | 'titan') => {
    setShieldStyle(newStyle);
    setTheme(`shield_${newStyle}_${shieldColor}`);
  };

  const handleShieldColorChange = (newColor: 'blue' | 'gold' | 'red' | 'green' | 'purple' | 'orange' | 'cyan' | 'pink') => {
    setShieldColor(newColor);
    setTheme(`shield_${shieldStyle}_${newColor}`);
  };

  const supabase = createClientComponentClient();

  // Load Razorpay checkout script dynamically
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });
  };

  // Payment Upgrade Trigger
  const handleUpgrade = async () => {
    try {
      showToast('info', 'Connecting Checkout...', 'Opening Razorpay secure payment gateway.');
      await loadRazorpay();

      // 1. Create order on the backend
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 249, // ₹249 premium card price
          productId: 'fancard_premium_upgrade',
          userId: profile.id
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // 2. Setup checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: 24900, // in paise
        currency: 'INR',
        name: 'TheFanSeason 2026',
        description: 'Premium Fan Card Upgrade',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          showToast('info', 'Verifying Payment...', 'Verifying signature on security nodes.');

          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              productId: 'fancard_premium_upgrade',
              userId: profile.id,
              amountInr: 249,
              isMock: orderData.isMock
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            showToast('success', 'Upgrade Successful! 🌟', 'Holographic frames and badges unlocked!');

            // Sync local profile state
            await refreshProfile();
            setProfile(prev => ({ ...prev, is_premium: true }));
          } else {
            showToast('error', 'Verification Failed', verifyData.error || 'Signature verification error.');
          }
        },
        prefill: {
          name: profile.full_name || '',
          email: '', // Supabase user email is safe in session
        },
        theme: { color: '#00C853' }
      };

      // 3. Open Razorpay Dialog (mock if needed)
      if (orderData.isMock) {
        // Trigger simulated verification directly for easy local test runs
        setTimeout(() => {
          options.handler({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: 'mock_signature'
          });
        }, 1000);
      } else {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Checkout Interrupted', err.message || 'Payment pipeline failed.');
    }
  };

  // Save Premium styles (Theme + Title Badge)
  const savePremiumStyles = async () => {
    if (!profile.is_premium) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          card_theme: theme,
          title_badge: titleBadge
        })
        .eq('id', profile.id);

      if (error) throw error;

      showToast('success', 'Styles Saved!', 'Your card profile has been saved.');
      await refreshProfile();
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Save Failed', err.message || 'Failed to update styles.');
    } finally {
      setSaving(false);
    }
  };

  // Export card as PNG using html2canvas
  const exportCard = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    showToast('info', 'Rendering Card Canvas', 'Generating high-fidelity pixel canvas.');

    try {
      // Set options (2x scale for premium cards)
      const options = {
        scale: profile.is_premium ? 2 : 1,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        logging: false
      };

      const canvas = await html2canvas(cardRef.current, options);
      const dataUrl = canvas.toDataURL('image/png');

      // Create download trigger
      const link = document.createElement('a');
      link.download = `fancard_${profile.username}.png`;
      link.href = dataUrl;
      link.click();

      showToast('success', 'Download Completed! ⚽', 'Your Fan Card PNG has been saved.');
    } catch (err) {
      console.error('Canvas export error:', err);
      showToast('error', 'Export Failed', 'An error occurred during canvas render.');
    } finally {
      setExporting(false);
    }
  };

  // Share Copy Link Handler
  const shareLink = () => {
    const shareUrl = `${window.location.origin}/u/${profile.username}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    showToast('success', 'Link Copied! 📋', 'Share with friends to challenge predictions.');
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Social Share URLs
  const getWhatsAppShareUrl = () => {
    const accuracy = stats?.accuracy_percent ? Math.round(Number(stats.accuracy_percent)) : 0;
    const rank = stats?.rank ? `#${stats.rank}` : 'unranked';
    const text = `I'm rank ${rank} on TheFanSeason 2026 with ${accuracy}% prediction accuracy! Create your free fan card here 👉 ${window.location.origin}/u/${profile.username}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const getTwitterShareUrl = () => {
    const accuracy = stats?.accuracy_percent ? Math.round(Number(stats.accuracy_percent)) : 0;
    const text = `I just customized my TheFanSeason 2026 Card! Check out my stats and predict matches with me. 👉`;
    const shareUrl = `${window.location.origin}/u/${profile.username}`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Interactive Card Preview */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4">
          <h3 className="text-xs font-mono font-black uppercase text-text-muted tracking-widest self-start">
            📺 Card Projection
          </h3>

          <div className="p-4 bg-[#0d0f14] border border-border-dark rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <FanCard
              ref={cardRef}
              profile={{ ...profile, card_theme: theme, title_badge: titleBadge }}
              stats={stats}
              badges={badges}
              theme={theme}
              titleBadge={titleBadge}
            />
          </div>

          {/* Export Actions Panel */}
          <div className="flex gap-3 w-full max-w-[350px]">
            <button
              onClick={exportCard}
              disabled={exporting}
              className="flex-1 py-3 rounded-xl btn-gaming-primary text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 shrink-0" />
              {exporting ? 'Rendering...' : 'Download PNG'}
            </button>
            <button
              onClick={shareLink}
              className="px-4 py-3 rounded-xl bg-surface border border-border-dark hover:border-gaming-green/40 text-xs font-bold uppercase flex items-center justify-center gap-2 text-white"
            >
              {isCopied ? <Check className="w-4 h-4 text-gaming-green" /> : <Share2 className="w-4 h-4 text-gaming-green" />}
              Share
            </button>
          </div>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-7 space-y-6">

          {/* Viral Share Banner */}
          <div className="bg-[#0b0c10]/80 p-4 rounded-xl border border-border-dark/60">
            <h4 className="text-xs font-mono font-black uppercase text-white tracking-widest flex items-center gap-1.5">
              🚀 Share & Challenge Friends!
            </h4>
            <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-wider leading-relaxed">
              Showcase your prediction accuracy and streak ranks to challenge other football fans.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded bg-green-600/10 border border-green-600/30 text-green-400 hover:bg-green-600/20 text-[10px] font-black uppercase tracking-wider transition-colors"
              >
                WhatsApp Share
              </a>
              <a
                href={getTwitterShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded bg-sky-600/10 border border-sky-600/30 text-sky-400 hover:bg-sky-600/20 text-[10px] font-black uppercase tracking-wider transition-colors"
              >
                Twitter / X
              </a>
            </div>
          </div>

          {/* Theme & Customization controls */}
          <div className="gaming-panel p-5 rounded-2xl border-border-dark space-y-5">
            <div className="border-b border-border-dark/60 pb-3 flex items-center justify-between">
              <h3 className="text-xs font-mono font-black uppercase text-white tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gaming-gold" />
                Customize Frame & Emblems
              </h3>
              {!profile.is_premium && (
                <span className="bg-gaming-gold text-black font-mono font-black text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  PREMIUM UNLOCKED
                </span>
              )}
            </div>

            {/* Check if Premium upgrade is required */}
            {!profile.is_premium ? (
              <div className="bg-[#1b170c] border border-gaming-gold/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h4 className="text-xs font-mono font-black uppercase text-gaming-gold tracking-widest">
                    Unlock Premium Holographic Card
                  </h4>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1 tracking-wider leading-relaxed">
                    🌟 Gold, Neon Green, & Purple Themes • CSS Border Shimmers • Custom Titles • 2x High-Res PNG Capture
                  </p>
                </div>
                <button
                  onClick={handleUpgrade}
                  className="px-5 py-2.5 rounded-lg btn-gaming-gold text-xs font-black uppercase tracking-wider shrink-0"
                >
                  Upgrade ₹249
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Layout Switcher */}
                <div>
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-2">
                    Card Style Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleLayoutChange('fut')}
                      className={`p-2.5 border text-center font-bold text-xs uppercase rounded-lg transition-all ${cardLayout === 'fut'
                          ? 'border-gaming-green bg-gaming-green/5 text-gaming-green'
                          : 'border-border-dark text-text-muted hover:border-gaming-green/20 hover:text-white'
                        }`}
                    >
                      Futuristic Card (FUT)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLayoutChange('shield')}
                      className={`p-2.5 border text-center font-bold text-xs uppercase rounded-lg transition-all ${cardLayout === 'shield'
                          ? 'border-gaming-green bg-gaming-green/5 text-gaming-green'
                          : 'border-border-dark text-text-muted hover:border-gaming-green/20 hover:text-white'
                        }`}
                    >
                      Jersey Shield Card
                    </button>
                  </div>
                </div>

                {/* If FUT Layout is active */}
                {cardLayout === 'fut' && (
                  <div>
                    <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-2">
                      Select FUT Frame Theme
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {THEMES.filter(t => !t.id.startsWith('shield_')).map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`p-2.5 border text-center font-bold text-xs uppercase rounded-lg transition-all ${theme === t.id
                              ? 'border-gaming-green bg-gaming-green/5 text-gaming-green'
                              : 'border-border-dark text-text-muted hover:border-gaming-green/20 hover:text-white'
                            }`}
                        >
                          {t.shortLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* If Shield Layout is active */}
                {cardLayout === 'shield' && (
                  <div className="space-y-4">
                    {/* Shield Style selector */}
                    <div>
                      <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-2">
                        Select Shield Frame Shape
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {SHIELD_STYLES.map((styleOpt) => (
                          <button
                            key={styleOpt.id}
                            type="button"
                            onClick={() => handleShieldStyleChange(styleOpt.id)}
                            className={`p-2 border text-center font-bold text-[10px] uppercase rounded-lg transition-all ${shieldStyle === styleOpt.id
                                ? 'border-gaming-green bg-gaming-green/5 text-gaming-green'
                                : 'border-border-dark text-text-muted hover:border-gaming-green/20 hover:text-white'
                              }`}
                          >
                            {styleOpt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shield Color selector */}
                    <div>
                      <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-2">
                        Select Jersey Shield Color
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SHIELD_COLORS.map((colorOpt) => (
                          <button
                            key={colorOpt.id}
                            type="button"
                            onClick={() => handleShieldColorChange(colorOpt.id)}
                            className={`p-2 border text-left font-bold text-[10px] uppercase rounded-lg transition-all flex items-center gap-2 ${shieldColor === colorOpt.id
                                ? 'border-gaming-green bg-gaming-green/5 text-gaming-green'
                                : 'border-border-dark text-text-muted hover:border-gaming-green/20 hover:text-white'
                              }`}
                          >
                            <span className={`w-3 h-3 rounded-full shrink-0 border border-white/20 ${colorOpt.colorClass}`} />
                            <span className="truncate">{colorOpt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Title badge selection */}
                <div>
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-2">
                    Choose Your Title Badge
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TITLE_BADGES.map((badgeOption) => (
                      <button
                        key={badgeOption}
                        onClick={() => setTitleBadge(badgeOption)}
                        className={`p-2.5 border text-center font-bold text-xs uppercase rounded-lg transition-all ${titleBadge === badgeOption
                            ? 'border-gaming-green bg-gaming-green/5 text-gaming-green'
                            : 'border-border-dark text-text-muted hover:border-gaming-green/20 hover:text-white'
                          }`}
                      >
                        {badgeOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save controls */}
                <button
                  onClick={savePremiumStyles}
                  disabled={saving}
                  className="w-full py-2.5 rounded-lg btn-gaming-primary text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {saving ? 'Saving...' : 'Save Card Customizations'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
