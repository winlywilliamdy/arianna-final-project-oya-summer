import { EVENT_TIME_RANGES } from "./constants";
import { hourToTime } from "./dates";

export function timesForPart(part) {
  const range = EVENT_TIME_RANGES[part] || EVENT_TIME_RANGES.morning;
  return (range.hours || []).map(hourToTime);
}

export function snapTimeToPart(part, time) {
  const t = (time || "").slice(0, 5);
  const allowed = timesForPart(part);
  if (allowed.includes(t)) return t;
  const snapped = `${t.slice(0, 2)}:00`;
  if (allowed.includes(snapped)) return snapped;
  return allowed[0] || "";
}

export function timeToMins(time) {
  if (!time || !/^\d{1,2}:\d{2}/.test(time)) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function eventSortMins(time) {
  const mins = timeToMins(time);
  if (mins == null) return 9999;
  if (mins <= 4 * 60) return mins + 24 * 60;
  return mins;
}

export function compareEventTime(a, b) {
  if (!a.time && !b.time) return a.createdAt - b.createdAt;
  if (!a.time) return 1;
  if (!b.time) return -1;
  return eventSortMins(a.time) - eventSortMins(b.time);
}
