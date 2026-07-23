import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchSessionUser,
  loginAccount,
  logoutAccount,
  registerAccount,
} from "./apiClient";
import { getSessionToken, getStoredUser } from "./session";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [status, setStatus] = useState(() => (getSessionToken() ? "loading" : "anonymous"));
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!getSessionToken()) {
        setStatus("anonymous");
        setUser(null);
        return;
      }
      setStatus("loading");
      const next = await fetchSessionUser();
      if (cancelled) return;
      if (next) {
        setUser(next);
        setStatus("authenticated");
        setError("");
      } else {
        setUser(null);
        setStatus("anonymous");
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ login: loginId, password }) => {
    setError("");
    const payload = await loginAccount({ login: loginId, password });
    setUser(payload.user);
    setStatus("authenticated");
    return payload.user;
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    setError("");
    const payload = await registerAccount({ username, email, password });
    setUser(payload.user);
    setStatus("authenticated");
    return payload.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutAccount();
    setUser(null);
    setStatus("anonymous");
    setError("");
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      error,
      setError,
      isAuthenticated: status === "authenticated",
      login,
      register,
      logout,
    }),
    [user, status, error, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
