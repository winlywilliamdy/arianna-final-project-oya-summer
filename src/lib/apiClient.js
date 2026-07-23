import { clearSession, getSessionToken, setSession } from "./session";

async function parseJson(res) {
  return res.json().catch(() => ({}));
}

function authHeaders(extra = {}) {
  const token = getSessionToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}`, "X-Session-Token": token } : {}),
    ...extra,
  };
}

async function authRequest(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await parseJson(res);
  if (!res.ok) {
    throw new Error(payload.error || `Request failed (${res.status})`);
  }
  return payload;
}

export async function registerAccount({ username, email, password }) {
  const payload = await authRequest("/api/auth/register", {
    method: "POST",
    body: { username, email, password },
  });
  setSession(payload.token, payload.user);
  return payload;
}

export async function loginAccount({ login, password }) {
  const payload = await authRequest("/api/auth/login", {
    method: "POST",
    body: { login, password },
  });
  setSession(payload.token, payload.user);
  return payload;
}

export async function logoutAccount() {
  try {
    await authRequest("/api/auth/logout", { method: "POST", body: {} });
  } catch {
    /* still clear local session */
  }
  clearSession();
}

export async function fetchSessionUser() {
  const token = getSessionToken();
  if (!token) return null;
  try {
    const payload = await authRequest("/api/auth/me");
    if (payload.user) setSession(token, payload.user);
    return payload.user;
  } catch {
    clearSession();
    return null;
  }
}

export async function checkUsernameAvailable(username) {
  const res = await fetch(`/api/auth/username?username=${encodeURIComponent(username)}`, {
    headers: authHeaders(),
  });
  const payload = await parseJson(res);
  if (!res.ok) {
    throw new Error(payload.error || `Request failed (${res.status})`);
  }
  return payload;
}

async function dataRequest(method, body) {
  const token = getSessionToken();
  if (!token) throw new Error("Please sign in to sync your data.");

  const res = await fetch("/api/data", {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await parseJson(res);
  if (!res.ok) {
    if (res.status === 401) clearSession();
    throw new Error(payload.error || `Request failed (${res.status})`);
  }
  return payload.data;
}

export function fetchCloudData() {
  return dataRequest("GET");
}

export function saveCloudData(patch) {
  return dataRequest("PUT", patch);
}
