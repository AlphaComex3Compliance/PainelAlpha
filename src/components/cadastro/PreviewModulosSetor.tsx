'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listarPermissoesPorSetor } from '@/actions/PermissoesSetor';
import { MODULOS_REGISTRY } from '@/lib/modulos-registry';
import { Layers, ShieldCheck } from 'lucide-react';

interface PreviewModulosSetorProps {
  setor: string;
}

export default function PreviewModulosSetor({ setor }: PreviewModulosSetorProps) {
  const [modulos, setModulos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!setor) { setModulos([]); return; }
    setLoading(true);
    listarPermissoesPorSetor(setor).then(m => {
      setModulos(m);
      setLoading(false);
    });
  }, [setor]);

  if (!setor) return null;

  const labels = modulos
    .map(id => MODULOS_REGISTRY.find(m => m.permission === id)?.label ?? id)
    .sort();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={setor}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl border border-white/5 bg-indigo-900/5 p-4 space-y-3"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={13} className="text-indigo-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">
            Módulos herdados de {setor}
          </span>
        </div>

        {loading ? (
          <div className="text-[9px] text-slate-600 uppercase font-bold tracking-widest animate-pulse">
            Carregando...
          </div>
        ) : labels.length === 0 ? (
          <div className="flex items-center gap-2 text-[9px] text-slate-600 uppercase font-bold tracking-wide">
            <Layers size={12} />
            Nenhum módulo atribuído a este setor. Configure em &quot;Gestão de Equipe&quot;.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {labels.map(label => (
              <span
                key={label}
                className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black uppercase tracking-wider text-indigo-300"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <p className="text-[8px] text-slate-600 font-bold leading-relaxed">
          Após criar, você pode adicionar ou remover módulos individualmente em &quot;Gestão de Equipe&quot;.
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
