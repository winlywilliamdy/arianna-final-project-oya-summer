import { neon } from "@neondatabase/serverless";

let schemaReady;

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing DATABASE_URL. Add your Neon connection string in Vercel env vars.");
  }
  return neon(url);
}

/** Create / migrate tables if missing (safe to call on every request; runs once per cold start). */
export async function ensureSchema(sql) {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    await sql`
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
      )
    `;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_salt TEXT`;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique
      ON users (LOWER(username))
      WHERE username IS NOT NULL
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique
      ON users (LOWER(email))
      WHERE email IS NOT NULL AND email <> ''
    `;

    await sql`
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
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON user_data (updated_at DESC)
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at)`;
    await sql`DELETE FROM sessions WHERE expires_at <= NOW()`;
  })().catch((err) => {
    schemaReady = undefined;
    throw err;
  });
  return schemaReady;
}

export function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Session-Token, X-User-Id"
  );
}

export function emptyPayload() {
  return {
    settings: {
      name: "",
      wallpaper: "",
      theme: "light",
      accent: "#9a8ad8",
      font: "sans-serif",
    },
    tasks: [],
    deletedTasks: [],
    moods: [],
    moodEntries: {},
    sleep: {
      alarms: [],
      logs: [],
      timerRunning: false,
      timerStartedAt: null,
      timerElapsedMs: 0,
    },
    goals: [],
    events: [],
  };
}

export async function ensureUserRow(sql, userId) {
  await sql`
    INSERT INTO user_data (user_id)
    VALUES (${userId}::uuid)
    ON CONFLICT (user_id) DO NOTHING
  `;
}

export async function loadUserBundle(sql, userId) {
  await ensureUserRow(sql, userId);

  const rows = await sql`
    SELECT
      u.name,
      u.wallpaper,
      u.theme,
      u.accent,
      u.font,
      d.tasks,
      d.deleted_tasks,
      d.moods,
      d.mood_entries,
      d.sleep,
      d.goals,
      d.events
    FROM users u
    JOIN user_data d ON d.user_id = u.id
    WHERE u.id = ${userId}::uuid
    LIMIT 1
  `;

  if (!rows.length) return emptyPayload();

  const row = rows[0];
  return {
    settings: {
      name: row.name || "",
      wallpaper: row.wallpaper || "",
      theme: row.theme || "light",
      accent: row.accent || "#9a8ad8",
      font: row.font || "sans-serif",
    },
    tasks: row.tasks || [],
    deletedTasks: row.deleted_tasks || [],
    moods: row.moods || [],
    moodEntries: row.mood_entries || {},
    sleep: row.sleep || emptyPayload().sleep,
    goals: row.goals || [],
    events: row.events || [],
  };
}

export async function saveUserBundle(sql, userId, patch) {
  await ensureUserRow(sql, userId);

  if (patch.settings) {
    const s = {
      name: patch.settings.name ?? "",
      wallpaper: patch.settings.wallpaper ?? "",
      theme: patch.settings.theme ?? "light",
      accent: patch.settings.accent ?? "#9a8ad8",
      font: patch.settings.font ?? "sans-serif",
    };
    await sql`
      UPDATE users SET
        name = ${s.name},
        wallpaper = ${s.wallpaper},
        theme = ${s.theme},
        accent = ${s.accent},
        font = ${s.font},
        updated_at = NOW()
      WHERE id = ${userId}::uuid
    `;
  }

  const current = await loadUserBundle(sql, userId);
  const next = {
    tasks: patch.tasks ?? current.tasks,
    deletedTasks: patch.deletedTasks ?? current.deletedTasks,
    moods: patch.moods ?? current.moods,
    moodEntries: patch.moodEntries ?? current.moodEntries,
    sleep: patch.sleep ?? current.sleep,
    goals: patch.goals ?? current.goals,
    events: patch.events ?? current.events,
  };

  await sql`
    UPDATE user_data SET
      tasks = ${next.tasks},
      deleted_tasks = ${next.deletedTasks},
      moods = ${next.moods},
      mood_entries = ${next.moodEntries},
      sleep = ${next.sleep},
      goals = ${next.goals},
      events = ${next.events},
      updated_at = NOW()
    WHERE user_id = ${userId}::uuid
  `;

  return loadUserBundle(sql, userId);
}
