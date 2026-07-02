# TriLog

A personal triathlon training tracker with Strava sync, structured workout plans, and cross-device sync via user accounts.

Built with Next.js 15, TypeScript, Supabase Postgres, and deployed on Vercel.

## Features

- Strava sync — activities pulled automatically via OAuth
- Manual session logging with heart rate tracking
- AI-generated training plans with structured workout steps (warmup, intervals, cooldown, paces)
- Weekly progress tracking against targets
- Monthly calendar view
- Cross-device sync — data lives in Postgres, not the browser

## Project structure

```
trilog/
├── app/
│   ├── page.tsx                  ← entry point
│   ├── layout.tsx
│   └── api/
│       ├── state/                ← load all user data on mount
│       ├── sessions/             ← create / delete manual sessions
│       ├── plan/                 ← save / clear training plan
│       ├── targets/              ← save weekly targets
│       ├── activities/           ← fetch Strava activities
│       └── auth/
│           ├── strava/           ← redirect to Strava OAuth
│           ├── callback/         ← exchange code, upsert user, set session
│           └── disconnect/       ← logout
├── components/
│   ├── TriLog.tsx                ← root shell
│   ├── WeekView.tsx
│   ├── CalendarView.tsx
│   ├── AddView.tsx
│   ├── PlanView.tsx
│   ├── SessionRow.tsx
│   └── ui.tsx
├── lib/
│   ├── types.ts
│   ├── constants.ts
│   ├── helpers.ts
│   ├── db.ts                     ← Postgres client
│   └── session.ts                ← JWT session helpers
├── db/
│   └── schema.sql
└── docs/
    ├── PLAN_FORMAT.md
    └── example-plan.json
```

## Auth & data model

Login is "Sign in with Strava" — no passwords. The Strava OAuth callback upserts a `users` row keyed on the athlete's Strava ID and stores the refresh token there. A signed JWT in an HttpOnly cookie (`tl_session`) identifies the user on subsequent requests. Manual sessions, the training plan, and weekly targets are all stored in Postgres per user.

Strava activities are never persisted — they are fetched live on each sync.

See [SETUP.md](SETUP.md) to get it running.
