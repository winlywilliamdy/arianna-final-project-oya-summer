import {
  createSession,
  normalizeEmail,
  normalizeUsername,
  publicUser,
  verifyPassword,
} from "../../lib/server/auth.js";
import { cors, ensureSchema, getSql } from "../../lib/server/db.js";

function readBody(req) {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}");
    } catch {
      return {};
    }
  }
  return req.body || {};
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = readBody(req);
    const login = String(body.login || body.username || body.email || "").trim();
    const password = String(body.password || "");

    if (!login) {
      res.status(400).json({ error: "Enter your username or email." });
      return;
    }
    if (!password) {
      res.status(400).json({ error: "Password is required." });
      return;
    }

    const sql = getSql();
    await ensureSchema(sql);

    const isEmail = login.includes("@");
    const key = isEmail ? normalizeEmail(login) : normalizeUsername(login);

    const rows = isEmail
      ? await sql`
          SELECT id, username, email, name, password_hash, password_salt
          FROM users
          WHERE email IS NOT NULL AND LOWER(email) = ${key}
          LIMIT 1
        `
      : await sql`
          SELECT id, username, email, name, password_hash, password_salt
          FROM users
          WHERE LOWER(username) = ${key}
          LIMIT 1
        `;

    const user = rows[0];
    if (!user?.password_hash || !user?.password_salt) {
      res.status(401).json({ error: "Incorrect username/email or password." });
      return;
    }

    const ok = verifyPassword(password, user.password_salt, user.password_hash);
    if (!ok) {
      res.status(401).json({ error: "Incorrect username/email or password." });
      return;
    }

    const token = await createSession(sql, user.id);
    res.status(200).json({
      ok: true,
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("[api/auth/login]", error);
    res.status(500).json({ error: error?.message || "Server error" });
  }
}
