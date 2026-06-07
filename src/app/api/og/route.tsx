import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse query params
    const username = searchParams.get('username') || 'World Cup Fan';
    const tier = searchParams.get('tier') || 'Rookie';
    const team = searchParams.get('team') || 'Neutral';
    const accuracy = searchParams.get('accuracy') || '0';
    const points = searchParams.get('points') || '0';
    const country = searchParams.get('country') || 'Unknown';
    const theme = searchParams.get('theme') || 'free';

    // Color theme setups
    const themes: { [key: string]: { border: string; bg: string; accent: string } } = {
      free: { border: '#1F2937', bg: 'linear-gradient(135deg, #09090b 0%, #111827 100%)', accent: '#00C853' },
      gold: { border: '#FFD700', bg: 'linear-gradient(135deg, #181308 0%, #0d0f14 100%)', accent: '#FFD700' },
      neon: { border: '#00C853', bg: 'linear-gradient(135deg, #021a0f 0%, #0d0f14 100%)', accent: '#00C853' },
      galaxy: { border: '#8B5CF6', bg: 'linear-gradient(135deg, #18092b 0%, #0d0f14 100%)', accent: '#8B5CF6' }
    };

    let activeTheme = themes[theme];
    
    if (!activeTheme && (theme.startsWith('shield_') || theme.startsWith('fut_'))) {
      const parts = theme.split('_');
      const shieldColor = parts[parts.length - 1] || 'blue';
      
      const shieldColors: { [key: string]: { border: string; bg: string; accent: string } } = {
        blue: { border: '#3B82F6', bg: 'linear-gradient(135deg, #0a1e3f 0%, #040810 100%)', accent: '#00E5FF' },
        gold: { border: '#D97706', bg: 'linear-gradient(135deg, #2a1d04 0%, #080501 100%)', accent: '#FFD700' },
        red: { border: '#991B1B', bg: 'linear-gradient(135deg, #2c050a 0%, #0a0203 100%)', accent: '#EF4444' },
        green: { border: '#065F46', bg: 'linear-gradient(135deg, #012211 0%, #020804 100%)', accent: '#00C853' },
        purple: { border: '#5B21B6', bg: 'linear-gradient(135deg, #1c082e 0%, #06020a 100%)', accent: '#A855F7' },
        orange: { border: '#C2410C', bg: 'linear-gradient(135deg, #2d1203 0%, #090300 100%)', accent: '#F97316' },
        cyan: { border: '#0891B2', bg: 'linear-gradient(135deg, #031d26 0%, #01060a 100%)', accent: '#06B6D4' },
        pink: { border: '#BE185D', bg: 'linear-gradient(135deg, #2b031b 0%, #0a0006 100%)', accent: '#EC4899' },
      };
      
      activeTheme = shieldColors[shieldColor] || shieldColors.blue;
    }
    
    if (!activeTheme) {
      activeTheme = themes.free;
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundImage: activeTheme.bg,
            borderTop: `10px solid ${activeTheme.accent}`,
            padding: '40px 60px',
            color: '#FFFFFF',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Cybergrid overlay simulated */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.08,
              backgroundImage: 'linear-gradient(90deg, #FFFFFF 1px, transparent 1px), linear-gradient(#FFFFFF 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />

          {/* Header row */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '22px',
                fontWeight: 900,
                letterSpacing: '3px',
                color: '#FFFFFF',
              }}
            >
              THEFAN<span style={{ color: '#00C853' }}>SEASON</span>
            </span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: activeTheme.accent,
                border: `1.5px solid ${activeTheme.accent}`,
                padding: '4px 12px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(0,0,0,0.4)',
              }}
            >
              {tier} TIER
            </span>
          </div>

          {/* Core Profile Body */}
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '40px', zIndex: 10, margin: '20px 0' }}>
            {/* Avatar block */}
            <div
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                border: `3px solid ${activeTheme.accent}`,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                fontWeight: 900,
                color: activeTheme.accent,
                boxShadow: `0 0 20px ${activeTheme.accent}40`,
              }}
            >
              {username[0]?.toUpperCase()}
            </div>

            {/* Name and origin info */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h1 style={{ fontSize: '42px', fontWeight: 900, margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {username}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                  }}
                >
                  Origin: {country}
                </span>
                <span style={{ color: '#4B5563', fontSize: '18px' }}>|</span>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#00C853',
                    textTransform: 'uppercase',
                  }}
                >
                  ⚽ Supporting: {team}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Matrix Grid */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: '20px', zIndex: 10 }}>
            {/* Predictions made */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid #1F2937',
                borderRadius: '10px',
                padding: '12px 20px',
              }}
            >
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Points</span>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#FFD700', marginTop: '4px' }}>{points} PTS</span>
            </div>

            {/* Accuracy ratio */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid #1F2937',
                borderRadius: '10px',
                padding: '12px 20px',
              }}
            >
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Accuracy</span>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#00C853', marginTop: '4px' }}>{accuracy}%</span>
            </div>

            {/* Promo banner text */}
            <div
              style={{
                flex: 1.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed #00C85360',
                borderRadius: '10px',
                padding: '12px 20px',
                backgroundColor: 'rgba(0, 200, 83, 0.05)',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Join TheFanSeason 2026 Arena
              </span>
              <span style={{ fontSize: '10px', color: '#00C853', fontWeight: 700, marginTop: '3px' }}>
                Create your card 👉 yourdomain.com
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
