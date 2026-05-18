"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  KeyRound,
  Briefcase,
  Layers,
  Check
} from "lucide-react";

type EditionUserProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const MODULOS_SISTEMA = [
  { id: "cadastro", label: "Administração", desc: "Contas e níveis" },
  { id: "radar", label: "Coletor RADAR", desc: "Consultas" },
  { id: "chamados", label: "Chamados", desc: "Suporte TI" },
  { id: "Reservas", label: "Reservas", desc: "Salas de reunião" },
  { id: "Documentos", label: "POP", desc: "Manuais e guias" },
  { id: "UpDocumentos", label: "UpDocumentos", desc: "Uploads de Arquivos" },
  { id: "Historico", label: "Gerenciamento", desc: "Gerenciamento do POP" },
  { id: "Cliente", label: "Cs & Nps", desc: "Cadastro de Cliente" },
  { id: "Senhas", label: "Gerenciamento de Senhas", desc: "Gerencie Cadastros e Senhas de sistemas" },
  { id: "Perse", label: "Analise Fiscal", desc: "Sistema de pesquisa cnpj" },
  { id: "Extratos", label: "Extratos Bancarios", desc: "Sistema de Extratos Bancarios" },
  { id: "ServiçosGerais", label:"Serviços Gerais", desc: "Painel de conferencia de tarefas" },
  { id: "NovoRadar", label: "Consulta RADAR", desc: "Novo painel de consulta RADAR"},
  { id: "analise", label: "Sistema de pré análise", desc: "Sistema de pré análise e gerador ficha"},
  { id: "skills", label: "Alpha Skills", desc: "Alpha Skills"},
  { id: "schools", label: "Alpha Schools", desc: "Alpha Schools"},
  { id: "leads", label: "Alpha Leads", desc: "Alpha Leads"},
  { id: "marketing", label: "Alpha Marketing", desc: "Alpha Marketing"},
  { id: "checkList", label: "Alpha CheckList", desc: "Alpha CheckList"},
  { id: "tarefasComercial", label: "Checklist de Tarefas", desc: " Painel de Tarefas - Comercial"},
  { id: "gerenciamentoTarefas", label: "Gerenciamento de Tarefas", desc: "Gerenciamento de Tarefas"},
  { id: "metas", label: "Painel de Metas", desc: "Metas"},
  { id: "holerites", label: "Painel de geranciamento de Holerites", desc: "Holerites"}

];

const SETORES_LISTA = [
  { value: "Admin", label: "TI.ADMINISTRADOR", color: "text-blue-400" },
  { value: "CEO", label: "CEO", color: "text-blue-400" },
  { value: "OPERACIONAL", label: "OPERACIONAL", color: "text-slate-300" },
  { value: "COMERCIAL", label: "COMERCIAL", color: "text-slate-300" },
  { value: "RECURSOS HUMANOS", label: "RECURSOS HUMANOS", color: "text-slate-300" },
  { value: "FINANCEIRO", label: "FINANCEIRO", color: "text-slate-300" },
  { value: "JURÍDICO", label: "JURÍDICO", color: "text-slate-300" },
  { value: "PARCEIRO", label: "PARCEIRO", color: "text-slate-300" },
  { value: "Serviços Gerais", label:"Serviços Gerais", color: "text-slate-300"}
];

export default function EditionUser({ open, onOpenChange, user, onSubmit }: EditionUserProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-slate-950 text-white border-white/5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto custom-scrollbar">

        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/20 shadow-inner">
              <User className="text-blue-500 w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Editar Colaborador</DialogTitle>
              <DialogDescription className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                ID: {String(user?.id).substring(0, 8)}... • {user?.usuario}

              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {user && (
          <form onSubmit={onSubmit} className="space-y-8 py-4">

            {/* GRUPO 1: IDENTIFICAÇÃO */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Username</Label>
                <div className="relative">
                  <Input name="usuario" defaultValue={user.usuario} className="pl-10 bg-slate-900/50 border-white/5 h-11 focus:ring-2 focus:ring-blue-600/50 rounded-xl" />
                  <KeyRound className="absolute left-3 top-3 text-slate-600" size={18} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">E-mail</Label>
                <div className="relative">
                  <Input name="email" defaultValue={user.email} className="pl-10 bg-slate-900/50 border-white/5 h-11 focus:ring-2 focus:ring-blue-600/50 rounded-xl" />
                  <Mail className="absolute left-3 top-3 text-slate-600" size={18} />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Nome Completo</Label>
              <div className="relative">
                <Input name="nome" defaultValue={user.nome} className="pl-10 bg-slate-900/50 border-white/5 h-11 focus:ring-2 focus:ring-blue-600/50 rounded-xl" />
                <User className="absolute left-3 top-3 text-slate-600" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">E-mail</Label>
                <div className="relative">
                  <Input name="email" defaultValue={user.email} className="pl-10 bg-slate-900/50 border-white/5 h-11 focus:ring-2 focus:ring-blue-600/50 rounded-xl" />
                  <Mail className="absolute left-3 top-3 text-slate-600" size={18} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Setor / Cargo</Label>
                <Select name="role" defaultValue={user.role || "User"}>
                  <SelectTrigger className="bg-slate-900/50 border-white/5 h-11 rounded-xl focus:ring-2 focus:ring-blue-600/50">
                    <SelectValue placeholder="Definir Setor" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-white/10 text-white">
                    {SETORES_LISTA.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="focus:bg-blue-600 focus:text-white transition-colors py-2.5">
                        <span className="text-[10px] font-bold tracking-widest uppercase">{s.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* GRUPO 2: ACESSOS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={14} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Permissões de Acesso</span>
              </div>

              <div className="grid grid-cols-1 gap-2 p-1 bg-white/[0.02] rounded-2xl border border-white/5">
                {MODULOS_SISTEMA.map((modulo) => (
                  <label key={modulo.id} className="group relative flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-all border border-transparent hover:border-white/5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-tight text-slate-200">{modulo.label}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">{modulo.desc}</span>
                    </div>

                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        name="permissoes"
                        value={modulo.id}
                        defaultChecked={user.permissoes?.includes(modulo.id)}
                        className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border border-white/10 bg-slate-900 checked:bg-blue-600 checked:border-blue-500 transition-all"
                      />
                      <Check className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-1 top-1 transition-opacity" strokeWidth={4} />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* GRUPO 3: SEGURANÇA */}
            <div className="pt-2 border-t border-white/5 space-y-4">
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Nova Senha (Opcional)</Label>
                <div className="relative">
                  <Input name="senha" type="password" placeholder="••••••••••••" className="pl-10 bg-slate-900/50 border-white/5 h-11 focus:ring-2 focus:ring-blue-600/50 rounded-xl" />
                  <Lock className="absolute left-3 top-3 text-slate-600" size={18} />
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="cursor-pointer flex-1 h-12 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10">
                Descartar
              </Button>
              <Button type="submit" className="cursor-pointer flex-[2] h-12 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-blue-900/40 transition-all active:scale-95">
                Atualizar Perfil
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
