"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi, ShieldAlert, Zap } from "lucide-react";

export function StatusConexao() {
  const [status, setStatus] = useState<"online" | "offline" | "restabelecida">("online");

  useEffect(() => {
    const handleOnline = () => {
      setStatus("restabelecida");
      setTimeout(() => setStatus("online"), 10000);
    };

    const handleOffline = () => setStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (status === "online") return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6 pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto" />
      
      <div className={`relative flex flex-col items-center p-8 rounded-[2.5rem] border shadow-2xl animate-in zoom-in duration-300 max-w-sm w-full text-center ${
        status === "offline" 
        ? "bg-rose-950/40 border-rose-500/50 shadow-rose-900/40" 
        : "bg-emerald-950/40 border-emerald-500/50 shadow-emerald-900/40"
      }`}>
        <div className={`p-5 rounded-3xl mb-6 ${
          status === "offline" ? "bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.3)]" : "bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        }`}>
          {status === "offline" ? (
            <WifiOff className="text-rose-500 animate-pulse" size={40} />
          ) : (
            <Zap className="text-emerald-500 animate-bounce" size={40} />
          )}
        </div>

        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">
          {status === "offline" ? "CONEXÃO INTERROMPIDA" : "SINAL RECUPERADO"}
        </h3>
        
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-relaxed">
          {status === "offline" 
            ? "O sistema Alpha pausou todas as requisições para evitar perda de dados." 
            : "Sincronizando protocolos... O sistema voltará ao normal em instantes."}
        </p>

        {status === "offline" && (
            <div className="mt-6 flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full">
                <ShieldAlert size={12} className="text-rose-500" />
                <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Protocolo de Segurança Ativo</span>
            </div>
        )}
      </div>
    </div>
  );
}
