# Setup

## Prerequisites

- Node.js 18+
- A [Strava API application](https://www.strava.com/settings/api)
- A [Supabase](https://supabase.com) project
- A [Vercel](https://vercel.com) account (for deployment)

---

## 1. Strava API app

1. Go to https://www.strava.com/settings/api
2. Create an app (name it anything — "TriLog" works)
3. Set **Authorization Callback Domain** to `localhost` for local dev, or your Vercel domain for production (e.g. `trilog.vercel.app`)
4. Note your **Client ID** and **Client Secret**

---

## 2. Supabase database

1. Create a free project at https://supabase.com
2. Open the **SQL Editor** and run the contents of `db/schema.sql`
3. Go to **Settings → Database → Connection string → Transaction pooler** (port 6543) and copy the URL

---

## 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
STRAVA_CLIENT_ID=        # from step 1
STRAVA_CLIENT_SECRET=    # from step 1
APP_URL=http://localhost:3000

DATABASE_URL=            # Supabase transaction pooler URL from step 2
SESSION_SECRET=          # random string, generate with:
                         # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, click **Connect with Strava**, and authorise.

---

## 5. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set the same environment variables in **Vercel → Project → Settings → Environment Variables**, and update:

```
APP_URL=https://your-app.vercel.app
```

Also update the **Authorization Callback Domain** in your Strava app settings to match your Vercel domain.
