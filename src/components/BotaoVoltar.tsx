"use client";

import Link from "next/link";
import { ArrowLeft, ChevronLeft } from "lucide-react";

export function BotaoVoltar({ destino = "/PainelAlpha" }: { destino?: string }) {
  return (
    <Link
      href={destino}
      className="group relative flex items-center gap-4 px-8 py-4 rounded-[2rem] bg-[#050505] border border-white/5 hover:border-emerald-500/40 transition-all duration-700 shadow-2xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
      
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-center gap-4">
        <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all duration-500">
                <ChevronLeft 
                    size={14} 
                    className="text-slate-400 group-hover:text-emerald-400 transition-all duration-500 group-hover:-translate-x-1" 
                />
            </div>
        </div>

        <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] italic text-slate-500 group-hover:text-white transition-colors duration-500">
                Retornar
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-700 group-hover:text-emerald-500/80 transition-colors duration-500">
                Base de Dados Alpha
            </span>
        </div>
      </div>

      <div className="absolute right-4 w-1 h-1 rounded-full bg-slate-800 group-hover:bg-emerald-500 animate-pulse transition-colors" />
    </Link>
  );
}
