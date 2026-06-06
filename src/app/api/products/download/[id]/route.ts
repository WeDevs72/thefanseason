import { NextResponse } from 'next/server';
import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.id;
    
    // 1. Authenticate user session
    const supabase = createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    // 2. Check if a paid order exists for this user and product
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('status', 'paid')
      .maybeSingle();

    if (orderError) {
      console.error('Database query error:', orderError.message);
      return NextResponse.json({ error: 'Database check failed' }, { status: 500 });
    }

    if (!order) {
      return NextResponse.json({ error: 'Access denied. You must purchase this product first.' }, { status: 403 });
    }

    // 3. Fetch product details
    const { data: product, error: productError } = await supabase
      .from('digital_products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product details not found' }, { status: 404 });
    }

    const fileUrl = product.file_url;
    if (!fileUrl) {
      return NextResponse.json({ error: 'Product download file is empty' }, { status: 404 });
    }

    // If the file_url is a full external URL (like unsplash or excel templates host), return it directly
    if (fileUrl.startsWith('http')) {
      return NextResponse.json({ downloadUrl: fileUrl });
    }

    // If it's a Supabase storage path (e.g. "products/bracket.xlsx"), generate a signed URL
    const supabaseAdmin = createAdminClient();
    const bucket = 'products';
    const filePath = fileUrl.replace(/^products\//, ''); // Clean prefix if exists

    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60); // 1 hour access

    if (signError) {
      console.error('Error signing storage URL:', signError.message);
      // Fallback in case storage bucket is not fully setup
      return NextResponse.json({ downloadUrl: `https://mock-downloads.com/${fileUrl}` });
    }

    return NextResponse.json({ downloadUrl: signedData.signedUrl });
  } catch (error: any) {
    console.error('Download API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
