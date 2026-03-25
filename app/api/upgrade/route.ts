import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendUpgradeEmail } from '@/lib/email';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isPaid: true },
    });

    // Fire off async email
    if (user.email && user.name) {
      sendUpgradeEmail(user.email, user.name).catch(console.error);
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Upgrade Error:', error);
    return NextResponse.json({ error: 'Failed to upgrade user' }, { status: 500 });
  }
}