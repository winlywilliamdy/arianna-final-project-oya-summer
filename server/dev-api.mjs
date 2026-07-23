import http from "node:http";
import { URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { cors } from "../lib/server/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.join(__dirname, "..", "api");

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
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Session-Token, X-User-Id",
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

function resolveApiModule(pathname) {
  const rel = pathname.replace(/^\/api\/?/, "");
  if (!rel || rel.includes("..")) return null;
  const filePath = path.join(apiRoot, `${rel}.js`);
  if (!fs.existsSync(filePath)) return null;
  return filePath;
}

function makeRes(nodeRes) {
  const headers = {};
  return {
    statusCode: 200,
    setHeader(key, value) {
      headers[key] = value;
      nodeRes.setHeader(key, value);
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      const body = JSON.stringify(payload);
      if (!nodeRes.headersSent) {
        nodeRes.writeHead(this.statusCode || 200, {
          "Content-Type": "application/json",
          ...headers,
        });
      }
      nodeRes.end(body);
    },
    end(body) {
      if (!nodeRes.headersSent) {
        nodeRes.writeHead(this.statusCode || 204, headers);
      }
      nodeRes.end(body || "");
    },
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:3001");

  if (req.method === "OPTIONS") {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  const modulePath = resolveApiModule(url.pathname);
  if (!modulePath) {
    send(res, 404, { error: "Not found" });
    return;
  }

  try {
    const body = ["GET", "HEAD"].includes(req.method) ? {} : await readBody(req);
    const query = Object.fromEntries(url.searchParams.entries());
    const fakeReq = {
      method: req.method,
      headers: req.headers,
      body,
      query,
    };
    const fakeRes = makeRes(res);
    const mod = await import(pathToFileURL(modulePath).href + `?t=${Date.now()}`);
    await mod.default(fakeReq, fakeRes);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) send(res, 500, { error: error?.message || "Server error" });
  }
});

const port = Number(process.env.API_PORT || 3001);
server.listen(port, () => {
  console.log(`Local Neon API listening on http://localhost:${port}`);
});
