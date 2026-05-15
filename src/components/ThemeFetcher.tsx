"use client";

import { useEffect } from "react";
import { getTema } from "@/lib/temas";

export function ThemeFetcher({ temaAtivo }: { temaAtivo: string }) {
  useEffect(() => {
    const estilo = getTema(temaAtivo);
    document.documentElement.style.setProperty("--alpha-primary", estilo.accent);
    
    
    localStorage.setItem("alpha-theme-accent", estilo.accent);
  }, [temaAtivo]);

  return null;
}
