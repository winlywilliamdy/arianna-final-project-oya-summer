import { DEFAULT_ACCENT, FONT_CLASSES } from "./constants.js";

const THEME_VAR_KEYS = [
  "--lavender",
  "--lavender-deep",
  "--bg",
  "--surface",
  "--surface-2",
  "--chip-bg",
  "--input-bg",
  "--border",
  "--text",
  "--text-soft",
  "--page-bg",
];

export function hexToRgb(hex) {
  const raw = String(hex || "").replace("#", "").trim();
  const full =
    raw.length === 3
      ? raw.split("").map((c) => c + c).join("")
      : raw.padStart(6, "0").slice(0, 6);
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 154, g: 138, b: 216 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function mixHex(hexA, hexB, amount) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const t = Math.max(0, Math.min(1, amount));
  return rgbToHex(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t
  );
}

export function lightThemeVars() {
  return {
    "--lavender": "#c9bef0",
    "--lavender-deep": "#9a8ad8",
    "--bg": "#ffffff",
    "--surface": "#ffffff",
    "--surface-2": "#f7f4f1",
    "--chip-bg": "#f8f4f0",
    "--input-bg": "#ffffff",
    "--border": "#e0d8d0",
    "--text": "#3a3836",
    "--text-soft": "#7a7672",
    "--page-bg": "linear-gradient(160deg, #fff 0%, #ede6f8 45%, #e4f2f8 100%)",
  };
}

export function darkThemeVars() {
  return {
    "--lavender": "#8b7cc8",
    "--lavender-deep": "#e8e2ff",
    "--bg": "#1c1b1a",
    "--surface": "#262422",
    "--surface-2": "#221f1d",
    "--chip-bg": "#2a2724",
    "--input-bg": "#1f1d1b",
    "--border": "#4a4642",
    "--text": "#f0eeec",
    "--text-soft": "#b8b3ad",
    "--page-bg": "linear-gradient(160deg, #1a1918 0%, #24212a 45%, #1e2629 100%)",
  };
}

export function colourThemeVars(hex) {
  const color = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : DEFAULT_ACCENT;
  const soft = mixHex(color, "#ffffff", 0.35);
  const deep = mixHex(color, "#000000", 0.12);
  const bgA = mixHex(color, "#ffffff", 0.55);
  const bgB = mixHex(color, "#ffffff", 0.28);
  const bgC = mixHex(color, "#ffffff", 0.42);
  const surface = mixHex(color, "#ffffff", 0.82);
  const surface2 = mixHex(color, "#ffffff", 0.68);
  const chip = mixHex(color, "#ffffff", 0.72);
  const input = mixHex(color, "#ffffff", 0.9);
  const border = mixHex(color, "#000000", 0.18);

  return {
    "--lavender": soft,
    "--lavender-deep": deep,
    "--bg": bgA,
    "--surface": surface,
    "--surface-2": surface2,
    "--chip-bg": chip,
    "--input-bg": input,
    "--border": border,
    "--text": mixHex(color, "#1a1816", 0.82),
    "--text-soft": mixHex(color, "#5a5652", 0.55),
    "--page-bg": `linear-gradient(160deg, ${bgA} 0%, ${bgB} 45%, ${bgC} 100%)`,
    accent: color,
  };
}

function applyVars(vars, { clearFirst = false } = {}) {
  const root = document.documentElement.style;
  if (clearFirst) {
    THEME_VAR_KEYS.forEach((key) => root.removeProperty(key));
  }
  Object.entries(vars).forEach(([key, value]) => {
    if (key.startsWith("--")) root.setProperty(key, value);
  });
}

export function clearThemeVars() {
  const root = document.documentElement.style;
  THEME_VAR_KEYS.forEach((key) => root.removeProperty(key));
}

export function applyLightTheme() {
  document.body.classList.remove("theme-dark");
  clearThemeVars();
  applyVars(lightThemeVars());
  return lightThemeVars();
}

export function applyDarkTheme() {
  document.body.classList.add("theme-dark");
  clearThemeVars();
  applyVars(darkThemeVars());
  return darkThemeVars();
}

export function applyColourTheme(hex) {
  const vars = colourThemeVars(hex);
  document.body.classList.remove("theme-dark");
  applyVars(vars);
  return vars;
}

export function applyFont(fontKey) {
  const key = FONT_CLASSES.some((c) => c === `font-${fontKey}`) ? fontKey : "sans-serif";
  FONT_CLASSES.forEach((cls) => document.body.classList.remove(cls));
  document.body.classList.add(`font-${key}`);
  return key;
}
