"use client";

import { motion } from "framer-motion";

type StatusHolerite = "VALIDADO" | "PENDENTE" | "REJEITADO" | "AUSENTE" | "FUTURO";

interface MesHeatmap {
  mes: number;
  status: StatusHolerite;
  holeriteId?: number;
}

interface HeatmapAnualProps {
  ano: number;
  meses: MesHeatmap[];
  onMesClick?: (mes: number, holeriteId?: number) => void;
}

const NOMES_MES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const STATUS_CONFIG: Record<StatusHolerite, { bg: string; border: string; emoji: string; label: string }> = {
  VALIDADO:  { bg: "bg-emerald-500/20", border: "border-emerald-500/50", emoji: "✅", label: "Validado" },
  PENDENTE:  { bg: "bg-amber-500/20",   border: "border-amber-500/50",   emoji: "⏳", label: "Pendente" },
  REJEITADO: { bg: "bg-red-500/20",     border: "border-red-500/50",     emoji: "❌", label: "Rejeitado" },
  AUSENTE:   { bg: "bg-slate-800/60",   border: "border-slate-700/50",   emoji: "—",  label: "Não enviado" },
  FUTURO:    { bg: "bg-slate-900/30",   border: "border-slate-800/30",   emoji: "·",  label: "Futuro" },
};

export default function HeatmapAnual({ ano, meses, onMesClick }: HeatmapAnualProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Heatmap {ano}
        </span>
        <div className="flex items-center gap-4 flex-wrap">
          {(Object.entries(STATUS_CONFIG) as [StatusHolerite, typeof STATUS_CONFIG[StatusHolerite]][])
            .filter(([k]) => k !== "FUTURO")
            .map(([status, cfg]) => (
              <span key={status} className="flex items-center gap-1 text-[8px] font-black uppercase text-slate-500">
                <span>{cfg.emoji}</span> {cfg.label}
              </span>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
        {meses.map((item, i) => {
          const cfg = STATUS_CONFIG[item.status];
          const clicavel = item.status !== "FUTURO" && onMesClick;

          return (
            <motion.div
              key={item.mes}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              onClick={() => clicavel && onMesClick(item.mes, item.holeriteId)}
              className={`
                relative flex flex-col items-center justify-center gap-1 rounded-xl border p-3
                ${cfg.bg} ${cfg.border}
                ${clicavel ? "cursor-pointer hover:scale-105 transition-transform" : "cursor-default"}
              `}
              title={`${NOMES_MES[item.mes - 1]}: ${cfg.label}`}
            >
              <span className="text-base">{cfg.emoji}</span>
              <span className="text-[8px] font-black uppercase text-slate-400">
                {NOMES_MES[item.mes - 1]}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
