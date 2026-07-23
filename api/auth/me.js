import { publicUser, readSessionToken, resolveSessionUser } from "../../lib/server/auth.js";
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
    const sql = getSql();
    await ensureSchema(sql);
    const token = readSessionToken(req);
    const user = await resolveSessionUser(sql, token);
    if (!user) {
      res.status(401).json({ error: "Not signed in." });
      return;
    }
    res.status(200).json({ ok: true, user: publicUser(user) });
  } catch (error) {
    console.error("[api/auth/me]", error);
    res.status(500).json({ error: error?.message || "Server error" });
  }
}
