import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import sql from '@/lib/db';
import type { WeekTargets } from '@/lib/types';

export async function PUT(request: NextRequest) {
  const userId = await getSession(request);
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const targets = await request.json() as WeekTargets;
  await sql`UPDATE users SET targets = ${JSON.stringify(targets)} WHERE id = ${userId}`;
  return NextResponse.json({ ok: true });
}
