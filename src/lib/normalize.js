import { EVENT_TIME_RANGES } from "./constants.js";

export function defaultSleepData() {
  return {
    alarms: [],
    logs: [],
    timerRunning: false,
    timerStartedAt: null,
    timerElapsedMs: 0,
  };
}

export function emptyGoals(min = 3) {
  return Array.from({ length: min }, (_, i) => ({
    id: `goal-${i + 1}`,
    text: "",
  }));
}

export function normalizeTask(task) {
  if (!task) return task;
  if (!Array.isArray(task.labels)) {
    const labels = [];
    if (task.category) labels.push(task.category);
    if (task.timing) {
      if (task.timing === "none") labels.push("none");
      else if (task.timing === "immediate") labels.push("immediate");
      else if (task.timing === "tmrw") labels.push("tmrw");
      else if (task.timing === "urgent") labels.push("urgent");
      else if (task.timing === "hangout") labels.push("urgent");
    }
    task.labels = Array.from(new Set(labels));
  }

  if (!Array.isArray(task.typeLabels)) {
    if (task.typeLabel) task.typeLabels = [task.typeLabel];
    else task.typeLabels = [];
  } else {
    task.typeLabels = Array.from(new Set(task.typeLabels.filter(Boolean)));
  }
  task.typeLabel = task.typeLabels[0] || "";

  if (!task.difficulty) task.difficulty = "easy";
  if (task.cancelled == null) task.cancelled = false;
  if (task.missing == null) task.missing = false;
  return task;
}

export function sleepMinutesBetween(bed, wake) {
  const [bh, bm] = String(bed || "00:00").split(":").map(Number);
  const [wh, wm] = String(wake || "00:00").split(":").map(Number);
  let start = bh * 60 + bm;
  let end = wh * 60 + wm;
  if (end <= start) end += 24 * 60;
  return end - start;
}

export function formatSleepLabel(mins) {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function normalizeSleepLog(log) {
  if (!log) return null;
  let minutes = Number(log.minutes);
  if (!Number.isFinite(minutes)) {
    if (log.bed && log.wake && log.bed !== "timer" && log.wake !== "timer") {
      minutes = sleepMinutesBetween(log.bed, log.wake);
    } else if (typeof log.duration === "string") {
      const match = log.duration.match(/(\d+)\s*h\s*(\d+)/i);
      minutes = match ? Number(match[1]) * 60 + Number(match[2]) : 0;
    } else {
      minutes = 0;
    }
  }
  return {
    date: log.date,
    bed: log.bed || "",
    wake: log.wake || "",
    minutes,
    duration: log.duration || formatSleepLabel(minutes),
  };
}

export function hourToTime(h) {
  return `${String(h).padStart(2, "0")}:00`;
}

export function timesForPart(part) {
  const range = EVENT_TIME_RANGES[part] || EVENT_TIME_RANGES.morning;
  return (range.hours || []).map(hourToTime);
}

export function timeInPartRange(part, time) {
  if (!time) return false;
  const allowed = timesForPart(part);
  if (allowed.includes(time.slice(0, 5))) return true;
  const snapped = `${time.slice(0, 2)}:00`;
  return allowed.includes(snapped);
}

export function snapTimeToPart(part, time) {
  const t = (time || "").slice(0, 5);
  const allowed = timesForPart(part);
  if (allowed.includes(t)) return t;
  const snapped = `${t.slice(0, 2)}:00`;
  if (allowed.includes(snapped)) return snapped;
  return allowed[0] || "";
}

export function normalizeEventPart(part, time) {
  if (time && /^\d{1,2}:\d{2}/.test(time)) {
    const t = time.slice(0, 5);
    for (const id of ["morning", "afternoon", "evening", "night"]) {
      if (timeInPartRange(id, t)) return id;
    }
  }
  if (["morning", "afternoon", "evening", "night"].includes(part)) return part;
  return "afternoon";
}

export function normalizeEventTime(when) {
  if (!when) return "";
  if (/^\d{1,2}:\d{2}/.test(when)) return when.slice(0, 5);
  if (when.includes("T")) {
    const d = new Date(when);
    if (!Number.isNaN(d.getTime())) {
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
  }
  return "";
}
