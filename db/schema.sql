CREATE TABLE users (
  id                   SERIAL PRIMARY KEY,
  strava_athlete_id    BIGINT UNIQUE NOT NULL,
  strava_refresh_token TEXT NOT NULL,
  name                 TEXT,
  plan                 JSONB,
  targets              JSONB,
  created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sessions (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  sport       TEXT NOT NULL,
  distance    REAL,
  duration    INTEGER,
  heart_rate  INTEGER,
  notes       TEXT,
  exercises   JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX sessions_user_date ON sessions (user_id, date);
