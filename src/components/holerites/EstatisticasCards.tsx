"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle, FileText } from "lucide-react";

interface EstatisticasCardsProps {
  total: number;
  pendentes: number;
  validados: number;
  rejeitados: number;
}

export default function EstatisticasCards({ total, pendentes, validados, rejeitados }: EstatisticasCardsProps) {
  const cards = [
    { label: "Total Recebidos", value: total, icon: FileText, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { label: "Pendentes",       value: pendentes, icon: Clock, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    { label: "Validados",       value: validados, icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { label: "Rejeitados",      value: rejeitados, icon: XCircle, color: "text-red-500 bg-red-500/10 border-red-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-5 flex items-center gap-4"
        >
          <div className={`p-3 rounded-xl border ${card.color}`}>
            <card.icon size={20} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{card.label}</p>
            <p className="text-2xl font-black text-white italic">{card.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
