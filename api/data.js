import { readSessionToken, resolveSessionUser } from "../lib/server/auth.js";
import { cors, ensureSchema, getSql, loadUserBundle, saveUserBundle } from "../lib/server/db.js";

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

  try {
    const sql = getSql();
    await ensureSchema(sql);

    const token = readSessionToken(req);
    const sessionUser = await resolveSessionUser(sql, token);
    if (!sessionUser) {
      res.status(401).json({ error: "Please sign in to sync your data." });
      return;
    }

    const userId = sessionUser.id;

    if (req.method === "GET") {
      const data = await loadUserBundle(sql, userId);
      res.status(200).json({ ok: true, data });
      return;
    }

    if (req.method === "PUT" || req.method === "POST") {
      const body = readBody(req);
      const data = await saveUserBundle(sql, userId, body);
      res.status(200).json({ ok: true, data });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("[api/data]", error);
    res.status(500).json({
      error: error?.message || "Server error",
    });
  }
}
