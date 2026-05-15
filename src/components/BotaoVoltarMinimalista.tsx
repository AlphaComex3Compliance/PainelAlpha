import React from 'react';
import { ChevronLeft } from 'lucide-react';

const BotaoVoltar = () => {
  return (
    <a 
      href="/PainelAlpha" 
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
    >
      <ChevronLeft 
        size={16} 
        className="transform group-hover:-translate-x-1 transition-transform duration-300" 
      />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
        Voltar ao Painel Alpha
      </span>
    </a>
  );
};

export default BotaoVoltar;