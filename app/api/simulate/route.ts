import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runRealSimulation } from '@/lib/simulator';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { projectId, endpoint } = await req.json();

  if (!projectId || !endpoint) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const simulation = await runRealSimulation(projectId, endpoint);

  return NextResponse.json(simulation);
}
