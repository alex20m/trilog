# TriLog — Triathlon Training Log with Strava Sync

A personal training log that auto-syncs from Strava (and Garmin via Strava). Built with React + Vite, deployed on Vercel.

---

## Setup (one-time, ~10 minutes)

### 1. Create a Strava API app

1. Go to https://www.strava.com/settings/api
2. Create an app (name it anything — "TriLog" works)
3. Set **Authorization Callback Domain** to your Vercel domain, e.g. `trilog.vercel.app`
4. Note your **Client ID** and **Client Secret**

### 2. Deploy to Vercel

```bash
npm install -g vercel   # if not already installed
npm install
vercel                  # follow prompts, link or create a project
```

### 3. Set environment variables in Vercel

In your Vercel project dashboard → Settings → Environment Variables, add:

| Name | Value |
|------|-------|
| `STRAVA_CLIENT_ID` | Your Strava app Client ID |
| `STRAVA_CLIENT_SECRET` | Your Strava app Client Secret |
| `APP_URL` | Your Vercel deployment URL, e.g. `https://trilog.vercel.app` |

Then redeploy:
```bash
vercel --prod
```

### 4. Connect Strava

Open your deployed app, click **Connect Strava**, and authorise. That's it — your Garmin activities (synced via Strava) will appear automatically.

---

## Local development

```bash
vercel dev   # runs both Vite and the serverless functions together
```

Then open http://localhost:3000.

---

## Project structure

```
trilog/
├── api/
│   ├── auth/
│   │   ├── strava.js      ← redirects to Strava OAuth
│   │   ├── callback.js    ← exchanges code for token, sets cookie
│   │   └── disconnect.js  ← clears the auth cookie
│   └── activities.js      ← fetches activities from Strava
├── src/
│   ├── App.jsx            ← main React app
│   └── main.jsx           ← entry point
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## How auth works

No database required. The Strava refresh token is stored in a secure `HttpOnly` cookie set by the server. On every `/api/activities` call, the server:
1. Reads the refresh token from the cookie
2. Gets a fresh access token from Strava (they expire every 6h)
3. Fetches your last 60 days of Run/Ride/Swim activities
4. Returns them in TriLog format

Strava sessions are merged with any manually logged sessions on the frontend.
