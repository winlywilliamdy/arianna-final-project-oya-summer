import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_MOODS, MIN_GOALS } from "./constants";
import { emptyGoals, defaultSleepData } from "./normalize";
import { fetchCloudData, saveCloudData } from "./apiClient";
import { useAuth } from "./AuthProvider";
import {
  ACCENT_COLOR_KEY,
  DELETED_STORAGE_KEY,
  EVENTS_KEY,
  FONT_KEY,
  GOALS_KEY,
  MOOD_ENTRIES_KEY,
  MOODS_KEY,
  SLEEP_KEY,
  STORAGE_KEY,
  THEME_KEY,
  USER_NAME_KEY,
  WALLPAPER_KEY,
} from "./storageKeys";

const DataContext = createContext(null);

function cachePrefix(userId) {
  return userId ? `fr08-${userId}-` : "fr08-guest-";
}

function keyed(userId, base) {
  return `${cachePrefix(userId)}${base}`;
}

function readLocalJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function readLocalString(key, fallback = "") {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function localBundle(userId) {
  return {
    settings: {
      name: readLocalString(keyed(userId, USER_NAME_KEY), readLocalString(USER_NAME_KEY, "")),
      wallpaper: readLocalString(keyed(userId, WALLPAPER_KEY), readLocalString(WALLPAPER_KEY, "")),
      theme: readLocalString(keyed(userId, THEME_KEY), readLocalString(THEME_KEY, "light")),
      accent: readLocalString(keyed(userId, ACCENT_COLOR_KEY), readLocalString(ACCENT_COLOR_KEY, "#9a8ad8")),
      font: readLocalString(keyed(userId, FONT_KEY), readLocalString(FONT_KEY, "sans-serif")),
    },
    tasks: readLocalJson(keyed(userId, STORAGE_KEY), readLocalJson(STORAGE_KEY, [])),
    deletedTasks: readLocalJson(keyed(userId, DELETED_STORAGE_KEY), readLocalJson(DELETED_STORAGE_KEY, [])),
    moods: readLocalJson(
      keyed(userId, MOODS_KEY),
      readLocalJson(MOODS_KEY, DEFAULT_MOODS.map((m) => ({ ...m })))
    ),
    moodEntries: readLocalJson(keyed(userId, MOOD_ENTRIES_KEY), readLocalJson(MOOD_ENTRIES_KEY, {})),
    sleep: readLocalJson(keyed(userId, SLEEP_KEY), readLocalJson(SLEEP_KEY, defaultSleepData())),
    goals: readLocalJson(keyed(userId, GOALS_KEY), readLocalJson(GOALS_KEY, emptyGoals(MIN_GOALS))),
    events: readLocalJson(keyed(userId, EVENTS_KEY), readLocalJson(EVENTS_KEY, [])),
  };
}

function writeLocalBundle(userId, bundle) {
  if (!userId) return;
  try {
    localStorage.setItem(keyed(userId, USER_NAME_KEY), bundle.settings.name || "");
    localStorage.setItem(keyed(userId, WALLPAPER_KEY), bundle.settings.wallpaper || "");
    localStorage.setItem(keyed(userId, THEME_KEY), bundle.settings.theme || "light");
    localStorage.setItem(keyed(userId, ACCENT_COLOR_KEY), bundle.settings.accent || "#9a8ad8");
    localStorage.setItem(keyed(userId, FONT_KEY), bundle.settings.font || "sans-serif");
    localStorage.setItem(keyed(userId, STORAGE_KEY), JSON.stringify(bundle.tasks || []));
    localStorage.setItem(keyed(userId, DELETED_STORAGE_KEY), JSON.stringify(bundle.deletedTasks || []));
    localStorage.setItem(keyed(userId, MOODS_KEY), JSON.stringify(bundle.moods || []));
    localStorage.setItem(keyed(userId, MOOD_ENTRIES_KEY), JSON.stringify(bundle.moodEntries || {}));
    localStorage.setItem(keyed(userId, SLEEP_KEY), JSON.stringify(bundle.sleep || defaultSleepData()));
    localStorage.setItem(keyed(userId, GOALS_KEY), JSON.stringify(bundle.goals || []));
    localStorage.setItem(keyed(userId, EVENTS_KEY), JSON.stringify(bundle.events || []));
  } catch {
    /* ignore quota errors */
  }
}

function isEmptyCloud(data) {
  if (!data) return true;
  const noTasks = !(data.tasks || []).length && !(data.deletedTasks || []).length;
  const noEvents = !(data.events || []).length;
  const noMoods = !(data.moods || []).length;
  const noGoals = !(data.goals || []).some((g) => (g.text || "").trim());
  const noName = !(data.settings?.name || "").trim();
  return noTasks && noEvents && noMoods && noGoals && noName;
}

function withDefaults(cloud) {
  return {
    ...cloud,
    moods: cloud.moods?.length ? cloud.moods : DEFAULT_MOODS.map((m) => ({ ...m })),
    goals: cloud.goals?.length ? cloud.goals : emptyGoals(MIN_GOALS),
    sleep: Array.isArray(cloud.sleep?.alarms)
      ? cloud.sleep
      : { ...defaultSleepData(), ...(cloud.sleep && typeof cloud.sleep === "object" ? cloud.sleep : {}) },
  };
}

export function DataProvider({ children }) {
  const { user, isAuthenticated, status: authStatus } = useAuth();
  const userId = user?.id || "";
  const [bundle, setBundle] = useState(() => localBundle(""));
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error | offline
  const [error, setError] = useState("");
  const saveTimer = useRef(null);
  const bundleRef = useRef(bundle);

  useEffect(() => {
    bundleRef.current = bundle;
    if (userId) writeLocalBundle(userId, bundle);
  }, [bundle, userId]);

  const flushSave = useCallback(async (nextBundle) => {
    if (!getSessionStillValid()) return;
    try {
      await saveCloudData(nextBundle);
      setStatus("ready");
      setError("");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Could not save to cloud");
    }
  }, []);

  function getSessionStillValid() {
    try {
      return Boolean(localStorage.getItem("planner-session-token"));
    } catch {
      return false;
    }
  }

  const queueSave = useCallback(
    (nextBundle) => {
      if (!userId) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => flushSave(nextBundle), 450);
    },
    [flushSave, userId]
  );

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (authStatus === "loading") {
        setStatus("loading");
        return;
      }
      if (!isAuthenticated || !userId) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        setBundle(localBundle(""));
        setStatus("idle");
        setError("");
        return;
      }

      setStatus("loading");
      setBundle(localBundle(userId));
      try {
        const cloud = await fetchCloudData();
        if (cancelled) return;

        if (isEmptyCloud(cloud)) {
          const local = localBundle(userId);
          const hasLocal =
            (local.tasks || []).length > 0 ||
            (local.events || []).length > 0 ||
            (local.settings.name || "").trim().length > 0;
          if (hasLocal) {
            const migrated = await saveCloudData(local);
            if (cancelled) return;
            setBundle(withDefaults(migrated));
          } else {
            setBundle(withDefaults(cloud));
          }
        } else {
          setBundle(withDefaults(cloud));
        }
        setStatus("ready");
        setError("");
      } catch (err) {
        if (cancelled) return;
        setBundle(localBundle(userId));
        setStatus("offline");
        setError(err.message || "Cloud unavailable — using local cache");
      }
    }

    boot();
    return () => {
      cancelled = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [authStatus, isAuthenticated, userId]);

  const updateBundle = useCallback(
    (updater) => {
      setBundle((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        queueSave(next);
        return next;
      });
    },
    [queueSave]
  );

  const value = useMemo(
    () => ({
      bundle,
      status,
      error,
      updateBundle,
      setSettings: (patch) =>
        updateBundle((prev) => ({
          ...prev,
          settings: { ...prev.settings, ...patch },
        })),
      setTasks: (next) =>
        updateBundle((prev) => ({
          ...prev,
          tasks: typeof next === "function" ? next(prev.tasks || []) : next,
        })),
      setDeletedTasks: (next) =>
        updateBundle((prev) => ({
          ...prev,
          deletedTasks: typeof next === "function" ? next(prev.deletedTasks || []) : next,
        })),
      setMoods: (next) =>
        updateBundle((prev) => ({
          ...prev,
          moods: typeof next === "function" ? next(prev.moods || []) : next,
        })),
      setMoodEntries: (next) =>
        updateBundle((prev) => ({
          ...prev,
          moodEntries: typeof next === "function" ? next(prev.moodEntries || {}) : next,
        })),
      setSleep: (next) =>
        updateBundle((prev) => ({
          ...prev,
          sleep: typeof next === "function" ? next(prev.sleep || defaultSleepData()) : next,
        })),
      setGoals: (next) =>
        updateBundle((prev) => ({
          ...prev,
          goals: typeof next === "function" ? next(prev.goals || []) : next,
        })),
      setEvents: (next) =>
        updateBundle((prev) => ({
          ...prev,
          events: typeof next === "function" ? next(prev.events || []) : next,
        })),
    }),
    [bundle, status, error, updateBundle]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
