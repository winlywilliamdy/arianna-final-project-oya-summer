import { useMemo, useState } from "react";
import { DEFAULT_MOODS, MONTH_LETTERS, WEEKDAY_SHORT } from "../../lib/constants";
import { jakartaParts, moodDateKey } from "../../lib/dates";
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
}) {
  const [viewMode, setViewMode] = useState("yearly");
  const [anchor, setAnchor] = useState(() => new Date());
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const jp = jakartaParts();
  const todayKey = moodDateKey(jp.year, jp.month - 1, jp.day);
  const todayMoodId = entries[todayKey];

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
