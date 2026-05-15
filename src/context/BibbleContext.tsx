"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface BibbleContextData {
  paginaAtual?: string;
  dadosSelecionados?: Record<string, unknown>;
  [key: string]: unknown;
}

interface BibbleContextType {
  contextoExtra: BibbleContextData;
  setContextoExtra: (dados: BibbleContextData) => void;
}

const BibbleContext = createContext<BibbleContextType | undefined>(undefined);

export function BibbleProvider({ children }: { children: ReactNode }) {
  const [contextoExtra, setContextoExtra] = useState<BibbleContextData>({});

  return (
    <BibbleContext.Provider value={{ contextoExtra, setContextoExtra }}>
      {children}
    </BibbleContext.Provider>
  );
}

export const useBibble = () => {
  const context = useContext(BibbleContext);
  if (!context) throw new Error("useBibble deve ser usado dentro de um BibbleProvider");
  return context;
};
