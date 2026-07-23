import { destroySession, readSessionToken } from "../../lib/server/auth.js";
import { cors, ensureSchema, getSql } from "../../lib/server/db.js";

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
    const sql = getSql();
    await ensureSchema(sql);
    const token = readSessionToken(req);
    await destroySession(sql, token);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[api/auth/logout]", error);
    res.status(500).json({ error: error?.message || "Server error" });
  }
}
