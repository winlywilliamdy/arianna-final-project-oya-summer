-- Neon / Postgres schema for Planner App
-- Run this once in the Neon SQL Editor (or via psql).

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
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

CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON user_data (updated_at DESC);
