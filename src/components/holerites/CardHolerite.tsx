"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle, Clock, XCircle, Download, Eye } from "lucide-react";

type HoleriteCard = {
  id: number;
  competencia: string;
  arquivoNome: string;
  arquivoTamanho: number;
  assinado: boolean;
  status: string;
  uploadedAt: Date | string;
  motivoRejeicao?: string | null;
};

interface CardHoleriteProps {
  holerite: HoleriteCard;
  index?: number;
}

const STATUS_MAP: Record<string, {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  color: string;
}> = {
  PENDENTE:  { icon: Clock,       label: "Pendente",  color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  VALIDADO:  { icon: CheckCircle, label: "Validado",  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  REJEITADO: { icon: XCircle,     label: "Rejeitado", color: "text-red-400 bg-red-500/10 border-red-500/30" },
};

export default function CardHolerite({ holerite, index = 0 }: CardHoleriteProps) {
  const s = STATUS_MAP[holerite.status] ?? STATUS_MAP.PENDENTE;
  const Icon = s.icon;
  const tamanhoKB = Math.round(holerite.arquivoTamanho / 1024);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-4 flex items-center gap-4 hover:border-white/10 transition-all"
    >
      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 shrink-0">
        <FileText size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-black uppercase tracking-wider text-white truncate">
          {holerite.competencia}
        </p>
        <p className="text-[9px] text-slate-500 truncate mt-0.5">
          {holerite.arquivoNome} · {tamanhoKB} KB
        </p>
        {holerite.motivoRejeicao && (
          <p className="text-[9px] text-red-400 truncate mt-0.5">
            Motivo: {holerite.motivoRejeicao}
          </p>
        )}
      </div>

      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase shrink-0 ${s.color}`}>
        <Icon size={11} />
        {s.label}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
        <a
          href={`/api/holerites/${holerite.id}/download`}
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:border-white/20 transition-all"
          title="Visualizar PDF"
        >
          <Eye size={14} />
        </a>
        <a
          href={`/api/holerites/${holerite.id}/download`}
          download
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white hover:border-white/20 transition-all"
          title="Baixar PDF"
        >
          <Download size={14} />
        </a>
      </div>
    </motion.div>
  );
}
