# Planner App (React + Neon)

React rewrite of `fr-08-tasks.html` with **Vite + React**, and cloud data storage on **Neon (Postgres) via Vercel**.

## Folder structure

```text
planner-app/
├── api/data.js              # Vercel serverless API → Neon
├── db/schema.sql            # Run once in Neon SQL Editor
├── lib/server/db.js         # DB helpers
├── server/dev-api.mjs       # Local API for Vite proxy
├── .env.example
└── src/
    ├── lib/DataProvider.jsx # Loads/saves cloud + local cache
    ├── hooks/               # Tasks, settings, routine, events
    └── components/
```

## 1) Create Neon database (Vercel)

1. Open your project on [Vercel](https://vercel.com)
2. Go to **Storage** → create / connect **Neon Postgres**
3. Copy the **`DATABASE_URL`** connection string
4. In Vercel → **Settings → Environment Variables**, add:
   - `DATABASE_URL` = your Neon URL
5. In the Neon SQL Editor, paste and run `db/schema.sql`

## 2) Local setup

```bash
cd planner-app
cp .env.example .env.local
# paste DATABASE_URL into .env.local

npm install

# terminal 1 — API (talks to Neon)
npm run dev:api

# terminal 2 — React app
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

## How storage works

- Each browser gets a stable `planner-user-id` (UUID) in localStorage
- App data is stored in Neon tables `users` + `user_data`
- UI updates save locally immediately, then sync to Neon (debounced)
- If Neon is unreachable, the app keeps working from the local cache
- First successful cloud load migrates any existing localStorage data into Neon

## Deploy to Vercel

```bash
cd planner-app
npx vercel
```

Make sure `DATABASE_URL` is set in the Vercel project env vars, then redeploy.

## Data that persists

Tasks, deleted tasks, settings (name/theme/font/wallpaper), moods, mood entries, sleep, goals, and events.
