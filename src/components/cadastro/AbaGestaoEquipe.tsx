'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, Pencil, Trash2, Building2, UserCog, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { getUsers } from '@/actions/get-user';
import { deleteUser, updateUser } from '@/actions/manage-user';
import EditionUser from '@/components/EditionUser';
import DeleteUserDialog from '@/components/DeleteUserDialog';
import ModalGerenciarSetor from './ModalGerenciarSetor';
import ModalOverrideUser from './ModalOverrideUser';

interface UserItem {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  role: string;
  imagemUrl?: string | null;
  status?: string;
}

export default function AbaGestaoEquipe() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [setorFiltro, setSetorFiltro] = useState('');

  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [setorModalOpen, setSetorModalOpen] = useState(false);
  const [overrideUser, setOverrideUser] = useState<UserItem | null>(null);
  const [overrideOpen, setOverrideOpen] = useState(false);

  async function load() {
    setLoading(true);
    const data = await getUsers();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editUser) return;
    const fd = new FormData(e.currentTarget);
    const r = await updateUser(String(editUser.id), fd);
    if (r.success) { toast.success('Dados atualizados'); setEditOpen(false); load(); }
    else toast.error('Erro ao atualizar');
  }

  async function handleDelete() {
    if (!deleteId) return;
    const r = await deleteUser(deleteId);
    if (r.success) { toast.success('Usuário removido'); load(); }
    setDeleteOpen(false);
    setDeleteId(null);
  }

  const setores = [...new Set(users.map(u => u.role))].sort();
  const totalUsers: Record<string, number> = {};
  for (const u of users) totalUsers[u.role] = (totalUsers[u.role] ?? 0) + 1;

  const filtered = users.filter(u => {
    const matchSearch = (u.nome || u.usuario || '').toLowerCase().includes(search.toLowerCase());
    const matchSetor = !setorFiltro || u.role === setorFiltro;
    return matchSearch && matchSetor;
  });

  const initials = (nome: string) => nome?.substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar colaborador..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-black/40 border border-white/10 text-[11px] font-bold text-white placeholder:text-slate-700 focus:border-indigo-500/40 outline-none"
            />
          </div>

          {/* Setor filter */}
          <select
            value={setorFiltro}
            onChange={e => setSetorFiltro(e.target.value)}
            className="h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-[11px] font-bold text-white focus:border-indigo-500/40 outline-none"
          >
            <option value="">Todos os setores</option>
            {setores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Gerenciar setor */}
        <button
          onClick={() => setSetorModalOpen(true)}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shrink-0"
        >
          <Building2 size={14} />
          Gerenciar Setores
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
        <span>{users.length} colaboradores</span>
        <span>·</span>
        <span>{filtered.length} exibidos</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-20">
          <Activity className="animate-pulse text-indigo-500" size={40} />
          <span className="text-xs font-black uppercase tracking-widest">Carregando equipe...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-600 text-xs font-black uppercase tracking-widest">
          Nenhum colaborador encontrado
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="group relative flex flex-col gap-4 p-5 rounded-2xl border border-white/5 bg-black/40 hover:bg-slate-900/60 hover:border-indigo-500/20 transition-all duration-300 overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0 h-11 w-11 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                  {user.imagemUrl ? (
                    <Image src={user.imagemUrl} alt={user.nome} width={44} height={44} unoptimized className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-indigo-400 font-black text-xs">{initials(user.nome)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-white uppercase truncate italic">{user.nome || user.usuario}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase border bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                      {user.role}
                    </span>
                    {user.status && user.status !== 'ATIVO' && (
                      <span className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase border bg-red-500/10 border-red-500/20 text-red-400">
                        {user.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-[9px] text-slate-600 truncate lowercase">{user.email}</p>

              <div className="flex gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => { setOverrideUser(user); setOverrideOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl bg-white/5 border border-white/5 text-[8px] font-black uppercase text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
                >
                  <UserCog size={11} />
                  Permissões
                </button>
                <button
                  onClick={() => { setEditUser(user); setEditOpen(true); }}
                  className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-blue-400 hover:border-blue-500/30 transition-all cursor-pointer"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => { setDeleteId(String(user.id)); setDeleteOpen(true); }}
                  className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ModalGerenciarSetor open={setorModalOpen} onClose={() => setSetorModalOpen(false)} totalUsers={totalUsers} />
      <ModalOverrideUser
        user={overrideUser ? { id: overrideUser.id, nome: overrideUser.nome, role: overrideUser.role } : null}
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
      />
      <EditionUser open={editOpen} onOpenChange={setEditOpen} user={editUser} onSubmit={handleEditSubmit} />
      <DeleteUserDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={handleDelete} />
    </div>
  );
}
