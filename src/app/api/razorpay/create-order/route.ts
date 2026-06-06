import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { amount, productId, userId } = await req.json();

    if (!amount || !userId) {
      return NextResponse.json({ error: 'Missing required parameters: amount, userId' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Graceful fallback for local development or testing without active Razorpay credentials
    if (!keyId || !keySecret || keyId === 'your_key_id' || keySecret === 'your_key_secret') {
      console.warn('Razorpay keys not configured. Generating a mock order ID for testing.');
      return NextResponse.json({
        orderId: `mock_order_${Math.random().toString(36).substring(2, 12)}`,
        isMock: true
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay amount in paise (INR * 100)
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: {
        productId: productId || 'fancard_premium_upgrade',
        userId: userId,
      },
    });

    return NextResponse.json({ orderId: order.id, isMock: false });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}
