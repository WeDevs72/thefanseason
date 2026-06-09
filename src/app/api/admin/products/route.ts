import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server';
import { NextRequest } from 'next/server';

function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

// POST /api/admin/products — create a new product
export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, price_inr, category, file_url, preview_image } = body;

  if (!name || !price_inr || !category) {
    return Response.json({ error: 'name, price_inr, and category are required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from('digital_products')
    .insert({
      name,
      description: description || null,
      price_inr: Number(price_inr),
      category,
      file_url: file_url || null,
      preview_image: preview_image || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, product: data });
}

// PATCH /api/admin/products — update product (toggle active, edit fields)
export async function PATCH(request: NextRequest) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { productId, ...updates } = body;

  if (!productId) {
    return Response.json({ error: 'productId is required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from('digital_products')
    .update(updates)
    .eq('id', productId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}

// DELETE /api/admin/products — delete a product
export async function DELETE(request: NextRequest) {
  const supabase = createServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await request.json();

  if (!productId) {
    return Response.json({ error: 'productId is required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from('digital_products')
    .delete()
    .eq('id', productId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
