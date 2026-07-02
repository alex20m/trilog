import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import sql from '@/lib/db';

interface StravaActivity {
  id: number;
  type: string;
  start_date_local: string;
  distance: number;
  moving_time: number;
  name: string;
  average_heartrate?: number;
}

export async function GET(request: NextRequest) {
  const userId = await getSession(request);
  if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const [userRow] = await sql`
    SELECT strava_refresh_token FROM users WHERE id = ${userId}
  `;
  if (!userRow) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });

  const refreshToken = userRow.strava_refresh_token as string;

  try {
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ error: 'token_expired' }, { status: 401 });
    }

    const { access_token, refresh_token: newRefreshToken } = await tokenRes.json() as {
      access_token: string;
      refresh_token: string;
    };

    // Rotate refresh token in DB if Strava issued a new one
    if (newRefreshToken && newRefreshToken !== refreshToken) {
      await sql`UPDATE users SET strava_refresh_token = ${newRefreshToken} WHERE id = ${userId}`;
    }

    const after = Math.floor(Date.now() / 1000) - 60 * 24 * 60 * 60;
    const actRes = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=100&after=${after}`,
      { headers: { Authorization: `Bearer ${access_token}` } },
    );

    if (!actRes.ok) throw new Error('Strava activities fetch failed');

    const activities = await actRes.json() as StravaActivity[];

    const sessions = activities
      .filter((a) => ['Run', 'Ride', 'Swim', 'VirtualRide', 'WeightTraining'].includes(a.type))
      .map((a) => ({
        id: `strava_${a.id}`,
        date: a.start_date_local.split('T')[0],
        sport: a.type === 'Run' ? 'run' : a.type.includes('Ride') ? 'bike' : a.type === 'Swim' ? 'swim' : 'gym',
        distance: Math.round((a.distance / 1000) * 10) / 10,
        duration: Math.round(a.moving_time / 60),
        ...(a.average_heartrate && { heartRate: Math.round(a.average_heartrate) }),
        notes: a.name,
        source: 'strava' as const,
      }));

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error('Activities error:', err);
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}
