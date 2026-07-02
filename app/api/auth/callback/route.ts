import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get('code');
  const error = searchParams.get('error');
  const appUrl = process.env.APP_URL ?? '';

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}?error=access_denied`);
  }

  try {
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) throw new Error('Token exchange failed');

    const { refresh_token, athlete } = await tokenRes.json() as {
      refresh_token: string;
      athlete: { id: number; firstname?: string };
    };

    const [row] = await sql`
      INSERT INTO users (strava_athlete_id, strava_refresh_token, name)
      VALUES (${athlete.id}, ${refresh_token}, ${athlete.firstname ?? null})
      ON CONFLICT (strava_athlete_id)
      DO UPDATE SET strava_refresh_token = EXCLUDED.strava_refresh_token
      RETURNING id
    `;

    const response = NextResponse.redirect(`${appUrl}?connected=1`);
    await createSession(response, row.id as number);
    return response;
  } catch (err) {
    console.error('Strava callback error:', err);
    return NextResponse.redirect(`${appUrl}?error=token_exchange_failed`);
  }
}
