'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    // Admin routes — render children only, no Navbar/Footer
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>
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
    </>
  );
}
