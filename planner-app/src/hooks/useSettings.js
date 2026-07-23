import { useEffect } from "react";
import { DEFAULT_ACCENT } from "../lib/constants";
import { applyFont, applyTheme } from "../lib/theme";
import { useData } from "../lib/DataProvider";
import { useState } from "react";

export function useSettings() {
  const { bundle, setSettings, status } = useData();
  const [showNameSetup, setShowNameSetup] = useState(false);
  const [showNameTip, setShowNameTip] = useState(false);

  const settings = bundle.settings || {};
  const userName = settings.name || "";
  const wallpaper = settings.wallpaper || "";
  const theme = settings.theme || "light";
  const accent = settings.accent || DEFAULT_ACCENT;
  const font = settings.font || "sans-serif";

  useEffect(() => {
    applyTheme(theme, accent);
  }, [theme, accent]);

  useEffect(() => {
    applyFont(font);
  }, [font]);

  useEffect(() => {
    if (status === "loading") return;
    if (!(userName || "").trim()) setShowNameSetup(true);
  }, [userName, status]);

  return {
    userName,
    setUserName: (name) => setSettings({ name }),
    wallpaper,
    setWallpaper: (wallpaperValue) => setSettings({ wallpaper: wallpaperValue }),
    theme,
    setTheme: (themeValue) => setSettings({ theme: themeValue }),
    accent,
    setAccent: (accentValue) => setSettings({ accent: accentValue }),
    font,
    setFont: (fontValue) => setSettings({ font: fontValue }),
    showNameSetup,
    setShowNameSetup,
    showNameTip,
    setShowNameTip,
  };
}
