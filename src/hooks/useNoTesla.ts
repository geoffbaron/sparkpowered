"use client";

import { useSyncExternalStore } from "react";

const KEY = "spark_no_tesla";
const EVENT = "spark-no-tesla-change";

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/**
 * "Hide Tesla" preference, persisted in localStorage and shared by every
 * component on the page. Reads as false during server rendering.
 */
export function useNoTesla() {
  const noTesla = useSyncExternalStore(subscribe, read, () => false);

  function setNoTesla(value: boolean) {
    try {
      if (value) localStorage.setItem(KEY, "1");
      else localStorage.removeItem(KEY);
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  }

  return [noTesla, setNoTesla] as const;
}
