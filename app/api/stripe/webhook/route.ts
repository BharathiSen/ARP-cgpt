import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
      console.error(`Webhook Error: ${error.message}`);
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.metadata?.userId;
      const customerEmail = session.customer_email || session.customer_details?.email;

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { isPaid: true },
        });
        console.log(`Payment successful for User ID: ${userId}`);
      } else if (customerEmail) {
        await prisma.user.update({
          where: { email: customerEmail },
          data: { isPaid: true },
        });
        console.log(`Payment successful for Email: ${customerEmail}`);
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
