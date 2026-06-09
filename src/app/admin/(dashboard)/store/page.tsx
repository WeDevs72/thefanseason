import React from 'react';
import { createAdminClient } from '@/lib/supabase-server';
import AdminStoreClient from './client';

export const revalidate = 0;

export default async function AdminStorePage() {
  const admin = createAdminClient();

  const [{ data: products }, { data: orders }] = await Promise.all([
    admin.from('digital_products').select('*').order('name', { ascending: true }),
    admin.from('orders').select(`
      *,
      profiles(username),
      digital_products(name)
    `).order('created_at', { ascending: false }).limit(50),
  ]);

  return <AdminStoreClient initialProducts={products || []} initialOrders={orders || []} />;
}
