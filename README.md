# Everyday Matters Tracker / Planner

React app (Vite) with **account login** and cloud data on **Neon Postgres** via Vercel.

## Folder structure

```text
.
├── api/
│   ├── data.js              # Authenticated load/save → Neon
│   └── auth/                # register, login, logout, me, username check
├── db/schema.sql
├── lib/server/              # DB + auth helpers
├── server/dev-api.mjs
└── src/
```

## Accounts

- Create account with a **unique username** (letters, numbers, dots)
- Optional **email** (also unique) — sign in with username **or** email
- **Password**: at least 8 characters; only letters, numbers, `.`, and `/` (no commas or other symbols)
- If a username is taken, registration shows “That username is taken”
- Signing in on another browser/device loads the same saved data from Neon

## Neon / Vercel

1. Connect Neon and set `DATABASE_URL`
2. Schema auto-migrates on API requests (or run `db/schema.sql` once)
3. Deploy from repo root (default Root Directory)

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev:api   # terminal 1
npm run dev       # terminal 2
```

## Data that persists per account

Tasks, deleted tasks, settings, moods, mood entries, sleep, goals, and events.
