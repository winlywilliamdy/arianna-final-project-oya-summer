import { useCallback, useMemo } from "react";
import { DEFAULT_MOODS, MIN_GOALS } from "../lib/constants";
import { defaultSleepData, emptyGoals } from "../lib/normalize";
import { useData } from "../lib/DataProvider";

export function useMoods() {
  const { bundle, setMoods, setMoodEntries } = useData();

  const moods = useMemo(() => {
    if (Array.isArray(bundle.moods) && bundle.moods.length) return bundle.moods;
    return DEFAULT_MOODS.map((m) => ({ ...m }));
  }, [bundle.moods]);

  const entries = bundle.moodEntries || {};

  const setTodayMood = useCallback(
    (dateKey, moodId) => {
      setMoodEntries((prev) => ({ ...(prev || {}), [dateKey]: moodId }));
    },
    [setMoodEntries]
  );

  return { moods, setMoods, entries, setTodayMood };
}

export function useGoals() {
  const { bundle, setGoals } = useData();

  const goals = useMemo(() => {
    if (Array.isArray(bundle.goals) && bundle.goals.length) return bundle.goals;
    return emptyGoals(MIN_GOALS);
  }, [bundle.goals]);

  const updateGoal = useCallback(
    (id, text) => {
      setGoals((prev) => (prev || []).map((g) => (g.id === id ? { ...g, text } : g)));
    },
    [setGoals]
  );

  const addGoal = useCallback(() => {
    setGoals((prev) => [...(prev || []), { id: `goal-${Date.now()}`, text: "" }]);
  }, [setGoals]);

  const removeGoal = useCallback(
    (id) => {
      setGoals((prev) => {
        const next = (prev || []).filter((g) => g.id !== id);
        return next.length >= MIN_GOALS ? next : emptyGoals(MIN_GOALS);
      });
    },
    [setGoals]
  );

  return { goals, updateGoal, addGoal, removeGoal };
}

export function useSleep() {
  const { bundle, setSleep } = useData();
  const sleep = bundle.sleep || defaultSleepData();

  const addAlarm = useCallback(
    (alarm) => {
      setSleep((prev) => {
        const base = prev || defaultSleepData();
        return { ...base, alarms: [...(base.alarms || []), alarm] };
      });
    },
    [setSleep]
  );

  const toggleAlarm = useCallback(
    (id) => {
      setSleep((prev) => {
        const base = prev || defaultSleepData();
        return {
          ...base,
          alarms: (base.alarms || []).map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
        };
      });
    },
    [setSleep]
  );

  const removeAlarm = useCallback(
    (id) => {
      setSleep((prev) => {
        const base = prev || defaultSleepData();
        return { ...base, alarms: (base.alarms || []).filter((a) => a.id !== id) };
      });
    },
    [setSleep]
  );

  const saveNight = useCallback(
    (log) => {
      setSleep((prev) => {
        const base = prev || defaultSleepData();
        const logs = (base.logs || []).filter((l) => l.date !== log.date);
        return { ...base, logs: [...logs, log] };
      });
    },
    [setSleep]
  );

  const setTimer = useCallback(
    (patch) => {
      setSleep((prev) => ({ ...(prev || defaultSleepData()), ...patch }));
    },
    [setSleep]
  );

  return { sleep, addAlarm, toggleAlarm, removeAlarm, saveNight, setTimer };
}

export function useEvents() {
  const { bundle, setEvents } = useData();
  const events = bundle.events || [];

  const addEvent = useCallback(
    (event) => {
      setEvents((prev) => [event, ...(prev || [])]);
    },
    [setEvents]
  );

  const updateEvent = useCallback(
    (id, patch) => {
      setEvents((prev) => (prev || []).map((e) => (e.id === id ? { ...e, ...patch } : e)));
    },
    [setEvents]
  );

  const removeEvent = useCallback(
    (id) => {
      setEvents((prev) => (prev || []).filter((e) => e.id !== id));
    },
    [setEvents]
  );

  return { events, addEvent, updateEvent, removeEvent };
}
