import { createServerComponentClient, createAdminClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user and verify admin status
    const supabase = createServerComponentClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 3. Generate a safe, unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;

    const admin = createAdminClient();

    // 4. Ensure the private 'products' bucket exists
    try {
      await admin.storage.createBucket('products', {
        public: false,
      });
    } catch (e) {
      // Swallowed since the bucket might already exist
    }

    // 5. Upload the file to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { error } = await admin.storage
      .from('products')
      .upload(fileName, fileBuffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 6. Return compatible file URL format
    const fileUrl = `products/${fileName}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
    });
  } catch (err: any) {
    console.error('File upload API endpoint failure:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
