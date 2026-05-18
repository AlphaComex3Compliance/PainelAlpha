"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircle, Trash2, Pencil, UserPlus, Users,
  ShieldCheck, Mail, Fingerprint, LayoutGrid,
  ArrowLeft, Search, Activity, Globe, Zap
} from "lucide-react";
import { toast } from "sonner";
import Form from "next/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getUsers } from "@/actions/get-user";
import { deleteUser, updateUser } from "@/actions/manage-user";
import registerAction from "../actions/CreateAction";
import EditionUser from "./EditionUser";
import DeleteUserDialog from "./DeleteUserDialog";

export default function CadastroUsuarios() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleGetUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsersList(Array.isArray(data) ? data : []);
    } catch (error) {
      setUsersList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { handleGetUsers(); }, []);

  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success(state.message || "Acesso Alpha Criado");
        handleGetUsers();
      } else {
        toast.error(state.message || "Falha no Protocolo");
      }
    }
  }, [state]);

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const result = await deleteUser(userToDelete);
    if (result.success) {
      toast.success("Operador Desconectado");
      handleGetUsers();
    }
    setIsDeleteOpen(false);
    setUserToDelete(null);
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userToEdit) return;
    const formData = new FormData(e.currentTarget);
    const result = await updateUser(userToEdit.id, formData);
    if (result.success) {
      toast.success("Dados Sincronizados");
      setIsEditOpen(false);
      handleGetUsers();
    }
    else toast.error("Erro na Sincronia");
  };

  const filteredUsers = usersList.filter(u =>
    (u.nome || u.usuario || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col relative">

      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-emerald-600/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>

      {/* HEADER DINÂMICO */}
      <nav className="text-alpha italic font-black relative z-10 w-full px-8 py-6 flex items-center justify-between border-b border-white/5 bg-slate-950/20 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="cursor-pointer p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase  italic text-white">
              SISTEMA <span className="text-blue-500">ALPHA</span>
            </h1>
            <div className="flex items-center gap-2 mt-1bg-alpha">
              <Globe size={12} className="text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Status: Online</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 px-8 py-2 rounded-2xl bg-black/20 border border-white/5">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Equipe</span>
            <span className="text-sm font-black text-white italic">{usersList.length}</span>
          </div>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-50 p-6 lg:p-10 h-full max-h-[calc(100vh-100px)]">

        {/* COLUNA ESQUERDA: CADASTRO */}
        <section className="lg:col-span-5 flex flex-col gap-6 h-[calc(95vh-120px)] overflow-y-auto pr-2 custom-scrollbar">

          <div className="flex-1 bg-slate-900/5 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">

            <header className="p-8 border-b  border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 shadow-lg">
                  <UserPlus className="text-blue-400" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                    Provisionar <span className="text-blue-500">Acesso</span>
                  </h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 italic">
                    Protocolo de Segurança Alpha
                  </p>
                </div>
              </div>
            </header>

            <div className="bg-alphaflex-1 p-8 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent">
              <Form action={formAction} autoComplete="off" className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Identificação Nominal</Label>
                  <div className="relative group">
                    <Input name="nome" placeholder="NOME DO OPERADOR" className="h-14 bg-black/40 border-white/5 rounded-2xl pl-12 text-xs font-bold uppercase tracking-widest focus:border-blue-500/50 transition-all" required />
                    <Fingerprint className="absolute left-4 top-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Username</Label>
                    <Input name="usuario" autoComplete="off" placeholder="@user" className="h-14 bg-black/40 border-white/5 rounded-2xl text-xs font-bold uppercase focus:border-blue-500/50" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Master Key</Label>
                    <Input name="senha" autoComplete="new-password" type="password" placeholder="••••••••" className="h-14 bg-black/40 border-white/5 rounded-2xl focus:border-blue-500/50" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Terminal de E-mail</Label>
                  <div className="relative group">
                    <Input name="email" type="email" placeholder="operador@alphasystems.com" className="h-14 bg-black/40 border-white/5 rounded-2xl pl-12 text-xs font-bold focus:border-blue-500/50 transition-all" required />
                    <Mail className="absolute left-4 top-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <Label className="text-[10px] font-black uppercase text-emerald-500 ml-1 tracking-widest flex items-center gap-2">
                    <Zap size={14} className="fill-emerald-500/20" /> Atribuição de Módulos
                  </Label>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {[
                      { id: "cadastro", label: "Painel Cadastro" },
                      { id: "radar", label: "Acessar Radar" },
                      { id: "chamados", label: "Fazer Chamados" },
                      { id: "Reservas", label: "Reservas de Salas" },
                      { id: "Documentos", label: "POP" },
                      { id: "Cliente", label: "Cadastro de Cliente" },
                      { id: "Senhas", label: "Senhas gerais" },
                      { id: "Perse", label: "Radar Fiscal" },
                      { id: "Extratos", label: "Extratos Bancarios" },
                      { id: "ServiçosGerais", label: "Serviços Gerais"},
                      { id: "NovoRadar", label: "Consulta RADAR"},
                      { id: "analise", label: "Sistema de pré análise"},
                      { id: "skills", label: "Alpha Skills"},
                      { id: "schools", label: "Alpha Schools"},
                      { id: "leads", label: "Alpha Leads"},
                      { id: "marketing", label: "Alpha Marketing"},
                      { id: "checkList", label: "Alpha CheckList"},
                      { id: "tarefasComercial", label: " Painel de Tarefas - Comercial"},
                      { id: "gerenciamentoTarefas", label: "Gerenciamento de Tarefas"},
                      { id: "metas", label: "Alpha Metas"},
                      { id: "holerites", label: "Alpha Holerites"},

                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-all group">
                        <Label htmlFor={item.id} className="text-[9px] font-black uppercase text-slate-500 group-hover:text-white cursor-pointer tracking-tighter">{item.label}</Label>
                        <Switch id={item.id} name="permissoes" value={item.id} className="scale-75 data-[state=checked]:bg-blue-600" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-amber-500 ml-1 tracking-widest italic flex items-center gap-2">
                    <ShieldCheck size={14} /> Hierarquia Operacional
                  </Label>
                  <Select name="role" defaultValue="CEO">
                    <SelectTrigger className="h-14 bg-black/40 border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:border-blue-500/50">
                      <SelectValue placeholder="Definir Nível" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-white/10 text-white rounded-xl max-h-[300px]">
                      <SelectItem value="Admin" className="text-[10px] font-black uppercase py-3">Administrador MASTER</SelectItem>
                      <SelectItem value="CEO" className="text-[10px] font-black uppercase py-3">CEO </SelectItem>
                      <SelectItem value="OPERACIONAL" className="text-[10px] font-black uppercase py-3">OPERACIONAL</SelectItem>
                      <SelectItem value="COMERCIAL" className="text-[10px] font-black uppercase py-3">COMERCIAL</SelectItem>
                      <SelectItem value="RECURSOS HUMANOS" className="text-[10px] font-black uppercase py-3">RECURSOS HUMANOS</SelectItem>
                      <SelectItem value="FINANCEIRO" className="text-[10px] font-black uppercase py-3">FINANCEIRO</SelectItem>
                      <SelectItem value="JURÍDICO" className="text-[10px] font-black uppercase py-3">JURÍDICO</SelectItem>
                      <SelectItem value="PARCEIRO" className="text-[10px] font-black uppercase py-3">PARCEIRO</SelectItem>
                      <SelectItem value="SERVIÇOS GERAIS" className="text-[10px] font-black uppercase py-3">SERVIÇOS GERAIS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={isPending} className="cursor-pointer w-full h-16 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-[1.5rem] shadow-2xl shadow-blue-900/30 transition-all active:scale-95 group ">
                  {isPending ? <LoaderCircle className="animate-spin" /> : "Gerar Acesso"}
                </Button>
              </Form>
            </div>
          </div>
        </section>

        {/* COLUNA DIREITA: LISTAGEM */}
        <section className="lg:col-span-5 flex flex-col gap-6 h-[calc(95vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex-1 bg-slate-900/5 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
            <header className="p-8 border-b border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/20">
                  <Users className="text-blue-400" size={24} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Equipe <span className="text-blue-500">Alpha</span></h2>
              </div>

              <div className="relative w-full md:w-64 group">
                <Input
                  placeholder="BUSCAR OPERADOR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 bg-black/40 border-white/10 rounded-xl pl-10 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-700 focus:border-blue-500/50"
                />
                <Search className="absolute left-3 top-3 text-slate-700 group-focus-within:text-blue-500" size={16} />
              </div>
            </header>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-3 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-10">
                  <Activity className="animate-pulse text-blue-500" size={48} />
                  <span className="text-xs font-black uppercase tracking-[0.5em]">Sincronia Ativa</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="group relative flex flex-col gap-4 p-5 rounded-[2rem] border border-white/5 bg-black/40 hover:bg-slate-900/60 hover:border-blue-500/30 transition-all duration-500 overflow-hidden">
                      <div className="flex items-center gap-4">
                        <div className="shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-800 to-black border border-white/10 flex items-center justify-center text-blue-400 font-black text-xs group-hover:rotate-12 transition-transform duration-500 shadow-xl overflow-hidden">

                          {user.imagemUrl ? (
                            <img
                              src={user.imagemUrl}
                              alt={user.nome}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            user.nome ? user.nome.substring(0, 2).toUpperCase() : "U"
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-black text-white uppercase truncate tracking-widest italic">{user.nome || user.usuario}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${user.role === 'Admin' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                              {user.role || 'USER'}
                            </span>
                            <span className="text-[8px] font-bold text-slate-600 uppercase">ID: {user.id.toString().slice(-4)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                        <div className="flex-1 truncate">
                          <p className="text-[9px] text-slate-500 font-bold truncate lowercase opacity-70 group-hover:opacity-100 transition-opacity">{user.email}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => { setUserToEdit(user); setIsEditOpen(true); }} className="cursor-pointer p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-blue-400 hover:border-blue-500/50 transition-all active:scale-90">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => { setUserToDelete(user.id); setIsDeleteOpen(true); }} className="cursor-pointer p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-red-500 hover:border-red-500/50 transition-all active:scale-90">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <EditionUser open={isEditOpen} onOpenChange={setIsEditOpen} user={userToEdit} onSubmit={handleUpdateSubmit} />
      <DeleteUserDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={confirmDelete} />
    </main>
  );
}
