import { useCallback, useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const read = useCallback(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return typeof initialValue === "function" ? initialValue() : initialValue;
      return JSON.parse(raw);
    } catch {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  }, [key, initialValue]);

  const [value, setValue] = useState(read);

  useEffect(() => {
    setValue(read());
  }, [read]);

  const setStored = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* ignore quota errors */
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, setStored];
}

export function useLocalStorageString(key, initialValue = "") {
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) ?? initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStored = useCallback(
    (next) => {
      const resolved = typeof next === "function" ? next(value) : next;
      setValue(resolved);
      try {
        if (resolved == null || resolved === "") localStorage.removeItem(key);
        else localStorage.setItem(key, resolved);
      } catch {
        /* ignore */
      }
    },
    [key, value]
  );

  return [value, setStored];
}
