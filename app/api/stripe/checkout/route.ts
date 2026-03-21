import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { email } = session.user;

    const base_url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AI Reliability Lab Pro Subscription',
              description: 'Unlock full access to dashboard and core features.',
            },
            unit_amount: 2900, // $29.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${base_url}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base_url}/pricing`,
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
