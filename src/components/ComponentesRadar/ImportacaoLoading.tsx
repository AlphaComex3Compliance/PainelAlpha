type Props = {
  totalLote: number;
  processadas: number;
  statusLote: string;
  processando: boolean;
  onCancelar: () => void;
};

export default function LoadingImport({
  totalLote,
  processadas,
  statusLote,
  processando,
  onCancelar,
}: Props) {
  const progresso = totalLote > 0 ? Math.min(Math.round((processadas / totalLote) * 100), 100) : 0;
  
  const isSyncBanco = statusLote?.toLowerCase().includes("banco") || statusLote?.toLowerCase().includes("sincronizando");

  if (!processando && processadas === 0) {
    return (
      <div className="mt-6 p-4 rounded-xl border border-white/5 bg-slate-900/50 text-sm text-zinc-500 italic text-center">
        {statusLote || "Aguardando início do lote..."}
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4 w-full animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full animate-ping ${isSyncBanco ? 'bg-purple-500' : 'bg-blue-500'}`} />
          <span className={`text-[10px] uppercase tracking-widest font-black ${isSyncBanco ? 'text-purple-400' : 'text-blue-400'}`}>
            {statusLote || (processando ? "Processando..." : "Finalizado")}
          </span>
        </div>
        <span className="text-xs font-mono font-black text-white bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
          {progresso}%
        </span>
      </div>

      <div className="relative h-4 w-full bg-slate-950/80 rounded-full border border-white/10 overflow-hidden p-[3px] shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-in-out shadow-[0_0_20px_rgba(59,130,246,0.5)] ${
            isSyncBanco 
              ? 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-400 shadow-purple-500/40' 
              : 'bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 shadow-blue-500/40'
          }`}
          style={{ width: `${progresso}%` }}
        >
          {/* Efeito de brilho correndo na barra */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] skew-x-[-20deg]" />
        </div>
      </div>

      <div className="flex justify-between items-center px-1 bg-slate-900/30 p-2 rounded-lg border border-white/5">
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-500 font-black uppercase tracking-tight">Status do Processamento</span>
          <span className="text-xs text-zinc-300 font-mono font-bold">
            {processadas.toLocaleString()} <span className="text-zinc-600">/</span> {totalLote.toLocaleString()} <small className="text-[9px] text-zinc-500">registros</small>
          </span>
        </div>
        
        {processando && (
          <button
            onClick={onCancelar}
            className="group relative overflow-hidden text-[10px] bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white px-4 py-1.5 rounded-lg border border-rose-500/30 transition-all font-black uppercase"
          >
            <span className="relative z-10">Interromper</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
          </button>
        )}
      </div>

      {/* Indicador visual de rede/banco */}
      {processando && (
        <div className="flex items-center justify-center gap-4 py-1 border-t border-white/5">
           <div className="flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${isSyncBanco ? 'bg-zinc-700' : 'bg-blue-500 animate-pulse'}`} />
              <span className={`text-[8px] font-bold ${isSyncBanco ? 'text-zinc-600' : 'text-blue-500'}`}>API RECEITA</span>
           </div>
           <div className="h-1 w-1 rounded-full bg-zinc-800" />
           <div className="flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${isSyncBanco ? 'bg-purple-500 animate-pulse' : 'bg-zinc-700'}`} />
              <span className={`text-[8px] font-bold ${isSyncBanco ? 'text-purple-500' : 'text-zinc-600'}`}>DATABASE SYNC</span>
           </div>
        </div>
      )}
    </div>
  );
}
