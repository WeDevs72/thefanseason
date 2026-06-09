import React from 'react';
import { createAdminClient } from '@/lib/supabase-server';
import AdminUsersClient from './client';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from('profiles')
    .select(`
      *,
      leaderboard(total_points, accuracy_percent, rank)
    `)
    .order('created_at', { ascending: false });

  return <AdminUsersClient initialProfiles={profiles || []} />;
}
