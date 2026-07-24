export default function Sidebar({ view, onNavigate, accountName, onLogout }) {
  const items = [
    { id: "home", label: "Home" },
    { id: "tasks", label: "Tasks" },
    { id: "routine", label: "Routine" },
    { id: "sleep", label: "Sleep" },
    { id: "events", label: "Events" },
  ];

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">Planner</div>
      {accountName ? <div className="sidebar-account">@{accountName}</div> : null}
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-btn${view === item.id ? " active" : ""}`}
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </button>
      ))}
      <div className="sidebar-spacer" aria-hidden="true" />
      <hr className="sidebar-divider" />
      <button
        type="button"
        className={`nav-btn nav-deleted${view === "deleted" ? " active" : ""}`}
        onClick={() => onNavigate("deleted")}
      >
        Deleted
      </button>
      <button
        type="button"
        className={`nav-btn nav-settings${view === "settings" ? " active" : ""}`}
        onClick={() => onNavigate("settings")}
      >
        Settings
      </button>
      {onLogout ? (
        <button type="button" className="nav-btn nav-logout" onClick={onLogout}>
          Sign out
        </button>
      ) : null}
    </aside>
  );
}
