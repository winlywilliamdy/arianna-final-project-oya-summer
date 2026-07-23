import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_MOODS } from "./constants";
import { emptyGoals, defaultSleepData } from "./normalize";
import { MIN_GOALS } from "./constants";
import { fetchCloudData, saveCloudData } from "./apiClient";
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

function localBundle() {
  return {
    settings: {
      name: readLocalString(USER_NAME_KEY, ""),
      wallpaper: readLocalString(WALLPAPER_KEY, ""),
      theme: readLocalString(THEME_KEY, "light"),
      accent: readLocalString(ACCENT_COLOR_KEY, "#9a8ad8"),
      font: readLocalString(FONT_KEY, "sans-serif"),
    },
    tasks: readLocalJson(STORAGE_KEY, []),
    deletedTasks: readLocalJson(DELETED_STORAGE_KEY, []),
    moods: readLocalJson(MOODS_KEY, DEFAULT_MOODS.map((m) => ({ ...m }))),
    moodEntries: readLocalJson(MOOD_ENTRIES_KEY, {}),
    sleep: readLocalJson(SLEEP_KEY, defaultSleepData()),
    goals: readLocalJson(GOALS_KEY, emptyGoals(MIN_GOALS)),
    events: readLocalJson(EVENTS_KEY, []),
  };
}

function writeLocalBundle(bundle) {
  try {
    localStorage.setItem(USER_NAME_KEY, bundle.settings.name || "");
    localStorage.setItem(WALLPAPER_KEY, bundle.settings.wallpaper || "");
    localStorage.setItem(THEME_KEY, bundle.settings.theme || "light");
    localStorage.setItem(ACCENT_COLOR_KEY, bundle.settings.accent || "#9a8ad8");
    localStorage.setItem(FONT_KEY, bundle.settings.font || "sans-serif");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle.tasks || []));
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(bundle.deletedTasks || []));
    localStorage.setItem(MOODS_KEY, JSON.stringify(bundle.moods || []));
    localStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(bundle.moodEntries || {}));
    localStorage.setItem(SLEEP_KEY, JSON.stringify(bundle.sleep || defaultSleepData()));
    localStorage.setItem(GOALS_KEY, JSON.stringify(bundle.goals || []));
    localStorage.setItem(EVENTS_KEY, JSON.stringify(bundle.events || []));
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

export function DataProvider({ children }) {
  const [bundle, setBundle] = useState(() => localBundle());
  const [status, setStatus] = useState("loading"); // loading | ready | error | offline
  const [error, setError] = useState("");
  const saveTimer = useRef(null);
  const bundleRef = useRef(bundle);

  useEffect(() => {
    bundleRef.current = bundle;
    writeLocalBundle(bundle);
  }, [bundle]);

  const flushSave = useCallback(async (nextBundle) => {
    try {
      await saveCloudData(nextBundle);
      setStatus("ready");
      setError("");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Could not save to Neon");
    }
  }, []);

  const queueSave = useCallback(
    (nextBundle) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => flushSave(nextBundle), 450);
    },
    [flushSave]
  );

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      setStatus("loading");
      try {
        const cloud = await fetchCloudData();
        if (cancelled) return;

        if (isEmptyCloud(cloud)) {
          const local = localBundle();
          const hasLocal =
            (local.tasks || []).length > 0 ||
            (local.events || []).length > 0 ||
            (local.settings.name || "").trim().length > 0;
          if (hasLocal) {
            const migrated = await saveCloudData(local);
            if (cancelled) return;
            setBundle(migrated);
          } else {
            setBundle({
              ...cloud,
              moods: cloud.moods?.length ? cloud.moods : DEFAULT_MOODS.map((m) => ({ ...m })),
              goals: cloud.goals?.length ? cloud.goals : emptyGoals(MIN_GOALS),
              sleep: cloud.sleep?.alarms ? cloud.sleep : defaultSleepData(),
            });
          }
        } else {
          setBundle({
            ...cloud,
            moods: cloud.moods?.length ? cloud.moods : DEFAULT_MOODS.map((m) => ({ ...m })),
            goals: cloud.goals?.length ? cloud.goals : emptyGoals(MIN_GOALS),
            sleep: cloud.sleep || defaultSleepData(),
          });
        }
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setBundle(localBundle());
        setStatus("offline");
        setError(err.message || "Cloud unavailable — using local cache");
      }
    }

    boot();
    return () => {
      cancelled = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

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
