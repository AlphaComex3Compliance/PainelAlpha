import { create } from 'zustand';

export interface ChamadoNotificacao {
  id: string;
  chamadoId: number;
  titulo: string;
  usuario: string;
  setor: string;
  urgencia: string;
  createdAt: string;
  lida: boolean;
}

interface ChamadoNotificacoesStore {
  notificacoes: ChamadoNotificacao[];
  adicionarNotificacao: (n: Omit<ChamadoNotificacao, 'id' | 'lida'>) => void;
  marcarTodasLidas: () => void;
  removerNotificacao: (id: string) => void;
}

export const useChamadoNotificacoes = create<ChamadoNotificacoesStore>((set) => ({
  notificacoes: [],
  adicionarNotificacao: (n) =>
    set((state) => ({
      notificacoes: [
        { ...n, id: `${Date.now()}-${n.chamadoId}`, lida: false },
        ...state.notificacoes,
      ].slice(0, 50),
    })),
  marcarTodasLidas: () =>
    set((state) => ({
      notificacoes: state.notificacoes.map((n) => ({ ...n, lida: true })),
    })),
  removerNotificacao: (id) =>
    set((state) => ({
      notificacoes: state.notificacoes.filter((n) => n.id !== id),
    })),
}));
