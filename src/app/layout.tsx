import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeContext';
import PublicShell from '@/components/PublicShell';

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
              {/*
                PublicShell conditionally renders Navbar + main + Footer.
                On /admin/** routes it renders ONLY children with no public chrome,
                giving the admin panel its own fully standalone layout.
              */}
              <PublicShell>{children}</PublicShell>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
