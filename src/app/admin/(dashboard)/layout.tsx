import React from 'react';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase-server';
import AdminSidebar from '@/components/admin/AdminSidebar';

function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  if (!isAdmin(user.email)) {
    // Signed in but not admin — boot to admin login with error
    redirect('/admin/login?error=unauthorized');
  }

  return (
    // This div uses a special class to hide the public Navbar/Footer via globals.css
    // and renders the full admin panel in its own layout system
    <div className="admin-shell fixed inset-0 z-50 flex bg-[#050507] overflow-hidden">
      <AdminSidebar adminEmail={user.email!} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

