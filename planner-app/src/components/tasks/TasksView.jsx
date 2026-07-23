import { useEffect, useMemo, useState } from "react";
import {
  DUE_LABELS,
  LABEL_DISPLAY,
  TASK_PROMPTS,
  TYPE_LABELS,
} from "../../lib/constants";
import { capitalize, formatDateLabel, formatTimeLabel, todayISO, tomorrowISO } from "../../lib/dates";
import TaskCard from "./TaskCard";

const emptyForm = {
  id: "",
  title: "",
  labels: [],
  difficulty: "easy",
  typeLabels: [],
  dueDate: "",
  dueTime: "",
  autoTomorrow: true,
};

export default function TasksView({
  tasks,
  deletedCount,
  onNavigateDeleted,
  upsertTask,
  patchTask,
  toggleComplete,
  toggleCancelled,
  toggleMissing,
  deleteTask,
  clock,
  date,
}) {
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [placeholder, setPlaceholder] = useState(TASK_PROMPTS[0]);

  const hasNoDate = form.labels.includes("none");
  const dueRequired =
    !hasNoDate && form.labels.some((l) => ["immediate", "tmrw", "urgent"].includes(l));
  const canSubmit =
    form.title.trim().length > 0 &&
    form.labels.length >= 1 &&
    form.typeLabels.length >= 1 &&
    (!dueRequired || !!form.dueDate);

  useEffect(() => {
    setPlaceholder(TASK_PROMPTS[Math.floor(Math.random() * TASK_PROMPTS.length)]);
  }, []);

  function updateLabels(label) {
    setForm((prev) => {
      const set = new Set(prev.labels);
      if (set.has(label)) set.delete(label);
      else set.add(label);
      const labels = Array.from(set);
      let dueDate = prev.dueDate;
      let dueTime = prev.dueTime;
      if (labels.includes("none")) {
        dueDate = "";
        dueTime = "";
      } else if (labels.includes("immediate") || labels.includes("urgent")) {
        dueDate = todayISO();
      } else if (labels.includes("tmrw") && prev.autoTomorrow) {
        dueDate = tomorrowISO();
      }
      return { ...prev, labels, dueDate, dueTime };
    });
  }

  function updateTypes(key) {
    setForm((prev) => {
      const set = new Set(prev.typeLabels);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      return { ...prev, typeLabels: Array.from(set) };
    });
  }

  function resetForm() {
    setForm({ ...emptyForm, autoTomorrow: true });
    setEditing(false);
    setPlaceholder(TASK_PROMPTS[Math.floor(Math.random() * TASK_PROMPTS.length)]);
  }

  function startEdit(task) {
    setEditing(true);
    setForm({
      id: task.id,
      title: task.title || "",
      labels: task.labels || [],
      difficulty: task.difficulty || "easy",
      typeLabels: task.typeLabels || [],
      dueDate: task.dueDate || "",
      dueTime: task.dueTime || "",
      autoTomorrow: true,
    });
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    const noDate = form.labels.includes("none");
    const existing = editing ? tasks.find((t) => t.id === form.id) : null;
    upsertTask({
      id: form.id || crypto.randomUUID(),
      title: form.title.trim(),
      labels: form.labels,
      difficulty: form.difficulty,
      typeLabels: form.typeLabels,
      typeLabel: form.typeLabels[0] || "",
      dueDate: noDate ? "" : form.dueDate,
      dueTime: noDate ? "" : form.dueTime,
      completed: existing?.completed ?? false,
      cancelled: existing?.cancelled ?? false,
      missing: existing?.missing ?? false,
    });
    resetForm();
  }

  const list = useMemo(() => tasks, [tasks]);

  return (
    <section className="view">
      <div className="wrap">
        <header>
          <div className="header-left">
            <span className="tag">FR-08</span>
            <div className="clock-row">
              <div className="live-clock">{clock}</div>
              <div className="live-date">{date}</div>
            </div>
          </div>
          <div className="bin-wrap" onClick={onNavigateDeleted}>
            <span className="bin-label">Deleted</span>
            <button type="button" className="bin-toggle" aria-label="View deleted tasks">
              🗑
              <span className="bin-count">{deletedCount}</span>
            </button>
          </div>
        </header>

        <section className="composer">
          <h1 className="composer-heading">Tasks</h1>
          <form onSubmit={onSubmit}>
            <div className="task-title-row">
              <input
                type="text"
                value={form.title}
                placeholder={placeholder}
                required
                aria-label="Task"
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div className="form-grid">
              <div className={`time-cell date-fields${hasNoDate ? " hidden" : ""}`}>
                <label>Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                />
              </div>
              <div className={`time-cell date-fields${hasNoDate ? " hidden" : ""}`}>
                <label>Time</label>
                <input
                  type="time"
                  value={form.dueTime}
                  onChange={(e) => setForm((p) => ({ ...p, dueTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="pill-row">
              <label>When?</label>
            </div>
            <div className="pill-row">
              {DUE_LABELS.map((label) => (
                <label key={label}>
                  <input
                    type="checkbox"
                    checked={form.labels.includes(label)}
                    onChange={() => updateLabels(label)}
                  />
                  <span className={`pill ${label}`}>{LABEL_DISPLAY[label]}</span>
                </label>
              ))}
            </div>

            <div className="pill-row">
              <label>Difficulty</label>
            </div>
            <div className="difficulty-row">
              {["easy", "medium", "hard"].map((level) => (
                <label key={level}>
                  <input
                    type="radio"
                    name="difficulty"
                    checked={form.difficulty === level}
                    onChange={() => setForm((p) => ({ ...p, difficulty: level }))}
                  />
                  <span className={`difficulty-pill ${level}`}>{capitalize(level)}</span>
                </label>
              ))}
            </div>

            <label className="setting-row">
              <input
                type="checkbox"
                checked={form.autoTomorrow}
                onChange={(e) => setForm((p) => ({ ...p, autoTomorrow: e.target.checked }))}
              />
              Auto-set date to Tomorrow
            </label>

            <div className="pill-row" style={{ marginTop: 10 }}>
              <label>Type</label>
            </div>
            <div className="type-row">
              {TYPE_LABELS.map((t) => (
                <label key={t.key}>
                  <input
                    type="checkbox"
                    checked={form.typeLabels.includes(t.key)}
                    onChange={() => updateTypes(t.key)}
                  />
                  <span className="type-pill">
                    <span className={`type-icon${t.key === "missing" ? " missing" : ""}`}>{t.icon}</span>
                    {capitalize(t.key)}
                  </span>
                </label>
              ))}
            </div>

            <div className="form-actions">
              {editing ? (
                <button type="button" className="btn-ghost" onClick={resetForm}>
                  Cancel
                </button>
              ) : null}
              <button type="submit" className={`btn-primary${canSubmit ? " ready" : ""}`} disabled={!canSubmit}>
                {editing ? "Save" : "Add"}
              </button>
            </div>
          </form>
        </section>

        <section className="board">
          <div className="board-body">
            <div className="cards">
              {list.length === 0 ? (
                <p className="empty">No tasks yet.</p>
              ) : (
                list.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={toggleComplete}
                    onToggleCancelled={toggleCancelled}
                    onToggleMissing={toggleMissing}
                    onEdit={startEdit}
                    onDelete={deleteTask}
                    onPatchTypeLabels={(id, typeLabels) =>
                      patchTask(id, { typeLabels, typeLabel: typeLabels[0] || "" })
                    }
                    formatDateLabel={formatDateLabel}
                    formatTimeLabel={formatTimeLabel}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
