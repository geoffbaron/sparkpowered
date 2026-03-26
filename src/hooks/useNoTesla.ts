"use client";

import { useState, useEffect } from "react";

const KEY = "spark_no_tesla";

export function useNoTesla() {
  const [noTesla, setNoTeslaState] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      setNoTeslaState(localStorage.getItem(KEY) === "1");
    } catch {}
  }, []);

  function setNoTesla(value: boolean) {
    setNoTeslaState(value);
    try {
      if (value) localStorage.setItem(KEY, "1");
      else localStorage.removeItem(KEY);
    } catch {}
  }

  return [noTesla, setNoTesla] as const;
}
