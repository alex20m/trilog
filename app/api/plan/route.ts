import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import sql from '@/lib/db';
import type { Plan } from '@/lib/types';

export async function PUT(request: NextRequest) {
  const userId = await getSession(request);
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const plan = await request.json() as Plan;
  await sql`UPDATE users SET plan = ${JSON.stringify(plan)} WHERE id = ${userId}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const userId = await getSession(request);
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  await sql`UPDATE users SET plan = NULL WHERE id = ${userId}`;
  return NextResponse.json({ ok: true });
}
