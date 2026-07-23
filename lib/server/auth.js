import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** Username: 3–32 chars, letters/numbers/dots only (unique, case-insensitive). */
export const USERNAME_RE = /^[A-Za-z0-9.]{3,32}$/;

/** Password: min 8 chars; letters, numbers, `.` and `/` only — no commas or other symbols. */
export const PASSWORD_RE = /^[A-Za-z0-9./]{8,128}$/;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

export function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return email || "";
}

export function validateUsername(username) {
  const raw = String(username || "").trim();
  if (!raw) return "Username is required.";
  if (!USERNAME_RE.test(raw)) {
    return "Username must be 3–32 characters: letters, numbers, and dots only.";
  }
  return "";
}

export function validatePassword(password) {
  const raw = String(password || "");
  if (raw.length < 8) return "Password must be at least 8 characters.";
  if (!PASSWORD_RE.test(raw)) {
    return "Password may only use letters, numbers, dots (.), and slashes (/). No commas or other symbols.";
  }
  return "";
}

export function validateEmail(email, { required = false } = {}) {
  const raw = String(email || "").trim();
  if (!raw) return required ? "Email is required." : "";
  if (!EMAIL_RE.test(raw)) return "Enter a valid email address.";
  return "";
}

export function hashPassword(password, saltHex = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, saltHex, 64).toString("hex");
  return { salt: saltHex, hash };
}

export function verifyPassword(password, saltHex, hashHex) {
  try {
    const { hash } = hashPassword(password, saltHex);
    const a = Buffer.from(hash, "hex");
    const b = Buffer.from(hashHex, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function createSessionToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function readSessionToken(req) {
  const auth = req.headers?.authorization || req.headers?.Authorization || "";
  if (typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  const header = req.headers?.["x-session-token"] || req.headers?.["X-Session-Token"];
  if (header) return String(header).trim();
  if (req.query?.token) return String(req.query.token).trim();
  return "";
}

export async function resolveSessionUser(sql, token) {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const rows = await sql`
    SELECT
      u.id,
      u.username,
      u.email,
      u.name,
      s.expires_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${tokenHash}
      AND s.expires_at > NOW()
    LIMIT 1
  `;
  if (!rows.length) return null;
  return rows[0];
}

export async function createSession(sql, userId, days = 30) {
  const token = createSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  await sql`
    INSERT INTO sessions (token_hash, user_id, expires_at)
    VALUES (${tokenHash}, ${userId}::uuid, ${expiresAt}::timestamptz)
  `;
  return token;
}

export async function destroySession(sql, token) {
  if (!token) return;
  const tokenHash = hashToken(token);
  await sql`DELETE FROM sessions WHERE token_hash = ${tokenHash}`;
}

export function publicUser(row) {
  return {
    id: row.id,
    username: row.username || "",
    email: row.email || "",
    name: row.name || "",
  };
}
