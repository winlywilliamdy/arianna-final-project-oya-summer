export default function SettingsView({
  userName,
  setUserName,
  wallpaper,
  setWallpaper,
  theme,
  setTheme,
  accent,
  setAccent,
  font,
  setFont,
  accountUsername,
  accountEmail,
  onLogout,
}) {
  function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setWallpaper(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  return (
    <section className="view">
      <div className="wrap">
        <section className="settings-panel">
          <div className="settings-title">Settings</div>
          <div className="settings-subtitle">Personalize your home screen and app look.</div>

          <div className="settings-group">
            <div className="settings-label">Account</div>
            <div className="settings-subtitle">
              Signed in as <strong>@{accountUsername || "—"}</strong>
              {accountEmail ? ` · ${accountEmail}` : ""}
            </div>
            {onLogout ? (
              <div className="settings-actions">
                <button type="button" className="settings-btn" onClick={onLogout}>
                  Sign out
                </button>
              </div>
            ) : null}
          </div>

          <div className="settings-group">
            <label className="settings-label" htmlFor="user-name-input">
              Your name
            </label>
            <input
              type="text"
              className="settings-input"
              id="user-name-input"
              placeholder="Enter your name"
              maxLength={40}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div className="settings-group">
            <div className="settings-label">Wallpaper</div>
            <div className="settings-actions">
              <label className="settings-btn" htmlFor="wallpaper-input">
                Upload wallpaper
              </label>
              <input type="file" id="wallpaper-input" accept="image/*" hidden onChange={onUpload} />
              <button type="button" className="settings-btn" onClick={() => setWallpaper("")}>
                Clear wallpaper
              </button>
            </div>
            {wallpaper ? <div className="settings-subtitle">Wallpaper saved for Home.</div> : null}
          </div>

          <div className="settings-group">
            <div className="settings-label">Appearance</div>
            <div className="appearance-row">
              <div className="theme-toggle">
                {[
                  ["light", "Light"],
                  ["dark", "Dark"],
                  ["color", "Colour"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`theme-option${theme === id ? " active" : ""}`}
                    onClick={() => setTheme(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {theme === "color" ? (
                <label className="color-swatch" title="Pick a colour" aria-label="Theme colour">
                  <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
                </label>
              ) : null}
            </div>
          </div>

          <div className="settings-group">
            <div className="settings-label">Font</div>
            <div className="font-options">
              {[
                ["american-classic", "American Classic"],
                ["sans-serif", "Sans Serif"],
                ["times", "Times New Roman"],
                ["playfair", "Playfair Display"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`font-option${font === id ? " active" : ""}`}
                  data-font={id}
                  onClick={() => setFont(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
