"use client";

import { Search } from "lucide-react";

interface BarraPesquisaProps {
    onSearch: (termo: string) => void;
}

export function BarraPesquisa({ onSearch }: BarraPesquisaProps) {
    return (
        <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
                onChange={(e) => onSearch(e.target.value)}
                placeholder="PESQUISAR AGENTE..."
                className="w-full bg-black/40 border border-white/5 rounded-2xl h-12 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-white/20 transition-all text-white placeholder:text-slate-600"
            />
        </div>
    );
}
