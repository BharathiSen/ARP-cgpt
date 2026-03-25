import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

import { getCachedOrFetch, redisCache } from '@/lib/cache';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const cacheKey = `user_projects:${userId}`;

  // Fetch projects from cache or database (15s TTL)
  const projects = await getCachedOrFetch(
    cacheKey,
    async () => {
      return prisma.project.findMany({
        where: { userId },
        include: { simulations: true },
      });
    },
    15
  );

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { name, description } = await req.json();
  
  const project = await prisma.project.create({
    data: {
      name,
      description,
      userId,
    },
  });

  // Invalidate Redis Cache since data mutated
  if (redisCache) {
    await redisCache.del(`user_projects:${userId}`);
  }

  return NextResponse.json(project);
}
