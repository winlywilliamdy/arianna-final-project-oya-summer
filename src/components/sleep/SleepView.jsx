import { useEffect, useMemo, useState } from "react";
import { ALARM_SCHEDULES, WEEKDAY_SHORT } from "../../lib/constants";
import { moodDateKey, todayISO } from "../../lib/dates";

export default function SleepView({
  sleep,
  addAlarm,
  toggleAlarm,
  removeAlarm,
  saveNight,
  setTimer,
}) {
  const [alarmTime, setAlarmTime] = useState("07:00");
  const [alarmSchedule, setAlarmSchedule] = useState("everyday");
  const [logDate, setLogDate] = useState(todayISO());
  const [bed, setBed] = useState("22:30");
  const [wake, setWake] = useState("07:00");
  const [calAnchor, setCalAnchor] = useState(() => new Date());
  const [tick, setTick] = useState(0);

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
      <div className="wrap sleep-wrap">
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
    </section>
  );
}
