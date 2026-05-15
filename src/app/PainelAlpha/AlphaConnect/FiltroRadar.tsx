"use client";

import { useState } from "react";
import { Filter, ChevronDown, Check, LayoutGrid, ArrowDownAZ, ArrowUpZA, Clock, Banknote, ShieldCheck } from "lucide-react";

export function FiltroRadar({ onFilterChange }: { onFilterChange: (type: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selecionado, setSelecionado] = useState("todos");

    const categorias = [
        { 
            titulo: "Ordenação", 
            items: [
                { label: "Padrão", value: "todos", icon: LayoutGrid },
                { label: "A - Z", value: "az", icon: ArrowDownAZ },
                { label: "Z - A", value: "za", icon: ArrowUpZA },
                { label: "Mais Novos", value: "novos", icon: Clock },
                { label: "Mais Antigos", value: "antigos", icon: Clock },
            ] 
        },
        { 
            titulo: "Financeiro", 
            items: [
                { label: "Maior Dívida", value: "divida_maior", icon: Banknote },
                { label: "Menor Dívida", value: "divida_minima", icon: Banknote },
            ] 
        },
        { 
            titulo: "Qualificação", 
            items: [
                { label: "Premium", value: "premium", icon: ShieldCheck },
                { label: "Qualificados", value: "qualificado", icon: ShieldCheck },
                { label: "Desqualificados", value: "desqualificado", icon: ShieldCheck },
            ] 
        },
        { 
            titulo: "Regime & PERSE", 
            items: [
                { label: "Anexo 1", value: "anexo1", icon: Filter },
                { label: "Anexo 2", value: "anexo2", icon: Filter },
                { label: "Lucro Real", value: "real", icon: Filter },
                { label: "Lucro Presumido", value: "presumido", icon: Filter },
                { label: "Simples Nacional", value: "simples", icon: Filter },
            ] 
        }
    ];

    const handleSelect = (val: string) => {
        setSelecionado(val);
        onFilterChange(val);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer p-4 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95"
            >
                <Filter size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Filtrar</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-3 w-72 bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar space-y-4">
                            {categorias.map((cat, i) => (
                                <div key={i} className="space-y-2">
                                    <h4 className="px-3 text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">{cat.titulo}</h4>
                                    <div className="grid grid-cols-1 gap-1">
                                        {cat.items.map((item) => (
                                            <button
                                                key={item.value}
                                                onClick={() => handleSelect(item.value)}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${selecionado === item.value ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon size={14} className={selecionado === item.value ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'} />
                                                    <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
                                                </div>
                                                {selecionado === item.value && <Check size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
