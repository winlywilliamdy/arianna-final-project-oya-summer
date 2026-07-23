import { randomUUID } from "node:crypto";
import {
  createSession,
  hashPassword,
  normalizeEmail,
  normalizeUsername,
  publicUser,
  validateEmail,
  validatePassword,
  validateUsername,
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
    const usernameRaw = String(body.username || "").trim();
    const emailRaw = String(body.email || "").trim();
    const password = String(body.password || "");

    const usernameError = validateUsername(usernameRaw);
    if (usernameError) {
      res.status(400).json({ error: usernameError });
      return;
    }
    const emailError = validateEmail(emailRaw, { required: false });
    if (emailError) {
      res.status(400).json({ error: emailError });
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      res.status(400).json({ error: passwordError });
      return;
    }

    const username = normalizeUsername(usernameRaw);
    const email = normalizeEmail(emailRaw);
    const sql = getSql();
    await ensureSchema(sql);

    const taken = await sql`
      SELECT id FROM users
      WHERE LOWER(username) = ${username}
      LIMIT 1
    `;
    if (taken.length) {
      res.status(409).json({ error: "That username is taken. Please choose another." });
      return;
    }

    if (email) {
      const emailTaken = await sql`
        SELECT id FROM users
        WHERE email IS NOT NULL AND LOWER(email) = ${email}
        LIMIT 1
      `;
      if (emailTaken.length) {
        res.status(409).json({ error: "That email is already registered." });
        return;
      }
    }

    const userId = randomUUID();
    const { salt, hash } = hashPassword(password);

    await sql`
      INSERT INTO users (id, username, email, password_hash, password_salt)
      VALUES (
        ${userId}::uuid,
        ${username},
        ${email || null},
        ${hash},
        ${salt}
      )
    `;
    await sql`
      INSERT INTO user_data (user_id)
      VALUES (${userId}::uuid)
    `;

    const token = await createSession(sql, userId);
    const rows = await sql`
      SELECT id, username, email, name FROM users WHERE id = ${userId}::uuid LIMIT 1
    `;

    res.status(201).json({
      ok: true,
      token,
      user: publicUser(rows[0]),
    });
  } catch (error) {
    console.error("[api/auth/register]", error);
    const msg = String(error?.message || "");
    if (msg.includes("users_username_unique") || msg.includes("username")) {
      res.status(409).json({ error: "That username is taken. Please choose another." });
      return;
    }
    if (msg.includes("users_email_unique") || msg.includes("email")) {
      res.status(409).json({ error: "That email is already registered." });
      return;
    }
    res.status(500).json({ error: error?.message || "Server error" });
  }
}
