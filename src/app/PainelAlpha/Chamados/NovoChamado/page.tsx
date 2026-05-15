"use client";

import { createChamadoAction } from "@/actions/chamados";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, Loader2, ShieldAlert, MessageSquare, Tag, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIAS = [
  { value: "Hardware", label: "🛠️ Hardware", desc: "Equipamentos, periféricos, infraestrutura física" },
  { value: "Software", label: "💻 Software", desc: "Sistemas, aplicativos, atualizações" },
  { value: "Rede", label: "🌐 Rede / Infraestrutura", desc: "Conexão, VPN, acesso remoto" },
  { value: "Acesso", label: "🔑 Acesso / Permissões", desc: "Login, senhas, permissões de sistema" },
  { value: "Financeiro", label: "💰 Financeiro / Contábil", desc: "Dúvidas ou problemas financeiros" },
  { value: "Outro", label: "📋 Outro", desc: "Solicitações que não se enquadram acima" },
];

const PRIORIDADES = [
  { value: "BAIXA", label: "Baixa", color: "peer-checked:bg-emerald-600 peer-checked:border-emerald-400 peer-checked:text-white", desc: "Pode aguardar" },
  { value: "MEDIA", label: "Média", color: "peer-checked:bg-blue-600 peer-checked:border-blue-400 peer-checked:text-white", desc: "Prazo normal" },
  { value: "ALTA", label: "Alta", color: "peer-checked:bg-orange-600 peer-checked:border-orange-400 peer-checked:text-white", desc: "Atenção necessária" },
  { value: "URGENTE", label: "Urgente", color: "peer-checked:bg-rose-600 peer-checked:border-rose-400 peer-checked:text-white", desc: "Impacto crítico" },
];

const MAX_DESC = 800;

export default function NovoChamadoPage() {
  const [pending, setPending] = useState(false);
  const [descricao, setDescricao] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);

    try {
      const formData = new FormData(event.currentTarget);
      const res = await createChamadoAction(formData);

      if (res?.error) {
        toast.error(res.error);
        setPending(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") return;
      toast.error("Falha ao processar requisição");
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl">

        {/* Voltar */}
        <Link
          href="/PainelAlpha/Chamados"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-400 mb-10 group transition-colors"
        >
          <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-blue-500/50 transition-all">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Voltar para Chamados</span>
        </Link>

        <div className="relative rounded-[2.5rem] border border-white/5 bg-slate-900/20 backdrop-blur-3xl shadow-[0_0_60px_rgba(0,0,0,0.5)] p-10 ring-1 ring-white/5 overflow-hidden">
          {/* Glow decorativo */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-600/8 blur-[100px] rounded-full pointer-events-none" />

          {/* Header */}
          <header className="relative mb-10">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-blue-600/15 rounded-2xl border border-blue-500/20">
                <Zap className="text-blue-400 w-5 h-5" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                Abrir <span className="text-blue-500">Chamado</span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] ml-1 mt-2">
              Sistema de Suporte Alpha • Preencha todos os campos
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8 relative">

            {/* Título */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Título do Chamado
              </Label>
              <Input
                name="titulo"
                placeholder="Ex: Falha ao acessar o sistema de estoque"
                required
                maxLength={120}
                className="h-12 bg-black/40 border-white/5 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/10 placeholder:text-slate-700 text-sm font-bold transition-all"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <Tag size={13} className="text-purple-400" />
                Categoria
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORIAS.map((cat, i) => (
                  <label key={cat.value} className="relative group cursor-pointer">
                    <input
                      type="radio"
                      name="categoria"
                      value={cat.value}
                      defaultChecked={i === 0}
                      className="peer sr-only"
                    />
                    <div className="flex flex-col p-4 rounded-2xl bg-white/3 border border-white/5 cursor-pointer peer-checked:bg-purple-600/10 peer-checked:border-purple-500/40 peer-checked:text-white group-hover:border-white/15 transition-all">
                      <span className="font-black text-sm text-slate-300 peer-checked:text-white">{cat.label}</span>
                      <span className="text-[10px] text-slate-600 font-bold mt-0.5">{cat.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Prioridade */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                <ShieldAlert size={13} className="text-amber-400" />
                Nível de Urgência
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRIORIDADES.map((p) => (
                  <label key={p.value} className="relative group cursor-pointer">
                    <input
                      type="radio"
                      name="prioridade"
                      value={p.value}
                      defaultChecked={p.value === "MEDIA"}
                      className="peer sr-only"
                    />
                    <div
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-tighter group-hover:border-white/20 transition-all cursor-pointer ${p.color}`}
                    >
                      <span className="text-sm font-black">{p.label}</span>
                      <span className="font-bold opacity-70 mt-0.5 normal-case text-[9px]">{p.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <MessageSquare size={13} className="text-blue-400" />
                  Descrição Detalhada
                </Label>
                <span className={`text-[10px] font-bold tabular-nums ${descricao.length > MAX_DESC * 0.9 ? "text-amber-400" : "text-slate-600"}`}>
                  {descricao.length}/{MAX_DESC}
                </span>
              </div>
              <textarea
                name="descricao"
                required
                rows={5}
                maxLength={MAX_DESC}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o problema com detalhes: o que aconteceu, quando começou, o que foi tentado..."
                className="w-full rounded-[1.5rem] border border-white/5 bg-black/40 p-5 text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/5 transition-all resize-none placeholder:text-slate-700"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={pending}
              className={`w-full rounded-[1.5rem] h-14 font-black uppercase tracking-[0.15em] text-sm shadow-2xl transition-all flex items-center justify-center gap-3 ${
                pending
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 active:scale-[0.99]"
              }`}
            >
              {pending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registrando chamado...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Abrir Chamado
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-[9px] font-bold text-slate-700 uppercase tracking-widest">
          Alpha Systems • Protocolo Seguro • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
