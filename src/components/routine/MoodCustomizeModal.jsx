import { useEffect, useState } from "react";
import { DEFAULT_MOODS } from "../../lib/constants";

export default function MoodCustomizeModal({ open, moods, onCancel, onSave }) {
  const [draft, setDraft] = useState(moods);

  useEffect(() => {
    if (open) setDraft(moods.length ? moods : DEFAULT_MOODS.map((m) => ({ ...m })));
  }, [open, moods]);

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card mood-customize-modal" role="dialog" aria-modal="true">
        <div className="modal-title">Customize moods</div>
        <p className="modal-text">Edit labels, emojis, and colors. These show in your checker and year chart.</p>
        <div className="mood-edit-list">
          {draft.map((mood, index) => (
            <div key={mood.id} className="mood-edit-row">
              <input
                type="text"
                value={mood.emoji}
                maxLength={4}
                onChange={(e) =>
                  setDraft((prev) => prev.map((m, i) => (i === index ? { ...m, emoji: e.target.value } : m)))
                }
              />
              <input
                type="text"
                value={mood.label}
                onChange={(e) =>
                  setDraft((prev) => prev.map((m, i) => (i === index ? { ...m, label: e.target.value } : m)))
                }
              />
              <input
                type="color"
                value={mood.color}
                onChange={(e) =>
                  setDraft((prev) => prev.map((m, i) => (i === index ? { ...m, color: e.target.value } : m)))
                }
              />
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setDraft((prev) => prev.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="modal-actions" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              setDraft((prev) => [
                ...prev,
                { id: `mood-${Date.now()}`, label: "Mood", emoji: "🙂", color: "#dddddd" },
              ])
            }
          >
            Add mood
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setDraft(moods.length ? moods : DEFAULT_MOODS.map((m) => ({ ...m })));
                onCancel();
              }}
            >
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={() => onSave(draft)}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
