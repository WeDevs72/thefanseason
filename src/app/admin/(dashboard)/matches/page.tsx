import React from 'react';
import { createAdminClient } from '@/lib/supabase-server';
import AdminMatchesClient from './client';

export const revalidate = 0;

export default async function AdminMatchesPage() {
  const admin = createAdminClient();

  const { data: matches } = await admin
    .from('matches')
    .select('*')
    .order('match_date', { ascending: false });

  return <AdminMatchesClient initialMatches={matches || []} />;
}
