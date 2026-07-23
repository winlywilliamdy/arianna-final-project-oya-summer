import { useEffect, useState } from "react";
import { JAKARTA_TZ } from "../lib/constants";
import { fetchJakartaWeather } from "../lib/weather";

export function useJakartaClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const clock = new Intl.DateTimeFormat("en-GB", {
    timeZone: JAKARTA_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: JAKARTA_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return { now, clock, date };
}

export function useWeather() {
  const [weatherText, setWeatherText] = useState("Weather —");
  const [uvText, setUvText] = useState("UV —");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchJakartaWeather();
        if (cancelled) return;
        setWeatherText(data.weatherText);
        setUvText(data.uvText);
      } catch {
        if (!cancelled) {
          setWeatherText("Weather unavailable");
          setUvText("UV —");
        }
      }
    }
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { weatherText, uvText };
}
