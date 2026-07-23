import { useEffect, useMemo, useState } from "react";
import { checkUsernameAvailable } from "../../lib/apiClient";
import { useAuth } from "../../lib/AuthProvider";
import { validatePasswordClient, validateUsernameClient } from "../../lib/session";

export default function AuthView() {
  const { login, register, setError, error } = useAuth();
  const [mode, setMode] = useState("login");
  const [loginId, setLoginId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("");

  const formError = localError || error;

  useEffect(() => {
    if (mode !== "register") {
      setUsernameStatus("");
      return undefined;
    }
    const raw = username.trim();
    const formatError = validateUsernameClient(raw);
    if (!raw) {
      setUsernameStatus("");
      return undefined;
    }
    if (formatError) {
      setUsernameStatus(formatError);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailable(raw);
        if (cancelled) return;
        setUsernameStatus(result.available ? "Username is available." : result.error || "Taken.");
      } catch (err) {
        if (!cancelled) setUsernameStatus(err.message || "Could not check username.");
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [username, mode]);

  const usernameHintClass = useMemo(() => {
    if (!usernameStatus) return "";
    if (usernameStatus.includes("available")) return "auth-hint ok";
    return "auth-hint bad";
  }, [usernameStatus]);

  async function onSubmit(e) {
    e.preventDefault();
    setLocalError("");
    setError("");

    try {
      setBusy(true);
      if (mode === "login") {
        if (!loginId.trim()) throw new Error("Enter your username or email.");
        const passwordError = validatePasswordClient(password);
        if (passwordError) throw new Error(passwordError);
        await login({ login: loginId.trim(), password });
      } else {
        const usernameError = validateUsernameClient(username);
        if (usernameError) throw new Error(usernameError);
        if (usernameStatus && !usernameStatus.includes("available")) {
          throw new Error(usernameStatus);
        }
        const passwordError = validatePasswordClient(password);
        if (passwordError) throw new Error(passwordError);
        await register({
          username: username.trim(),
          email: email.trim(),
          password,
        });
      }
    } catch (err) {
      setLocalError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">Planner</div>
        <h1 className="auth-title">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Sign in with your username or email. Your tasks and routine sync everywhere you log in."
            : "Pick a unique username. Your data is saved to your account on any device."}
        </p>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab${mode === "login" ? " active" : ""}`}
            onClick={() => {
              setMode("login");
              setLocalError("");
              setError("");
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`auth-tab${mode === "register" ? " active" : ""}`}
            onClick={() => {
              setMode("register");
              setLocalError("");
              setError("");
            }}
          >
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {mode === "login" ? (
            <label className="auth-field">
              <span>Username or email</span>
              <input
                type="text"
                autoComplete="username"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="alex or alex@email.com"
              />
            </label>
          ) : (
            <>
              <label className="auth-field">
                <span>Username</span>
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your.name"
                  maxLength={32}
                />
                {usernameStatus ? <span className={usernameHintClass}>{usernameStatus}</span> : null}
              </label>
              <label className="auth-field">
                <span>Email (optional)</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
              </label>
            </>
          )}

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            <span className="auth-hint">
              Letters, numbers, dots (.), and slashes (/) only — no commas or other symbols.
            </span>
          </label>

          {formError ? <div className="auth-error">{formError}</div> : null}

          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
