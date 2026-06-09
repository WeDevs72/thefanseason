import React from 'react';
import { createAdminClient } from '@/lib/supabase-server';
import AdminBadgesClient from './client';

export const revalidate = 0;

export default async function AdminBadgesPage() {
  const admin = createAdminClient();

  const [{ data: badges }, { data: userBadges }, { data: profiles }] = await Promise.all([
    admin.from('badges').select('*').order('id'),
    admin.from('user_badges').select(`
      *,
      profiles(username)
    `).order('earned_at', { ascending: false }),
    admin.from('profiles').select('id, username').order('username'),
  ]);

  return (
    <AdminBadgesClient
      badges={badges || []}
      userBadges={userBadges || []}
      profiles={profiles || []}
    />
  );
}
