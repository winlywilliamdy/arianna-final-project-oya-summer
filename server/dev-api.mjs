import http from "node:http";
import { URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cors, ensureSchema, getSql, loadUserBundle, saveUserBundle } from "../lib/server/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const text = fs.readFileSync(filePath, "utf8");
    text.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const idx = trimmed.indexOf("=");
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    });
  } catch {
    /* ignore */
  }
}

loadEnvFile(path.join(__dirname, "..", ".env.local"));
loadEnvFile(path.join(__dirname, "..", ".env"));

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:3001");

  if (req.method === "OPTIONS") {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.pathname !== "/api/data") {
    send(res, 404, { error: "Not found" });
    return;
  }

  try {
    const body = req.method === "GET" ? {} : await readBody(req);
    const userId = String(
      req.headers["x-user-id"] || url.searchParams.get("userId") || body.userId || ""
    ).trim();

    if (!isUuid(userId)) {
      send(res, 400, { error: "Valid userId (UUID) is required." });
      return;
    }

    const sql = getSql();
    await ensureSchema(sql);

    if (req.method === "GET") {
      const data = await loadUserBundle(sql, userId);
      send(res, 200, { ok: true, data });
      return;
    }

    if (req.method === "PUT" || req.method === "POST") {
      const data = await saveUserBundle(sql, userId, body);
      send(res, 200, { ok: true, data });
      return;
    }

    send(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    send(res, 500, { error: error?.message || "Server error" });
  }
});

const port = Number(process.env.API_PORT || 3001);
server.listen(port, () => {
  console.log(`Local Neon API listening on http://localhost:${port}`);
});
