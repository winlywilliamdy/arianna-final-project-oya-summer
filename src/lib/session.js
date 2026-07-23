const TOKEN_KEY = "planner-session-token";
const USER_KEY = "planner-session-user";

export function getSessionToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  setSession("", null);
  try {
    localStorage.removeItem("planner-user-id");
  } catch {
    /* ignore */
  }
}

/** Password: min 8; letters, numbers, `.` and `/` only. */
export function validatePasswordClient(password) {
  const raw = String(password || "");
  if (raw.length < 8) return "Password must be at least 8 characters.";
  if (!/^[A-Za-z0-9./]{8,128}$/.test(raw)) {
    return "Password may only use letters, numbers, dots (.), and slashes (/). No commas or other symbols.";
  }
  return "";
}

export function validateUsernameClient(username) {
  const raw = String(username || "").trim();
  if (!raw) return "Username is required.";
  if (!/^[A-Za-z0-9.]{3,32}$/.test(raw)) {
    return "Username must be 3–32 characters: letters, numbers, and dots only.";
  }
  return "";
}
