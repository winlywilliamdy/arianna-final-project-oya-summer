import { normalizeUsername, validateUsername } from "../../lib/server/auth.js";
import { cors, ensureSchema, getSql } from "../../lib/server/db.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const usernameRaw = String(req.query?.username || "").trim();
    const usernameError = validateUsername(usernameRaw);
    if (usernameError) {
      res.status(200).json({ ok: true, available: false, error: usernameError });
      return;
    }

    const username = normalizeUsername(usernameRaw);
    const sql = getSql();
    await ensureSchema(sql);
    const rows = await sql`
      SELECT id FROM users WHERE LOWER(username) = ${username} LIMIT 1
    `;

    if (rows.length) {
      res.status(200).json({
        ok: true,
        available: false,
        error: "That username is taken. Please choose another.",
      });
      return;
    }

    res.status(200).json({ ok: true, available: true, error: "" });
  } catch (error) {
    console.error("[api/auth/username]", error);
    res.status(500).json({ error: error?.message || "Server error" });
  }
}
