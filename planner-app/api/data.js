import { cors, getSql, loadUserBundle, saveUserBundle } from "../lib/server/db.js";

function readUserId(req) {
  const header = req.headers["x-user-id"];
  const queryId = req.query?.userId;
  const bodyId = req.body?.userId;
  return String(header || queryId || bodyId || "").trim();
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    const userId = readUserId(req);
    if (!isUuid(userId)) {
      res.status(400).json({ error: "Valid userId (UUID) is required." });
      return;
    }

    const sql = getSql();

    if (req.method === "GET") {
      const data = await loadUserBundle(sql, userId);
      res.status(200).json({ ok: true, data });
      return;
    }

    if (req.method === "PUT" || req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
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
