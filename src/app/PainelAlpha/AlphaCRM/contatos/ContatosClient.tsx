"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, X, Mail, Phone, Briefcase, Building2, Trash2, Edit3, Tag } from "lucide-react";
import { criarContato, atualizarContato, excluirContato } from "@/actions/CRM";
import type { TemaAlpha } from "@/lib/temas";

const ORIGENS = ["Indicação", "Site", "LinkedIn", "WhatsApp", "Evento", "Prospecção ativa", "Outro"];

const contatoInputCls = "w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-white/20";

function ContatoFieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] text-slate-400 font-medium">{label}</label>
      {children}
    </div>
  );
}

function ModalContato({ contato, accent, onClose }: { contato: any; accent: string; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: contato?.nome || "",
    email: contato?.email || "",
    telefone: contato?.telefone || "",
    cargo: contato?.cargo || "",
    empresa: contato?.empresa || "",
    origem: contato?.origem || "",
    tags: contato?.tags || "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSalvar() {
    if (!form.nome.trim()) return;
    setSaving(true);
    if (contato?.id) {
      await atualizarContato(contato.id, form);
    } else {
      await criarContato(form);
    }
    setSaving(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="font-bold text-white">{contato?.id ? "Editar Contato" : "Novo Contato"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <ContatoFieldRow label="Nome *"><input autoFocus className={contatoInputCls} placeholder="Nome completo" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} /></ContatoFieldRow>
          <div className="grid grid-cols-2 gap-3">
            <ContatoFieldRow label="E-mail"><input className={contatoInputCls} type="email" placeholder="email@empresa.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></ContatoFieldRow>
            <ContatoFieldRow label="Telefone"><input className={contatoInputCls} placeholder="(00) 00000-0000" value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))} /></ContatoFieldRow>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ContatoFieldRow label="Cargo"><input className={contatoInputCls} placeholder="Diretor, Gerente..." value={form.cargo} onChange={e => setForm(p => ({ ...p, cargo: e.target.value }))} /></ContatoFieldRow>
            <ContatoFieldRow label="Empresa"><input className={contatoInputCls} placeholder="Nome da empresa" value={form.empresa} onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))} /></ContatoFieldRow>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ContatoFieldRow label="Origem">
              <select className={contatoInputCls} value={form.origem} onChange={e => setForm(p => ({ ...p, origem: e.target.value }))}>
                <option value="">Selecionar...</option>
                {ORIGENS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </ContatoFieldRow>
            <ContatoFieldRow label="Tags"><input className={contatoInputCls} placeholder="vip, decisor, parceiro" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} /></ContatoFieldRow>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-white/5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-slate-400 hover:text-white">Cancelar</button>
          <button
            onClick={handleSalvar}
            disabled={saving || !form.nome.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: `rgba(${accent},0.85)` }}
          >{saving ? "Salvando..." : "Salvar"}</button>
        </div>
      </div>
    </div>
  );
}

export default function ContatosClient({ contatos: initialContatos, visual }: { contatos: any[]; visual: TemaAlpha }) {
  const accent = visual.accent;
  const [contatos, setContatos] = useState(initialContatos);
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState<any | null>(null);

  const filtrados = contatos.filter(c =>
    !busca || [c.nome, c.empresa, c.email, c.cargo].some(v => v?.toLowerCase().includes(busca.toLowerCase()))
  );

  async function handleExcluir(id: number) {
    setContatos(prev => prev.filter(c => c.id !== id));
    await excluirContato(id);
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Contatos</h1>
          <p className="text-sm text-slate-500">{contatos.length} contato(s) na base</p>
        </div>
        <button
          onClick={() => setModal({})}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: `rgba(${accent},0.85)` }}
        ><Plus size={15} /> Novo Contato</button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome, empresa, e-mail..."
          className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/20"
        />
      </div>

      {/* Grid */}
      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg font-semibold">Nenhum contato encontrado</p>
          <p className="text-sm mt-1">Adicione seu primeiro contato para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map(c => (
            <div
              key={c.id}
              className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 space-y-3 hover:border-white/10 transition-colors"
              style={{ borderColor: `rgba(${accent},0.08)` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white"
                    style={{ background: `rgba(${accent},0.2)` }}
                  >
                    {c.nome[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{c.nome}</p>
                    {c.cargo && <p className="text-[11px] text-slate-400">{c.cargo}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(c)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10"><Edit3 size={13} /></button>
                  <button onClick={() => handleExcluir(c.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"><Trash2 size={13} /></button>
                </div>
              </div>

              <div className="space-y-1.5">
                {c.empresa && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Building2 size={12} />{c.empresa}
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Mail size={12} />{c.email}
                  </div>
                )}
                {c.telefone && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Phone size={12} />{c.telefone}
                  </div>
                )}
              </div>

              {(c.origem || c.tags) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.origem && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5">
                      {c.origem}
                    </span>
                  )}
                  {c.tags?.split(",").filter(Boolean).map((tag: string, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `rgba(${accent},0.15)`, color: `rgb(${accent})` }}>
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <ModalContato contato={modal} accent={accent} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
