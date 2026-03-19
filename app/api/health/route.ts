import { NextResponse } from 'next/server';

export async function GET() {
  // A simple, unprotected API route for testing latency and uptime
  // without triggering a 401 Unauthorized error.
  
  return NextResponse.json(
    { 
      status: "ok", 
      message: "This is a public diagnostic endpoint.",
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
