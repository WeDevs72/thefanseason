import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server';
import { NextRequest } from 'next/server';

function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

export async function PATCH(request: NextRequest) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { userId, is_premium, fan_card_tier } = body;

  if (!userId) {
    return Response.json({ error: 'userId is required' }, { status: 400 });
  }

  const admin = createAdminClient();
  const updates: Record<string, unknown> = {};

  if (typeof is_premium === 'boolean') updates.is_premium = is_premium;
  if (fan_card_tier) updates.fan_card_tier = fan_card_tier;

  const { error } = await admin
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
