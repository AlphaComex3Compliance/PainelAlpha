"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { updateChamadosStatus } from "@/actions/chamados";
import {
  Clock, CheckCircle, User, MessageSquare, Calendar,
  CheckCircle2, Tag, AlertTriangle, Eye,
} from "lucide-react";
import { toast } from "sonner";

type Solicitante = {
  nome: string;
  usuario: string;
};

type ChamadoDetalhes = {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  status: string;
  prioridade: string;
  solucao: string | null;
  createdAt: Date | string;
  solicitante: Solicitante;
};

type Props = {
  chamado: ChamadoDetalhes;
  isAdmin: boolean;
};

const prioridadeConfig: Record<string, { label: string; class: string }> = {
  URGENTE: { label: "Urgente", class: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  ALTA: { label: "Alta", class: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  MEDIA: { label: "Média", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  BAIXA: { label: "Baixa", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

function tempoAberto(data: Date | string): string {
  const diff = Date.now() - new Date(data).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "menos de 1h";
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export default function DetalhesChamado({ chamado, isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const [solucaoInput, setSolucaoInput] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleStatus = async (status: string) => {
    if (status === "CONCLUIDO") {
      setConfirmando(true);
      return;
    }
    setCarregando(true);
    const res = await updateChamadosStatus(chamado.id, status);
    setCarregando(false);
    if (res.success) {
      toast.success("Status atualizado");
      setOpen(false);
    } else {
      toast.error(res.error || "Erro ao atualizar");
    }
  };

  const handleConcluir = async () => {
    if (!solucaoInput.trim()) {
      toast.error("Descreva a solução antes de concluir");
      return;
    }
    setCarregando(true);
    const res = await updateChamadosStatus(chamado.id, "CONCLUIDO", solucaoInput.trim());
    setCarregando(false);
    if (res.success) {
      toast.success("Chamado concluído");
      setOpen(false);
      setConfirmando(false);
      setSolucaoInput("");
    } else {
      toast.error(res.error || "Erro ao concluir");
    }
  };

  const prio = prioridadeConfig[chamado.prioridade] ?? prioridadeConfig.MEDIA;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        size="sm"
        className="cursor-pointer text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 font-black text-xs uppercase tracking-widest gap-2"
      >
        <Eye size={14} />
        Detalhes
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setConfirmando(false); setSolucaoInput(""); } }}>
        <DialogContent className="bg-[#080e1a] border-blue-500/10 text-white max-w-2xl rounded-[2rem] p-0 overflow-hidden">

          {/* Header */}
          <div className="p-8 border-b border-white/5 bg-gradient-to-b from-blue-600/5 to-transparent">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tighter mb-1">
                    {chamado.titulo}
                  </DialogTitle>
                  <div className="flex items-center gap-2 text-slate-500 text-xs mt-1 font-bold">
                    <Calendar size={13} />
                    {new Date(chamado.createdAt).toLocaleString("pt-BR")}
                    <span className="text-slate-700">•</span>
                    <Clock size={13} />
                    <span>Aberto há {tempoAberto(chamado.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-black">
                    #{chamado.id}
                  </span>
                  <span className={`px-3 py-1 rounded-lg border text-xs font-black ${prio.class}`}>
                    {prio.label}
                  </span>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex gap-3 p-4 rounded-2xl bg-white/3 border border-white/5">
                <div className="p-2 rounded-xl bg-blue-600/15 border border-blue-500/20 flex-shrink-0">
                  <User className="text-blue-400 w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Solicitante</p>
                  <p className="font-bold text-white text-sm">{chamado.solicitante?.nome}</p>
                  <p className="text-[10px] text-slate-500 font-bold">@{chamado.solicitante?.usuario}</p>
                </div>
              </div>

              <div className="flex gap-3 p-4 rounded-2xl bg-white/3 border border-white/5">
                <div className="p-2 rounded-xl bg-purple-600/15 border border-purple-500/20 flex-shrink-0">
                  <Tag className="text-purple-400 w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Categoria</p>
                  <p className="font-bold text-white text-sm">{chamado.categoria}</p>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={14} className="text-blue-400" />
                Ocorrência Relatada
              </h4>
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 text-slate-300 text-sm leading-relaxed">
                {chamado.descricao}
              </div>
            </div>

            {/* Solução cadastrada */}
            {chamado.solucao && !confirmando && (
              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <h4 className="text-emerald-400 text-[10px] font-black uppercase mb-2 flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  Solução Aplicada
                </h4>
                <p className="text-emerald-100/80 text-sm leading-relaxed">{chamado.solucao}</p>
              </div>
            )}

            {/* Input de solução (aparece ao clicar em Finalizar) */}
            {confirmando && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={14} />
                  Descreva a solução aplicada
                </h4>
                <textarea
                  value={solucaoInput}
                  onChange={(e) => setSolucaoInput(e.target.value)}
                  rows={4}
                  placeholder="Explique como o problema foi resolvido..."
                  className="w-full rounded-2xl border border-white/5 bg-black/40 p-4 text-sm text-white font-medium focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none placeholder:text-slate-700"
                  autoFocus
                />
              </div>
            )}

            {/* Ações do admin */}
            {isAdmin && chamado.status !== "CONCLUIDO" && (
              <div className={`grid gap-3 pt-5 border-t border-white/5 ${confirmando ? "grid-cols-2" : "grid-cols-2"}`}>
                {confirmando ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => { setConfirmando(false); setSolucaoInput(""); }}
                      className="cursor-pointer h-12 font-bold rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleConcluir}
                      disabled={carregando || !solucaoInput.trim()}
                      className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white h-12 font-black rounded-xl shadow-lg shadow-emerald-900/20 disabled:opacity-40"
                    >
                      <CheckCircle className="mr-2 w-4 h-4" />
                      {carregando ? "Salvando..." : "Confirmar Solução"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => handleStatus("EM_ATENDIMENTO")}
                      disabled={carregando || chamado.status === "EM_ATENDIMENTO"}
                      className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/20 h-12 font-bold rounded-xl disabled:opacity-40"
                    >
                      <Clock className="mr-2 w-4 h-4" />
                      Em Atendimento
                    </Button>
                    <Button
                      onClick={() => handleStatus("CONCLUIDO")}
                      disabled={carregando}
                      className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white h-12 font-black rounded-xl shadow-lg shadow-blue-900/20"
                    >
                      <CheckCircle className="mr-2 w-4 h-4" />
                      Finalizar Chamado
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
