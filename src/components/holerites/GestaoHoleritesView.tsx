"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Eye, EyeOff, Trash2, FileText } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { getHoleritesGeral, getEstatisticasHolerites, deletarHolerite } from "@/actions/Holerites";
import EstatisticasCards from "./EstatisticasCards";
import FiltrosGestao from "./FiltrosGestao";
import BotoesValidacao from "./BotoesValidacao";

type HoleriteGeral = {
  id: number;
  competencia: string;
  mes: number;
  ano: number;
  arquivoNome: string;
  arquivoTamanho: number;
  assinado: boolean;
  status: string;
  motivoRejeicao: string | null;
  observacao: string | null;
  uploadedAt: Date | string;
  colaborador: { id: number; nome: string; imagemUrl: string | null; cargo: string | null };
  uploadedBy: { nome: string } | null;
};

type Estatisticas = { total: number; pendentes: number; validados: number; rejeitados: number };

const STATUS_STYLE: Record<string, string> = {
  PENDENTE:  "text-amber-400 bg-amber-500/10 border-amber-500/30",
  VALIDADO:  "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  REJEITADO: "text-red-400 bg-red-500/10 border-red-500/30",
};

export default function GestaoHoleritesView() {
  const anoAtual = new Date().getFullYear();
  const [ano, setAno] = useState(anoAtual);
  const [mes, setMes] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState("");
  const [busca, setBusca] = useState("");
  const [holerites, setHolerites] = useState<HoleriteGeral[]>([] as HoleriteGeral[]);
  const [stats, setStats] = useState<Estatisticas>({ total: 0, pendentes: 0, validados: 0, rejeitados: 0 });
  const [loading, setLoading] = useState(true);
  const [deletandoId, setDeletandoId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const carregarTudo = useCallback(async () => {
    setLoading(true);
    try {
      const [resHolerites, resStats] = await Promise.all([
        getHoleritesGeral({
          ano,
          ...(mes !== undefined && { mes }),
          ...(status && { status: status as "PENDENTE" | "VALIDADO" | "REJEITADO" }),
          ...(busca && { busca }),
        }),
        getEstatisticasHolerites(ano),
      ]);
      if (resHolerites.success) setHolerites(resHolerites.data);
      if (resStats.success) setStats(resStats.data);
    } finally {
      setLoading(false);
    }
  }, [ano, mes, status, busca]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void carregarTudo(); }, [carregarTudo]);

  const handleDeletar = async (id: number) => {
    if (!confirm("Confirmar exclusão permanente deste holerite? Esta ação não pode ser desfeita.")) return;
    setDeletandoId(id);
    try {
      const res = await deletarHolerite(id);
      if (res.success) {
        toast.success("Holerite removido");
        setExpandedId(null);
        carregarTudo();
      } else {
        toast.error(res.error || "Erro ao deletar");
      }
    } finally {
      setDeletandoId(null);
    }
  };

  const toggleExpand = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="flex flex-col gap-6">
      <EstatisticasCards {...stats} />

      <FiltrosGestao
        ano={ano}
        mes={mes}
        status={status}
        busca={busca}
        onAnoChange={setAno}
        onMesChange={setMes}
        onStatusChange={setStatus}
        onBuscaChange={setBusca}
      />

      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
          {holerites.length} resultado{holerites.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={carregarTudo}
          disabled={loading}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all disabled:opacity-40"
          title="Atualizar"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500 text-xs font-black uppercase">
            Carregando...
          </div>
        ) : holerites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 py-12 text-slate-600"
          >
            <span className="text-3xl">🗂️</span>
            <p className="text-[10px] font-black uppercase tracking-widest">Nenhum holerite encontrado</p>
          </motion.div>
        ) : (
          holerites.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl overflow-hidden"
            >
              {/* Row */}
              <div className="flex items-center gap-4 p-4">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 shrink-0">
                  {h.colaborador.imagemUrl ? (
                    <Image
                      src={h.colaborador.imagemUrl}
                      alt=""
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-400">
                      {h.colaborador.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-white truncate">{h.colaborador.nome}</p>
                  <p className="text-[9px] text-slate-500 truncate">
                    {h.competencia} · {h.colaborador.cargo ?? "—"}
                  </p>
                </div>

                <div className={`flex items-center px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase shrink-0 ${STATUS_STYLE[h.status] ?? ""}`}>
                  {h.status}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleExpand(h.id)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all"
                    title={expandedId === h.id ? "Recolher" : "Expandir"}
                  >
                    {expandedId === h.id ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    onClick={() => handleDeletar(h.id)}
                    disabled={deletandoId === h.id}
                    className="p-2 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500/50 hover:text-red-400 hover:border-red-500/40 transition-all disabled:opacity-40"
                    title="Excluir"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === h.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-white/5 p-4 flex flex-col gap-4"
                >
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-[9px] font-black uppercase text-slate-500">
                    <span>Arquivo: <span className="text-slate-300">{h.arquivoNome}</span></span>
                    <span>Tamanho: <span className="text-slate-300">{Math.round(h.arquivoTamanho / 1024)} KB</span></span>
                    <span>
                      Assinado:{" "}
                      <span className={h.assinado ? "text-emerald-400" : "text-red-400"}>
                        {h.assinado ? "Sim" : "Não"}
                      </span>
                    </span>
                    {h.observacao && (
                      <span>Obs: <span className="text-slate-300 normal-case font-medium">{h.observacao}</span></span>
                    )}
                    {h.motivoRejeicao && (
                      <span>Motivo rejeição: <span className="text-red-300 normal-case font-medium">{h.motivoRejeicao}</span></span>
                    )}
                  </div>

                  <a
                    href={`/api/holerites/${h.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 self-start px-3 h-8 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all text-[9px] font-black uppercase tracking-widest"
                  >
                    <FileText size={12} />
                    Abrir PDF
                  </a>

                  {h.status === "PENDENTE" && (
                    <BotoesValidacao holeriteId={h.id} onAtualizado={carregarTudo} />
                  )}
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
