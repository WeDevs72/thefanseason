import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeContext';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Football World Cup 2026 TheFanSeason | Predict. Compete. Win.',
  description: 'Predict World Cup 2026 matches, earn points, climb the global leaderboard, create customizable premium fan cards, and purchase exclusive digital products!',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Football 2026 TheFanSeason',
    description: 'Predict. Compete. Win.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Football 2026 TheFanSeason',
    description: 'Predict. Compete. Win.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} dark`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-background text-text-primary min-h-screen flex flex-col font-sans antialiased relative scanline-container">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {/* Header / Nav */}
              <Navbar />

              {/* Main Content Area */}
              <main className="flex-1 flex flex-col relative z-10">
                {children}
              </main>

              {/* Footer */}
              <footer className="border-t border-border-dark bg-[#070709] py-8 text-center text-xs text-text-muted mt-auto relative z-10">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="font-mono font-black tracking-widest text-white">
                      THEFAN<span className="text-gaming-green">SEASON</span>
                    </span>
                    <p className="mt-1">Built for the Football World Cup 2026 (June 11 – July 19, 2026)</p>
                  </div>
                  <div className="flex gap-4">
                    <Link href="/privacy" className="hover:text-gaming-green transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-gaming-green transition-colors">Terms of Service</Link>
                    <Link href="/support" className="hover:text-gaming-green transition-colors">Contact Support</Link>
                  </div>
                  <div>
                    <p>© {new Date().getFullYear()} TheFanSeason. All rights reserved.</p>
                  </div>
                </div>
              </footer>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
