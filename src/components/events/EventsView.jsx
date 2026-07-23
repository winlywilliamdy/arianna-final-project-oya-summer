import { useMemo, useState } from "react";
import { EVENT_PARTS } from "../../lib/constants";
import { formatTimeLabel } from "../../lib/dates";
import { compareEventTime, snapTimeToPart, timesForPart } from "../../lib/events";

export default function EventsView({ events, addEvent, updateEvent, removeEvent }) {
  const [title, setTitle] = useState("");
  const [part, setPart] = useState("morning");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  const timeOptions = useMemo(() => timesForPart(part), [part]);

  function onPartChange(nextPart) {
    setPart(nextPart);
    setTime((prev) => snapTimeToPart(nextPart, prev) || "");
  }

  function onSubmit(e) {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const snapped = snapTimeToPart(part, time);
    if (!snapped || !timeOptions.includes(snapped)) return;
    addEvent({
      id: `ev-${Date.now()}`,
      title: cleanTitle,
      part,
      time: snapped,
      note: note.trim(),
      done: false,
      createdAt: Date.now(),
    });
    setTitle("");
    setNote("");
    setPart("morning");
    setTime("");
  }

  return (
    <section className="view">
      <div className="wrap events-wrap">
        <section className="events-hero">
          <div className="events-title">Events</div>
          <div className="events-subtitle">
            Plan today’s activities by morning, afternoon, evening, or night — with a time for each.
          </div>

          <form className="event-composer" onSubmit={onSubmit}>
            <div>
              <label htmlFor="event-title">What’s happening?</label>
              <input
                id="event-title"
                type="text"
                placeholder="Study session, hangout, trip…"
                required
                maxLength={80}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="event-part">Part of day</label>
              <select id="event-part" value={part} onChange={(e) => onPartChange(e.target.value)}>
                {EVENT_PARTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="event-time">Time</label>
              <select
                id="event-time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                aria-label="Event time"
              >
                <option value="" disabled>
                  Time
                </option>
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {formatTimeLabel(t) || t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="event-note">Note</label>
              <input
                id="event-note"
                type="text"
                placeholder="Optional detail"
                maxLength={120}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div>
              <label>&nbsp;</label>
              <button type="submit" className="btn-primary">
                Add
              </button>
            </div>
          </form>
        </section>

        <section className="events-board">
          <div className="path-column">
            <div className="lane-title">Today</div>
            <div className="day-path">
              {EVENT_PARTS.map((p) => {
                const items = events.filter((e) => e.part === p.id).sort(compareEventTime);
                return (
                  <div key={p.id} className="path-segment" data-part={p.id}>
                    <div className="path-segment-label">{p.label}</div>
                    <div className="path-segment-items">
                      {items.length === 0 ? (
                        <div className="event-empty">Nothing here yet</div>
                      ) : (
                        items.map((ev) => (
                          <article key={ev.id} className={`event-step${ev.done ? " is-done" : ""}`}>
                            <div className="event-card-top">
                              <div className="event-card-body">
                                <div className="event-card-title">{ev.title}</div>
                                {ev.time ? (
                                  <div className="event-card-meta">{formatTimeLabel(ev.time) || ev.time}</div>
                                ) : null}
                                {ev.note ? <div className="event-card-note">{ev.note}</div> : null}
                              </div>
                              <div className="event-card-actions">
                                <button
                                  type="button"
                                  title={ev.done ? "Mark not done" : "Mark done"}
                                  onClick={() => updateEvent(ev.id, { done: !ev.done })}
                                >
                                  {ev.done ? "↺" : "✓"}
                                </button>
                                <button type="button" title="Remove" onClick={() => removeEvent(ev.id)}>
                                  ✕
                                </button>
                              </div>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
