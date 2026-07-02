import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import sql from '@/lib/db';
import { DEFAULT_TARGETS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const userId = await getSession(request);
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const [userRow] = await sql`
    SELECT id, name, plan, targets FROM users WHERE id = ${userId}
  `;
  if (!userRow) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });

  const rows = await sql`
    SELECT id, date::text, sport, distance, duration, heart_rate, notes, exercises
    FROM sessions
    WHERE user_id = ${userId}
    ORDER BY date DESC
  `;

  const sessions = rows.map((r) => ({
    id: r.id,
    date: r.date,
    sport: r.sport,
    ...(r.distance  != null && { distance: r.distance }),
    duration: r.duration,
    ...(r.heart_rate != null && { heartRate: r.heart_rate }),
    ...(r.notes      && { notes: r.notes }),
    ...(r.exercises  && { exercises: r.exercises }),
    source: 'manual' as const,
  }));

  return NextResponse.json({
    user: { id: userRow.id, name: userRow.name },
    sessions,
    plan:    userRow.plan    ?? null,
    targets: userRow.targets ?? DEFAULT_TARGETS,
  });
}
