import { useEffect, useState } from "react";
import { LABEL_DISPLAY, TYPE_LABELS } from "../../lib/constants";
import { capitalize } from "../../lib/dates";

function typeMeta(typeLabel) {
  return TYPE_LABELS.find((t) => t.key === typeLabel) || null;
}

function getTaskTypeLabels(task) {
  if (Array.isArray(task.typeLabels) && task.typeLabels.length) return task.typeLabels;
  if (task.typeLabel) return [task.typeLabel];
  return [];
}

export default function TaskCard({
  task,
  onToggleComplete,
  onToggleCancelled,
  onToggleMissing,
  onEdit,
  onDelete,
  onPatchTypeLabels,
  formatDateLabel,
  formatTimeLabel,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const labels = task.labels || [];
  const typeLabels = getTaskTypeLabels(task);
  const selectedSet = new Set(typeLabels);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  const stateClass = task.cancelled
    ? " cancelled"
    : task.completed
      ? " done"
      : task.missing
        ? " missing"
        : "";

  const dateLabel = formatDateLabel(task.dueDate);
  const timeLabel = formatTimeLabel(task.dueTime);

  return (
    <article className={`card${stateClass}`} data-id={task.id}>
      <div className="card-status">
        <div className="type-symbols">
          {typeLabels.length ? (
            typeLabels.map((key) => {
              const meta = typeMeta(key);
              if (!meta) return null;
              return (
                <span
                  key={key}
                  className={`type-symbol${meta.key === "missing" ? " missing" : ""}`}
                  aria-hidden="true"
                >
                  {meta.icon}
                </span>
              );
            })
          ) : (
            <span className="type-symbol" aria-hidden="true">
              ○
            </span>
          )}
        </div>
        <button
          type="button"
          className={`missing-btn${task.missing ? " active" : ""}`}
          aria-label="Mark missing"
          title="Missing"
          onClick={() => onToggleMissing(task.id)}
        >
          !
        </button>
        <button
          type="button"
          className={`check-btn${task.completed ? " active" : ""}`}
          aria-label="Mark done"
          title="Done"
          onClick={() => onToggleComplete(task.id)}
        >
          ✓
        </button>
        <button
          type="button"
          className={`cancel-btn${task.cancelled ? " active" : ""}`}
          aria-label="Mark cancelled"
          title="Cancelled"
          onClick={() => onToggleCancelled(task.id)}
        >
          -
        </button>
      </div>

      <div className="card-body">
        <div className="card-title">{task.title}</div>
        <div className="card-tags">
          <span className="badge difficulty">{capitalize(task.difficulty || "easy")}</span>
          {labels.map((label) => (
            <span key={label} className="badge">
              {LABEL_DISPLAY[label] || label}
            </span>
          ))}
        </div>
      </div>

      <div className="time-block">
        {labels.includes("none") || !task.dueDate ? (
          <div className="time-row">
            <span className="no-time">No date</span>
            <TypePicker
              taskId={task.id}
              selectedSet={selectedSet}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              onPatchTypeLabels={onPatchTypeLabels}
              typeLabels={typeLabels}
            />
          </div>
        ) : (
          <>
            <div className="time-row">
              <div className="date">{dateLabel}</div>
              <TypePicker
                taskId={task.id}
                selectedSet={selectedSet}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                onPatchTypeLabels={onPatchTypeLabels}
                typeLabels={typeLabels}
              />
            </div>
            {timeLabel ? <div className="clock">{timeLabel}</div> : <div className="no-time">All day</div>}
          </>
        )}
      </div>

      <div className="card-tools">
        <button type="button" className="icon-btn edit" aria-label="Edit" onClick={() => onEdit(task)}>
          ✎
        </button>
        <button type="button" className="icon-btn delete" aria-label="Delete" onClick={() => onDelete(task.id)}>
          🗑
        </button>
      </div>
    </article>
  );
}

function TypePicker({ taskId, selectedSet, menuOpen, setMenuOpen, onPatchTypeLabels, typeLabels }) {
  return (
    <div className="type-label-picker" data-task-id={taskId} onClick={(e) => e.stopPropagation()}>
      <span className="type-arrow">----&gt;</span>
      {typeLabels.length ? (
        <span className="type-label-values">
          {TYPE_LABELS.filter((t) => selectedSet.has(t.key)).map((t) => (
            <span key={t.key} className="type-label-value">
              {t.label}
            </span>
          ))}
        </span>
      ) : null}
      <button
        type="button"
        className="type-dropdown-btn"
        aria-label="Choose labels"
        aria-expanded={menuOpen}
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }}
      >
        ▼
      </button>
      <div className="type-dropdown-menu" hidden={!menuOpen}>
        {TYPE_LABELS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            className={`type-option${selectedSet.has(opt.key) ? " selected" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              const next = new Set(typeLabels);
              if (next.has(opt.key)) next.delete(opt.key);
              else next.add(opt.key);
              onPatchTypeLabels(taskId, Array.from(next));
            }}
          >
            <span className={`type-icon${opt.key === "missing" ? " missing" : ""}`}>{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
