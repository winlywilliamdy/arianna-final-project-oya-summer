import { JAKARTA_LAT, JAKARTA_LON, JAKARTA_TZ } from "./constants.js";

export function weatherCodeLabel(code) {
  if (code === 0) return "Clear";
  if (code === 1 || code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 67) return "Rainy";
  if (code >= 71 && code <= 77) return "Snowy";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Stormy";
  return "Mixed";
}

export function uvLevelLabel(uv) {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very high";
  return "Extreme";
}

/**
 * Fetch Jakarta weather from Open-Meteo.
 * Returns structured data (does not touch the DOM).
 */
export async function loadJakartaWeather() {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${JAKARTA_LAT}&longitude=${JAKARTA_LON}` +
      `&current=temperature_2m,weather_code,uv_index&timezone=${encodeURIComponent(JAKARTA_TZ)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather request failed");
    const data = await res.json();
    const current = data.current || {};
    const temp = Math.round(current.temperature_2m);
    const weather = weatherCodeLabel(current.weather_code);
    const uv = Number(current.uv_index ?? 0);
    const uvRounded = Math.round(uv * 10) / 10;

    return {
      ok: true,
      temp,
      weather,
      weatherCode: current.weather_code,
      uv,
      uvRounded,
      uvLevel: uvLevelLabel(uv),
      weatherHtml: `<span>Weather</span> ${temp}°C · ${weather}`,
      uvHtml: `<span>UV</span> ${uvRounded} · ${uvLevelLabel(uv)}`,
    };
  } catch {
    return {
      ok: false,
      weatherHtml: `<span>Weather</span> unavailable`,
      uvHtml: `<span>UV</span> unavailable`,
    };
  }
}

/** React-friendly wrapper used by useWeather. */
export async function fetchJakartaWeather() {
  const data = await loadJakartaWeather();
  if (!data.ok) throw new Error("Weather unavailable");
  return {
    weatherText: `${data.temp}°C · ${data.weather}`,
    uvText: `${data.uvRounded} · ${data.uvLevel}`,
  };
}
