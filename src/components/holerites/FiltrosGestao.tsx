"use client";

import { Search } from "lucide-react";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface FiltrosGestaoProps {
  ano: number;
  mes: number | undefined;
  status: string;
  busca: string;
  onAnoChange: (ano: number) => void;
  onMesChange: (mes: number | undefined) => void;
  onStatusChange: (status: string) => void;
  onBuscaChange: (busca: string) => void;
}

export default function FiltrosGestao({
  ano, mes, status, busca,
  onAnoChange, onMesChange, onStatusChange, onBuscaChange,
}: FiltrosGestaoProps) {
  const anoAtual = new Date().getFullYear();
  const anos = [anoAtual - 1, anoAtual, anoAtual + 1];

  const selectClass =
    "h-10 bg-black/40 border border-white/10 rounded-xl px-3 text-[10px] font-black uppercase tracking-wide text-white focus:outline-none focus:border-blue-500/50 transition-all cursor-pointer";

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Busca */}
      <div className="relative group flex-1 min-w-[160px]">
        <Search size={14} className="absolute left-3 top-3 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="Buscar colaborador..."
          className="h-10 w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 text-[10px] font-black uppercase tracking-wide text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </div>

      {/* Ano */}
      <select value={ano} onChange={(e) => onAnoChange(Number(e.target.value))} className={selectClass}>
        {anos.map((a) => (
          <option key={a} value={a} className="bg-slate-900">{a}</option>
        ))}
      </select>

      {/* Mês */}
      <select
        value={mes ?? ""}
        onChange={(e) => onMesChange(e.target.value ? Number(e.target.value) : undefined)}
        className={selectClass}
      >
        <option value="" className="bg-slate-900">Todos os meses</option>
        {MESES.map((nome, i) => (
          <option key={i + 1} value={i + 1} className="bg-slate-900">{nome}</option>
        ))}
      </select>

      {/* Status */}
      <select value={status} onChange={(e) => onStatusChange(e.target.value)} className={selectClass}>
        <option value="" className="bg-slate-900">Todos os status</option>
        <option value="PENDENTE" className="bg-slate-900">⏳ Pendente</option>
        <option value="VALIDADO" className="bg-slate-900">✅ Validado</option>
        <option value="REJEITADO" className="bg-slate-900">❌ Rejeitado</option>
      </select>
    </div>
  );
}
