"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap, Star, Save, Eye, EyeOff, GripVertical, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { salvarPreferenciasAction } from "@/actions/preferencias";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BotaoVoltar } from "@/components/BotaoVoltar";

const MODULOS_BASE = [
  { id: "radar", title: "Radar", img: "/bar-chart_1573395.png", tag: "Logística" },
  { id: "chamados", title: "Chamados", img: "/discussion_655664.png", tag: "Suporte" },
  { id: "cadastro", title: "Gestão", img: "/people_10893485.png", tag: "Admin" },
  { id: "Reservas", title: "Salas", img: "/icons8-sala-de-reuniões-64.png", tag: "Facilities" },
  { id: "Documentos", title: "POP", img: "/arquivo.png", tag: "Processos" },
  { id: "UpDocumentos", title: "Upload", img: "/pasta.png", tag: "Arquivos" },
  { id: "Historico", title: "Gerenciamento do POP", img: "/historico.png", tag: "Auditoria" },
  { id: "Cliente", title: "SISTEMA CS & NPS", img: "/local-na-rede-internet.png", tag: "Comercial" },
  { id: "Senhas", title: "Gerenciamento de Acessos", img: "/senha.png", tag: "Administração" },
  { id: "Perse", title: "Alpha Connect", img: "/planejamento-tributario.png", tag: "Connect" },
  { id: "Extratos", title: "Sistema de Extratos Bancarios", img: "/taxa.png", tag: "Financeiro" },
  { id: "ServiçosGerais", title: "Serviços Gerais", img: "/cleaning.png", tag: "Serviços Gerais" },
  { id: "NovoRadar", title: "Consulta RADAR", img: "/cargueiro.png", tag: "RADAR" },
  { id: "analise", title: "Sistema Pre Analise", img: "/document.png", tag: "Gerador de ficha de reunião" },
  { id: "skills", title: "Alpha Skills", img: "/elearning.png", tag: "Alpha Skills" },
  { id: "schools", title: "Alpha Schools", img: "/textbook.png", tag: "Alpha Schools" },
  { id: "leads", title: "Alpha Leads", img: "/security.png", tag: "Alpha Leads" },
  { id: "marketing", title: "Alpha Marketing", img: "/marketing.png", tag: "Alpha Marketing" },
  { id: "checkList", title: "Alpha CheckList", img: "/test.png", tag: "Alpha CheckList" },
  { id: "tarefasComercial", title: "Painel de Tarefas - Comercial", img: "/planning.png", tag: "Comercial" },
  { id: "gerenciamentoTarefas", title: "Gerenciamento de Tarefas", img: "/task-management.png", tag: "Comercial" },
  { id: "crm", title: "Alpha CRM", img: "/management.png", tag: "CRM" },
  { id: "metas", title: "Alpha Metas", img: "/revenue.png", tag: "Metas" },
];

export default function AtalhosPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = useMemo(() => session?.user?.role === "Admin", [session]);

  const userPermissions = useMemo(() => {
    const p = (session?.user as any)?.permissoes;
    if (Array.isArray(p)) return p.map((i: any) => String(i).toLowerCase());
    if (typeof p === "string" && p.length > 0) {
      return p.split(",").map((i: string) => i.trim().toLowerCase());
    }
    return [];
  }, [session]);

  const initialOrder = useMemo(() => {
    const userObj = session?.user as any;
    const atalhosRaw = userObj?.atalhos as string || "";
    const savedIds = atalhosRaw ? atalhosRaw.split(",") : [];

    return [...MODULOS_BASE].sort((a, b) => {
      const idxA = savedIds.indexOf(a.id);
      const idxB = savedIds.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;

      const temA = isAdmin || userPermissions.includes(a.id.toLowerCase());
      const temB = isAdmin || userPermissions.includes(b.id.toLowerCase());
      if (temA !== temB) return temA ? -1 : 1;
      return 0;
    });
  }, [session, userPermissions, isAdmin]);

  const [items, setItems] = useState(MODULOS_BASE);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [esconderBloqueados, setEsconderBloqueados] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user && mounted) {
      const userObj = session.user as any;
      const atalhosSalvos = userObj.atalhos as string || "";
      const idsNoBanco = atalhosSalvos ? atalhosSalvos.split(",") : [];

      setSelecionados(idsNoBanco);
      setEsconderBloqueados(!!userObj.esconderBloqueados);
      setItems(initialOrder);
    }
  }, [session, mounted, initialOrder]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  const handleSalvar = async () => {
    setLoading(true);
    const apenasOsFavoritos = items
      .filter((i: any) => selecionados.includes(i.id))
      .map((i: any) => i.id);

    try {
      const res = await salvarPreferenciasAction(apenasOsFavoritos, esconderBloqueados);

      if (res.success) {
        toast.success("Protocolo Alpha Sincronizado!");
        await update({
          ...session,
          user: {
            ...session?.user,
            atalhos: apenasOsFavoritos.join(

              ","),
            esconderBloqueados: esconderBloqueados
          }
        });
        router.refresh();
        setTimeout(() => router.push("/PainelAlpha"), 500);
      }
    } catch (error) {
      toast.error("Erro na transmissão");
    } finally {
      setLoading(false);
    }
  };

  const toggleBloqueados = () => {
    const novosEsconder = !esconderBloqueados;
    setEsconderBloqueados(novosEsconder);

    const idsBloqueados = items
      .filter((m: any) => !(isAdmin || userPermissions.includes(m.id.toLowerCase())))
      .map((m: any) => m.id);

    if (novosEsconder) {
      setSelecionados(prev => prev.filter(id => !idsBloqueados.includes(id)));
    } else {
      setSelecionados(prev => Array.from(new Set([...prev, ...idsBloqueados])));
    }
  };



  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Sincronizando Protocolos Alpha...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] p-8 lg:p-16 text-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4">
              <Zap className="text-amber-500" size={40} /> Central de Atalhos
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 italic">ORDENAÇÃO LIVRE • PROTOCOLO DE ACESSOS</p>
          </div>
          <div className="flex items-center gap-4">

            <BotaoVoltar />
            <button
              onClick={handleSalvar}
              disabled={loading}
              className={`h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl transition-all active:scale-95 ${loading ? "bg-slate-800 cursor-wait opacity-70" : "bg-blue-600 hover:bg-blue-500 cursor-pointer"}`}
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {loading ? "Sincronizando..." : "Sincronizar Painel"}
            </button>
          </div>
        </header>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((m) => {
                const temAcesso = isAdmin || userPermissions.includes(m.id.toLowerCase());
                return (
                  <SortableGridItem
                    key={m.id}
                    m={m}
                    temAcesso={temAcesso}
                    isSelected={selecionados.includes(m.id)}
                    onToggle={() => setSelecionados((prev) => prev.includes(m.id) ? prev.filter((i) => i !== m.id) : [...prev, m.id])}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </main>
  );
}

function SortableGridItem({ m, temAcesso, isSelected, onToggle }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id });
  const style = { transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 50 : 0 };

  return (
    <div ref={setNodeRef} style={style} className={`group relative h-52 rounded-[2.5rem] border transition-all duration-300 p-8 flex flex-col justify-between overflow-hidden backdrop-blur-xl ${isDragging ? "opacity-30 scale-95" : isSelected ? "bg-amber-600/10 border-amber-500/40 shadow-lg" : "bg-slate-900/40 border-white/5 hover:border-white/20"}`}>
      <div {...attributes} {...listeners} className="absolute top-6 right-6 cursor-grab active:cursor-grabbing p-2 text-slate-700 hover:text-white transition-colors z-20">
        <GripVertical size={18} />
      </div>
      <div className="flex items-center gap-5">
        <div className={`p-3 rounded-2xl border ${temAcesso ? "bg-white/5 border-white/10" : "bg-red-500/5 border-red-500/20"}`}>
          <img src={m.img} alt="" className={`w-10 h-10 object-contain ${!temAcesso && "grayscale opacity-30"}`} />
        </div>
        <div className="flex flex-col">
          <h3 className={`text-base font-black uppercase italic tracking-tighter ${isSelected ? "text-amber-500" : "text-white"}`}>{m.title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            {temAcesso ? <span className="text-[8px] font-black uppercase text-emerald-500 italic flex items-center gap-1"><ShieldCheck size={10} /> Disponível</span> : <span className="text-[8px] font-black uppercase text-red-500 italic flex items-center gap-1"><AlertTriangle size={10} /> Restrito</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em]">{m.tag}</span>
        <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all ${isSelected ? "bg-amber-500 border-amber-500 text-black" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}>
          {isSelected ? <CheckCircle2 size={12} /> : <Star size={12} />} {isSelected ? "Fixado" : "Fixar"}
        </button>
      </div>
    </div>
  );
}
