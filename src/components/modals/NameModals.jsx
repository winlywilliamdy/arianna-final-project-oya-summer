import { useState } from "react";
import { capitalizeNameWords, timeOfDayGreeting } from "../../lib/dates";

export function NameSetupModal({ open, onFinalize }) {
  const [name, setName] = useState("");
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="name-setup-title">
        <div className="modal-title" id="name-setup-title">Welcome</div>
        <p className="modal-text">What should we call you?</p>
        <input
          type="text"
          className="settings-input"
          value={name}
          placeholder="Enter your name"
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onFinalize(capitalizeNameWords(name));
          }}
        />
        <div className="modal-actions">
          <button
            type="button"
            className="btn-primary"
            disabled={!name.trim()}
            onClick={() => onFinalize(capitalizeNameWords(name))}
          >
            Finalize
          </button>
        </div>
      </div>
    </div>
  );
}

export function NameTipModal({ open, onDismiss }) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="name-tip-title">
        <div className="modal-title" id="name-tip-title">You're all set</div>
        <p className="modal-text">You can edit your name anytime in Settings.</p>
        <div className="modal-actions">
          <button type="button" className="btn-primary" onClick={onDismiss}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export function greetingText(userName, now) {
  const name = capitalizeNameWords(userName);
  if (!name) return "";
  return `${timeOfDayGreeting(now)}, ${name}`;
}
