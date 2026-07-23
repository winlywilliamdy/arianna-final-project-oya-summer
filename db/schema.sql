-- Neon / Postgres schema for Planner App (with accounts)

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT,
  password_salt TEXT,
  name TEXT NOT NULL DEFAULT '',
  wallpaper TEXT NOT NULL DEFAULT '',
  theme TEXT NOT NULL DEFAULT 'light',
  accent TEXT NOT NULL DEFAULT '#9a8ad8',
  font TEXT NOT NULL DEFAULT 'sans-serif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_data (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  deleted_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  moods JSONB NOT NULL DEFAULT '[]'::jsonb,
  mood_entries JSONB NOT NULL DEFAULT '{}'::jsonb,
  sleep JSONB NOT NULL DEFAULT '{}'::jsonb,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON user_data (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users ((LOWER(username)));
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users ((LOWER(email)));
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);
