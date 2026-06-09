import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server';
import { NextRequest } from 'next/server';

function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

// POST /api/admin/badges — award a badge to a user
export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { userId, badgeId } = body;

  if (!userId || !badgeId) {
    return Response.json({ error: 'userId and badgeId are required' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check if badge already awarded
  const { data: existing } = await admin
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .maybeSingle();

  if (existing) {
    return Response.json({ error: 'Badge already awarded to this user' }, { status: 409 });
  }

  const { error } = await admin
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_id: badgeId,
      earned_at: new Date().toISOString(),
    });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}

// DELETE /api/admin/badges — revoke a badge from a user
export async function DELETE(request: NextRequest) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, badgeId } = await request.json();

  if (!userId || !badgeId) {
    return Response.json({ error: 'userId and badgeId are required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from('user_badges')
    .delete()
    .eq('user_id', userId)
    .eq('badge_id', badgeId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
