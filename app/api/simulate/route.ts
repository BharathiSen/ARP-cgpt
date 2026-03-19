import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { projectId, endpoint, failureRate, latency } = await req.json();

  if (!projectId || !endpoint) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // Simulation Logic
  const random = Math.random() * 100;
  const isFailed = random < failureRate;
  const status = isFailed ? 'FAILED' : 'SUCCESS';
  
  // Realism: status-aware latency
  const actualLatency = isFailed 
    ? (latency + Math.random() * 500) // Failed requests often take longer
    : (latency + Math.random() * 50);

  let insight = '';
  if (isFailed) {
    insight = `Endpoint failed under ${failureRate}% error injection. Check if ${endpoint} handles graceful degradation.`;
  } else if (actualLatency > 500) {
    insight = `Endpoint is slow (avg. ${actualLatency.toFixed(0)}ms). Consider optimization or better scaling.`;
  } else {
    insight = `Endpoint performed well under simulation. System is resilient to current failure rates.`;
  }

  const simulation = await prisma.simulation.create({
    data: {
      projectId,
      endpoint,
      failureRate: parseFloat(failureRate),
      latency: parseInt(latency),
      status,
      avgLatency: actualLatency,
      insight,
    },
  });

  return NextResponse.json(simulation);
}
