import { useEffect, useMemo, useState } from "react";
import { ALARM_SCHEDULES, DEFAULT_MOODS, MONTH_LETTERS, WEEKDAY_SHORT } from "../../lib/constants";
import { jakartaParts, moodDateKey, todayISO } from "../../lib/dates";
import MoodCustomizeModal from "./MoodCustomizeModal";

export default function RoutineView({
  moods,
  setMoods,
  entries,
  setTodayMood,
  goals,
  updateGoal,
  addGoal,
  removeGoal,
  sleep,
  addAlarm,
  toggleAlarm,
  removeAlarm,
  saveNight,
  setTimer,
}) {
  const [viewMode, setViewMode] = useState("yearly");
  const [anchor, setAnchor] = useState(() => new Date());
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [alarmTime, setAlarmTime] = useState("07:00");
  const [alarmSchedule, setAlarmSchedule] = useState("everyday");
  const [logDate, setLogDate] = useState(todayISO());
  const [bed, setBed] = useState("22:30");
  const [wake, setWake] = useState("07:00");
  const [calAnchor, setCalAnchor] = useState(() => new Date());
  const [tick, setTick] = useState(0);

  const jp = jakartaParts();
  const todayKey = moodDateKey(jp.year, jp.month - 1, jp.day);
  const todayMoodId = entries[todayKey];

  useEffect(() => {
    if (!sleep.timerRunning) return undefined;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [sleep.timerRunning]);

  const timerDisplay = useMemo(() => {
    let ms = sleep.timerElapsedMs || 0;
    if (sleep.timerRunning && sleep.timerStartedAt) {
      ms += Date.now() - sleep.timerStartedAt;
    }
    const total = Math.floor(ms / 1000);
    const h = String(Math.floor(total / 3600)).padStart(2, "0");
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }, [sleep, tick]);

  const periodLabel = useMemo(() => {
    if (viewMode === "weekly") {
      const start = new Date(anchor);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const startLabel = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const endLabel = end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      return `${startLabel} – ${endLabel}`;
    }
    if (viewMode === "monthly") {
      return anchor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    }
    return String(anchor.getFullYear());
  }, [viewMode, anchor]);

  function shiftPeriod(dir) {
    const next = new Date(anchor);
    if (viewMode === "weekly") next.setDate(next.getDate() + dir * 7);
    else if (viewMode === "monthly") next.setMonth(next.getMonth() + dir);
    else next.setFullYear(next.getFullYear() + dir);
    setAnchor(next);
  }

  function moodCell(key) {
    const mood = moods.find((m) => m.id === entries[key]);
    const isToday = key === todayKey;
    return (
      <div
        key={key}
        className={`mood-cell${mood ? " filled" : ""}${isToday ? " today" : ""}`}
        title={mood ? `${mood.emoji} ${mood.label}` : key}
        style={mood ? { background: mood.color } : undefined}
        aria-hidden="true"
      >
        {mood ? mood.emoji : ""}
      </div>
    );
  }

  function chartCells() {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();

    if (viewMode === "yearly") {
      const cells = [<div key="corner" className="mood-chart-corner" />];
      MONTH_LETTERS.forEach((letter, monthIndex) => {
        cells.push(
          <div key={`m-${monthIndex}`} className="mood-month-label">
            {letter}
          </div>
        );
      });
      for (let day = 1; day <= 31; day += 1) {
        cells.push(
          <div key={`d-${day}`} className="mood-day-label">
            {day}
          </div>
        );
        for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
          const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
          if (day > daysInMonth) {
            cells.push(<div key={`inv-${monthIndex}-${day}`} className="mood-cell invalid" />);
            continue;
          }
          cells.push(moodCell(moodDateKey(year, monthIndex, day)));
        }
      }
      return cells;
    }

    if (viewMode === "monthly") {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDow = new Date(year, month, 1).getDay();
      const cells = WEEKDAY_SHORT.map((d) => (
        <div key={`wd-${d}`} className="mood-weekday-label">
          {d}
        </div>
      ));
      for (let i = 0; i < firstDow; i += 1) {
        cells.push(<div key={`e-${i}`} className="mood-cell invalid" />);
      }
      for (let day = 1; day <= daysInMonth; day += 1) {
        cells.push(moodCell(moodDateKey(year, month, day)));
      }
      return cells;
    }

    // weekly
    const start = new Date(anchor);
    start.setDate(start.getDate() - start.getDay());
    const cells = WEEKDAY_SHORT.map((d) => (
      <div key={`wd-${d}`} className="mood-weekday-label">
        {d}
      </div>
    ));
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = moodDateKey(d.getFullYear(), d.getMonth(), d.getDate());
      cells.push(
        <div key={`w-${key}`}>
          <div className="mood-week-daycap">{d.getDate()}</div>
          {moodCell(key)}
        </div>
      );
    }
    return cells;
  }

  function onSaveNight() {
    if (!logDate || !bed || !wake) return;
    const [bh, bm] = bed.split(":").map(Number);
    const [wh, wm] = wake.split(":").map(Number);
    let minutes = wh * 60 + wm - (bh * 60 + bm);
    if (minutes <= 0) minutes += 24 * 60;
    saveNight({
      date: logDate,
      bed,
      wake,
      minutes,
      duration: `${Math.floor(minutes / 60)}h ${minutes % 60}m`,
    });
  }

  const calYear = calAnchor.getFullYear();
  const calMonth = calAnchor.getMonth();
  const calLabel = calAnchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const daysInCal = new Date(calYear, calMonth + 1, 0).getDate();
  const firstCalDow = new Date(calYear, calMonth, 1).getDay();
  const logMap = Object.fromEntries((sleep.logs || []).map((l) => [l.date, l]));

  return (
    <section className="view">
      <div className="wrap routine-wrap">
        <div className="routine-top-row">
          <div className="mood-checker-bar">
            <div className="mood-checker-top">
              <div>
                <div className="routine-title">Mood checker</div>
                <div className="routine-subtitle">Pick how you feel today — it fills in automatically.</div>
              </div>
              <div className="mood-view-toggle" role="group" aria-label="Chart view">
                {["weekly", "monthly", "yearly"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`mood-view-btn${viewMode === mode ? " active" : ""}`}
                    onClick={() => setViewMode(mode)}
                  >
                    {mode[0].toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mood-today-label">How are you feeling today?</div>
            <div className="mood-options-row">
              <div className="mood-options">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    type="button"
                    className={`mood-option${todayMoodId === mood.id ? " selected" : ""}`}
                    style={{ "--mood-color": mood.color }}
                    onClick={() => setTodayMood(todayKey, mood.id)}
                    title={mood.label}
                  >
                    <span className="mood-emoji">{mood.emoji}</span>
                    <span className="mood-label">{mood.label}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="mood-customize-btn" onClick={() => setCustomizeOpen(true)}>
                Customize
              </button>
            </div>
          </div>

          <aside className="goals-panel" aria-label="Goals">
            <div className="goals-title">Goals</div>
            <ul className="goals-list">
              {goals.map((goal) => (
                <li key={goal.id} className="goal-item">
                  <input
                    type="text"
                    value={goal.text}
                    placeholder="Write a goal…"
                    onChange={(e) => updateGoal(goal.id, e.target.value)}
                  />
                  <button type="button" className="goal-remove" onClick={() => removeGoal(goal.id)} aria-label="Remove goal">
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="goal-add" onClick={addGoal}>
              + Add goal
            </button>
          </aside>
        </div>

        <section className="routine-panel">
          <div className="routine-body">
            <div className="routine-chart-col">
              <div className="mood-period-row">
                <div className="mood-year-controls">
                  <button type="button" aria-label="Previous period" onClick={() => shiftPeriod(-1)}>
                    ‹
                  </button>
                  <span className="mood-year-label">{periodLabel}</span>
                  <button type="button" aria-label="Next period" onClick={() => shiftPeriod(1)}>
                    ›
                  </button>
                </div>
              </div>
              <div className="mood-year-layout">
                <div className="mood-chart-wrap">
                  <div className={`mood-chart view-${viewMode}`}>{chartCells()}</div>
                </div>
                <aside className="mood-key">
                  <div className="mood-key-title">Key</div>
                  <div className="mood-key-list">
                    {moods.map((m) => (
                      <div key={m.id} className="mood-key-item">
                        <span className="mood-key-swatch" style={{ background: m.color }} />
                        <span>
                          {m.emoji} {m.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        <section className="sleep-panel" aria-label="Sleep">
          <div className="sleep-title">Sleep</div>
          <div className="sleep-subtitle">Alarm, track nights, and time how long you sleep.</div>
          <div className="sleep-grid">
            <div className="sleep-card">
              <div className="sleep-card-title">Alarm clock</div>
              <div className="sleep-card-value">
                {(sleep.alarms || []).find((a) => a.enabled)?.time || "--:--"}
              </div>
              <div className="sleep-card-meta">
                {(sleep.alarms || []).length ? `${sleep.alarms.length} alarm(s)` : "No alarms set"}
              </div>
              <div className="alarm-form">
                <div>
                  <label>Time</label>
                  <input type="time" value={alarmTime} onChange={(e) => setAlarmTime(e.target.value)} />
                </div>
                <div>
                  <label>When</label>
                  <select value={alarmSchedule} onChange={(e) => setAlarmSchedule(e.target.value)}>
                    {Object.entries(ALARM_SCHEDULES).map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sleep-actions">
                <button
                  type="button"
                  className="primary"
                  onClick={() =>
                    addAlarm({
                      id: `alarm-${Date.now()}`,
                      time: alarmTime,
                      schedule: alarmSchedule,
                      enabled: true,
                      onceDate: alarmSchedule === "today" || alarmSchedule === "tomorrow" ? todayISO() : null,
                    })
                  }
                >
                  Add alarm
                </button>
              </div>
              <ul className="alarm-list">
                {(sleep.alarms || []).map((alarm) => (
                  <li key={alarm.id} className="alarm-item">
                    <div>
                      <strong>{alarm.time}</strong> · {ALARM_SCHEDULES[alarm.schedule] || alarm.schedule}
                    </div>
                    <div className="sleep-actions">
                      <button type="button" onClick={() => toggleAlarm(alarm.id)}>
                        {alarm.enabled ? "On" : "Off"}
                      </button>
                      <button type="button" onClick={() => removeAlarm(alarm.id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sleep-card">
              <div className="sleep-card-title">Sleep tracker</div>
              <div className="sleep-card-meta">Log a night, then see it on the month calendar.</div>
              <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
              <input type="time" value={bed} onChange={(e) => setBed(e.target.value)} aria-label="Bedtime" />
              <input type="time" value={wake} onChange={(e) => setWake(e.target.value)} aria-label="Wake time" />
              <div className="sleep-actions">
                <button type="button" className="primary" onClick={onSaveNight}>
                  Save night
                </button>
              </div>
              <div className="sleep-cal-wrap">
                <div className="sleep-cal-head">
                  <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => setCalAnchor(new Date(calYear, calMonth - 1, 1))}
                  >
                    ‹
                  </button>
                  <span className="sleep-cal-label">{calLabel}</span>
                  <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => setCalAnchor(new Date(calYear, calMonth + 1, 1))}
                  >
                    ›
                  </button>
                </div>
                <div className="sleep-cal">
                  {WEEKDAY_SHORT.map((d) => (
                    <div key={`dow-${d}`} className="sleep-cal-dow">
                      {d[0]}
                    </div>
                  ))}
                  {Array.from({ length: firstCalDow }).map((_, i) => (
                    <div key={`pad-${i}`} className="sleep-cal-cell empty" />
                  ))}
                  {Array.from({ length: daysInCal }, (_, i) => {
                    const day = i + 1;
                    const key = moodDateKey(calYear, calMonth, day);
                    const log = logMap[key];
                    let cls = "";
                    let mark = "·";
                    if (log) {
                      if (log.minutes >= 540) {
                        cls = "great";
                        mark = "⭐";
                      } else if (log.minutes >= 480) {
                        cls = "good";
                        mark = "🌙";
                      } else if (log.minutes < 420) {
                        cls = "low";
                        mark = "⚠️";
                      }
                    }
                    return (
                      <div
                        key={key}
                        className={`sleep-cal-cell${cls ? ` ${cls}` : ""}`}
                        title={log?.duration || ""}
                      >
                        <span className="sleep-cal-day">{day}</span>
                        <span className="sleep-cal-icon">{log ? mark : ""}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="sleep-cal-legend">
                  <span>⭐ 9h+</span>
                  <span>🌙 8h+</span>
                  <span>⚠️ under 7h</span>
                </div>
                <div className="sleep-cal-hint">
                  {(sleep.logs || []).length ? "Nights saved on the calendar." : "Save nights to fill the calendar."}
                </div>
              </div>
            </div>

            <div className="sleep-card">
              <div className="sleep-card-title">Sleep timer</div>
              <div className="sleep-card-value">{timerDisplay}</div>
              <div className="sleep-card-meta">
                {sleep.timerRunning ? "Timer running" : "Start when you go to bed"}
              </div>
              <div className="sleep-actions">
                <button
                  type="button"
                  className="primary"
                  onClick={() =>
                    setTimer({
                      timerRunning: true,
                      timerStartedAt: Date.now(),
                    })
                  }
                >
                  Start
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!sleep.timerRunning || !sleep.timerStartedAt) return;
                    const elapsed = (sleep.timerElapsedMs || 0) + (Date.now() - sleep.timerStartedAt);
                    setTimer({ timerRunning: false, timerStartedAt: null, timerElapsedMs: elapsed });
                  }}
                >
                  Stop
                </button>
                <button
                  type="button"
                  onClick={() => setTimer({ timerRunning: false, timerStartedAt: null, timerElapsedMs: 0 })}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <MoodCustomizeModal
        open={customizeOpen}
        moods={moods}
        onCancel={() => setCustomizeOpen(false)}
        onSave={(next) => {
          setMoods(next.length ? next : DEFAULT_MOODS.map((m) => ({ ...m })));
          setCustomizeOpen(false);
        }}
      />
    </section>
  );
}
