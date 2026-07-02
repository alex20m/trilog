import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import sql from '@/lib/db';
import type { Session } from '@/lib/types';

export async function POST(request: NextRequest) {
  const userId = await getSession(request);
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = await request.json() as Session;

  const [row] = await sql`
    INSERT INTO sessions (user_id, date, sport, distance, duration, heart_rate, notes, exercises)
    VALUES (
      ${userId},
      ${body.date},
      ${body.sport},
      ${body.distance ?? null},
      ${body.duration},
      ${body.heartRate ?? null},
      ${body.notes ?? null},
      ${body.exercises ? JSON.stringify(body.exercises) : null}
    )
    RETURNING id
  `;

  return NextResponse.json({ id: row.id }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const userId = await getSession(request);
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id') ?? '');
  if (isNaN(id)) return NextResponse.json({ error: 'missing_id' }, { status: 400 });

  await sql`DELETE FROM sessions WHERE id = ${id} AND user_id = ${userId}`;
  return NextResponse.json({ ok: true });
}
