"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { validarHolerite, rejeitarHolerite } from "@/actions/Holerites";

interface BotoesValidacaoProps {
  holeriteId: number;
  onAtualizado?: () => void;
}

export default function BotoesValidacao({ holeriteId, onAtualizado }: BotoesValidacaoProps) {
  const [loadingValidar, setLoadingValidar] = useState(false);
  const [loadingRejeitar, setLoadingRejeitar] = useState(false);
  const [showMotivoInput, setShowMotivoInput] = useState(false);
  const [motivo, setMotivo] = useState("");

  const handleValidar = async () => {
    setLoadingValidar(true);
    try {
      const res = await validarHolerite(holeriteId);
      if (res.success) {
        toast.success("Holerite validado com sucesso");
        onAtualizado?.();
      } else {
        toast.error(res.error || "Erro ao validar");
      }
    } finally {
      setLoadingValidar(false);
    }
  };

  const handleRejeitar = async () => {
    if (!showMotivoInput) {
      setShowMotivoInput(true);
      return;
    }
    if (motivo.trim().length < 5) {
      toast.error("Informe o motivo da rejeição (mínimo 5 caracteres)");
      return;
    }
    setLoadingRejeitar(true);
    try {
      const res = await rejeitarHolerite(holeriteId, motivo.trim());
      if (res.success) {
        toast.success("Holerite rejeitado");
        setShowMotivoInput(false);
        setMotivo("");
        onAtualizado?.();
      } else {
        toast.error(res.error || "Erro ao rejeitar");
      }
    } finally {
      setLoadingRejeitar(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleValidar}
          disabled={loadingValidar || loadingRejeitar}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
        >
          {loadingValidar ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          Validar
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleRejeitar}
          disabled={loadingValidar || loadingRejeitar}
          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
        >
          {loadingRejeitar ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
          Rejeitar
        </motion.button>
      </div>

      <AnimatePresence>
        {showMotivoInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2"
          >
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo da rejeição (obrigatório)..."
              className="w-full h-20 bg-black/40 border border-red-500/30 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-red-500/60"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowMotivoInput(false); setMotivo(""); }}
                className="flex-1 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejeitar}
                disabled={loadingRejeitar}
                className="flex-1 h-8 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-[9px] font-black uppercase disabled:opacity-50"
              >
                {loadingRejeitar ? "Rejeitando..." : "Confirmar Rejeição"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
