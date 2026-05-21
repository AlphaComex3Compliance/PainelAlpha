'use client';

import { motion } from 'framer-motion';
import { UserPlus, Users } from 'lucide-react';

export type AbaAtiva = 'cadastro' | 'equipe';

interface TogglePillCadastroProps {
  value: AbaAtiva;
  onChange: (v: AbaAtiva) => void;
}

const ABAS: { id: AbaAtiva; label: string; Icon: typeof UserPlus }[] = [
  { id: 'cadastro', label: 'Cadastrar Novo', Icon: UserPlus },
  { id: 'equipe', label: 'Gestão de Equipe', Icon: Users },
];

export default function TogglePillCadastro({ value, onChange }: TogglePillCadastroProps) {
  return (
    <div className="relative inline-flex bg-black/50 border border-white/10 rounded-full p-1 gap-1">
      {ABAS.map(({ id, label, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-200 ${
              active ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {active && (
              <motion.div
                layoutId="pill-active"
                className="absolute inset-0 bg-indigo-600 rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Icon size={13} className="shrink-0" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
