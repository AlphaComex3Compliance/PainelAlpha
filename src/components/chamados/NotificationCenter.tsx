'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { useChamadoNotificacoes } from '@/store/useChamadoNotificacoes';
import NotificationCard from './NotificationCard';

export default function NotificationCenter() {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { notificacoes, marcarTodasLidas, removerNotificacao } = useChamadoNotificacoes();
  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  function handleAbrir() {
    setAberto((v) => !v);
    if (!aberto && naoLidas > 0) {
      setTimeout(marcarTodasLidas, 1200);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleAbrir}
        className="relative p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        title="Notificações de chamados"
      >
        <Bell size={16} />
        <AnimatePresence>
          {naoLidas > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center"
            >
              {naoLidas > 9 ? '9+' : naoLidas}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl border border-white/10 bg-[#060c1a] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell size={13} className="text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Chamados
                </span>
                {naoLidas > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[8px] font-black text-rose-400">
                    {naoLidas}
                  </span>
                )}
              </div>
              {notificacoes.length > 0 && (
                <button
                  onClick={marcarTodasLidas}
                  className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-slate-600 hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <CheckCheck size={10} />
                  Lidas
                </button>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto custom-scrollbar p-3 space-y-2">
              {notificacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-600">
                  <Inbox size={22} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Nenhuma notificação</span>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notificacoes.map((n) => (
                    <NotificationCard
                      key={n.id}
                      notificacao={n}
                      onRemover={removerNotificacao}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
