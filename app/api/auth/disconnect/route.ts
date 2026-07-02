import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

export function POST(_request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  clearSession(response);
  return response;
}
