"use client";
import { useEffect } from "react";
import { getTema } from "@/lib/temas";

export function ThemeSyncer() {
  useEffect(() => {
    const temaCache = localStorage.getItem("alpha-theme-temp");
    if (temaCache) {
      const estilo = getTema(temaCache);
      document.documentElement.style.setProperty("--alpha-primary", estilo.accent);
    }
  }, []);

  return null;
}
