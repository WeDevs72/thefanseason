import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productId,
      userId,
      amountInr,
      isMock
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !userId) {
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 });
    }

    let isSignatureValid = false;

    // Check if mock order or actual verification is needed
    if (isMock || razorpay_order_id.startsWith('mock_')) {
      isSignatureValid = true;
    } else {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return NextResponse.json({ error: 'Razorpay secret key not configured on server' }, { status: 500 });
      }

      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');

      isSignatureValid = expectedSignature === razorpay_signature;
    }

    if (isSignatureValid) {
      // Initialize admin client to bypass RLS and insert/update orders and profiles
      const supabaseAdmin = createAdminClient();

      const finalProductId = productId && productId !== 'fancard_premium_upgrade' ? productId : null;

      // 1. Insert/Update order entry in orders table
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId,
          product_id: finalProductId,
          razorpay_order_id,
          razorpay_payment_id,
          amount_inr: amountInr || 0,
          status: 'paid'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error inserting order in database:', orderError.message);
        return NextResponse.json({ error: 'Failed to record paid order in database' }, { status: 500 });
      }

      // 2. If it was a fan card upgrade, mark profile as premium
      if (productId === 'fancard_premium_upgrade') {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ is_premium: true })
          .eq('id', userId);

        if (profileError) {
          console.error('Error upgrading profile to premium:', profileError.message);
          return NextResponse.json({ error: 'Failed to apply premium upgrade' }, { status: 500 });
        }
      }

      return NextResponse.json({ success: true, order: orderData });
    } else {
      return NextResponse.json({ success: false, error: 'Signature verification failed' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify payment' }, { status: 500 });
  }
}
