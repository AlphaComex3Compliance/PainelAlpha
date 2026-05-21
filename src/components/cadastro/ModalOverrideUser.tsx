'use client';

import { useEffect, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCog, Plus, Trash2, RotateCcw, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { MODULOS_REGISTRY } from '@/lib/modulos-registry';
import {
  listarModulosEfetivosDeUser,
  adicionarOverride,
  removerOverride,
  resetarUserParaSetor,
} from '@/actions/PermissoesSetor';

interface UsuarioBasico {
  id: number;
  nome: string;
  role: string;
}

interface Override {
  id: number;
  modulo: string;
  acao: string;
  motivo?: string | null;
}

interface Props {
  user: UsuarioBasico | null;
  open: boolean;
  onClose: () => void;
}

const MODULOS_GERENCIAVEIS = MODULOS_REGISTRY.filter(m => m.permission && !m.adminOnly);

export default function ModalOverrideUser({ user, open, onClose }: Props) {
  const [dados, setDados] = useState<{
    setorModulos: string[];
    overrides: Override[];
    efetivos: string[];
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [addModulo, setAddModulo] = useState('');
  const [addAcao, setAddAcao] = useState<'ADD' | 'REMOVE'>('ADD');
  const [addMotivo, setAddMotivo] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  function recarregar() {
    if (!user) return;
    listarModulosEfetivosDeUser(user.id).then(d => setDados(d));
  }

  useEffect(() => {
    if (open && user) recarregar();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else setDados(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  function handleAdd() {
    if (!addModulo) return;
    startTransition(async () => {
      const r = await adicionarOverride({ usuarioId: user!.id, modulo: addModulo, acao: addAcao, motivo: addMotivo || undefined });
      if (r.success) {
        toast.success('Override salvo');
        setShowAdd(false);
        setAddModulo('');
        setAddMotivo('');
        recarregar();
      } else {
        toast.error('Erro ao salvar override');
      }
    });
  }

  function handleRemoverOverride(id: number) {
    startTransition(async () => {
      await removerOverride(id);
      toast.success('Override removido');
      recarregar();
    });
  }

  function handleReset() {
    startTransition(async () => {
      await resetarUserParaSetor(user!.id);
      toast.success('Overrides removidos — user voltou ao padrão do setor');
      recarregar();
    });
  }

  const getLabel = (permId: string) =>
    MODULOS_REGISTRY.find(m => m.permission === permId)?.label ?? permId;

  return (
    <AnimatePresence>
      {open && user && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-lg bg-[#060c1a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <UserCog size={16} className="text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-white uppercase tracking-tight italic">{user.nome}</h2>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                      Setor: {user.role} · {dados?.setorModulos.length ?? 0} módulos herdados
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
                {!dados ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-slate-500" />
                  </div>
                ) : (
                  <>
                    {/* Módulos efetivos */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Módulos efetivos</span>
                      <div className="space-y-1">
                        {dados.efetivos.length === 0 && (
                          <p className="text-[9px] text-slate-600 font-bold">Nenhum módulo ativo.</p>
                        )}
                        {dados.efetivos.map(perm => {
                          const override = dados.overrides.find(o => o.modulo === perm && o.acao === 'ADD');
                          return (
                            <div key={perm} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                              <Check size={11} className="text-emerald-400 shrink-0" />
                              <span className="text-[9px] font-black text-white flex-1">{getLabel(perm)}</span>
                              {override ? (
                                <span className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                  EXTRA
                                </span>
                              ) : (
                                <span className="text-[7px] font-bold text-slate-600 uppercase">setor</span>
                              )}
                            </div>
                          );
                        })}

                        {/* Módulos removidos por override */}
                        {dados.overrides.filter(o => o.acao === 'REMOVE').map(o => (
                          <div key={o.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/10">
                            <X size={11} className="text-red-400 shrink-0" />
                            <span className="text-[9px] font-black text-red-300 flex-1 line-through">{getLabel(o.modulo)}</span>
                            <span className="text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">
                              REMOVIDO
                            </span>
                            <button onClick={() => handleRemoverOverride(o.id)} className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors cursor-pointer">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Overrides ativos */}
                    {dados.overrides.filter(o => o.acao === 'ADD').length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Overrides ADD</span>
                        {dados.overrides.filter(o => o.acao === 'ADD').map(o => (
                          <div key={o.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <Plus size={11} className="text-blue-400 shrink-0" />
                            <span className="text-[9px] font-black text-blue-300 flex-1">{getLabel(o.modulo)}</span>
                            {o.motivo && <span className="text-[8px] text-slate-600 italic truncate max-w-[100px]">{o.motivo}</span>}
                            <button onClick={() => handleRemoverOverride(o.id)} className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors cursor-pointer">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Adicionar override */}
                    {showAdd ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3 pt-2 border-t border-white/5"
                      >
                        <select
                          value={addModulo}
                          onChange={e => setAddModulo(e.target.value)}
                          className="w-full h-10 rounded-xl bg-black/40 border border-white/10 text-[10px] font-bold text-white px-3 focus:border-indigo-500/50 outline-none"
                        >
                          <option value="">Selecionar módulo...</option>
                          {MODULOS_GERENCIAVEIS.map(m => (
                            <option key={m.id} value={m.permission!}>{m.label}</option>
                          ))}
                        </select>

                        <div className="flex gap-2">
                          {(['ADD', 'REMOVE'] as const).map(a => (
                            <button
                              key={a}
                              onClick={() => setAddAcao(a)}
                              className={`flex-1 h-8 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                                addAcao === a
                                  ? a === 'ADD' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-red-600 border-red-500 text-white'
                                  : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
                              }`}
                            >
                              {a === 'ADD' ? '+ Adicionar' : '− Remover'}
                            </button>
                          ))}
                        </div>

                        <input
                          value={addMotivo}
                          onChange={e => setAddMotivo(e.target.value)}
                          placeholder="Motivo (opcional)"
                          className="w-full h-9 rounded-xl bg-black/40 border border-white/10 text-[10px] font-bold text-white px-3 placeholder:text-slate-700 focus:border-indigo-500/50 outline-none"
                        />

                        <div className="flex gap-2">
                          <button onClick={() => setShowAdd(false)} className="flex-1 h-9 rounded-xl border border-white/10 text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all cursor-pointer">
                            Cancelar
                          </button>
                          <button onClick={handleAdd} disabled={!addModulo || isPending} className="flex-[2] h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5">
                            {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            Confirmar
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setShowAdd(true)}
                        className="w-full h-9 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-slate-500 hover:text-indigo-400 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Plus size={13} />
                        Adicionar override
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-5 py-4 border-t border-white/5">
                <button
                  onClick={handleReset}
                  disabled={isPending || !dados?.overrides.length}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-xl border border-white/10 text-[9px] font-black uppercase text-slate-500 hover:text-white hover:border-white/20 transition-all cursor-pointer disabled:opacity-30"
                >
                  <RotateCcw size={12} />
                  Resetar ao setor
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-black uppercase transition-all cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
