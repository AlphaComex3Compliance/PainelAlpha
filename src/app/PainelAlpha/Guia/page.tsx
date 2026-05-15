"use client"

  ;

import { BotaoVoltar } from "@/components/BotaoVoltar";
import { BookOpen, Palette, LayoutGrid, Bell, Shield, Zap, ArrowRight, MousePointer2 } from "lucide-react";
import { getTema } from "@/lib/temas";
import { useSession } from "next-auth/react";

export default function GuiaSistema() {
  const { data: session } = useSession();
  const style = getTema((session?.user as any)?.tema_interface);

  const secoes = [
    {
      titulo: "Customização Visual",
      desc: "Ajuste o ecossistema Alpha ao seu estilo operacional.",
      icon: Palette,
      cor: "text-blue-500",
      dicas: [
        "Acesse o peefil no canto superior > Interface Alpha.",
        "Escolha entre 12 esquemas de cores sincronizados.",
        "Modo Compacto: Ideal para monitores menores ou visão operacional ampla."
      ]
    },
    {
      titulo: "Gestão de Atalhos",
      desc: "Priorize as ferramentas que você mais utiliza.",
      icon: LayoutGrid,
      cor: "text-emerald-500",
      dicas: [
        "Clique em 'Fixar Atalhos' no cabeçalho.",
        "Arraste e solte os módulos para definir a ordem de importância.",
        "Marque a Estrela para fixar o módulo no topo (Seção Âmbar)."
      ]
    },
    {
      titulo: "Radar de Notificações",
      desc: "Comunicação em tempo real sem precisar atualizar.",
      icon: Bell,
      cor: "text-amber-500",
      dicas: [
        "Alertas sonoros e visuais aparecem instantaneamente para novas mensagens.",
        "O sistema verifica o banco a cada 1s no modo de alta prioridade.",
        "Clique na notificação para saltar diretamente para a sala do chamado."
      ]
    },
    {
      titulo: "Segurança e Acesso",
      desc: "Níveis de permissão e integridade de dados.",
      icon: Shield,
      cor: "text-purple-500",
      dicas: [
        "Módulos bloqueados podem ser ocultados para limpar sua interface.",
        "O sistema Alpha usa criptografia de sessão via JWT.",
        "Sua foto de perfil é sincronizada globalmente via Vercel Blob."
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 p-6 lg:p-12 relative overflow-hidden">
      <div className={`absolute top-[-20%] right-[-10%] w-[600px] h-[600px] ${style.glow} blur-[120px] rounded-full opacity-20`} />

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-12">
          <BotaoVoltar />
          <div className="mt-8 flex items-center gap-6">
            <div className={`p-5 rounded-3xl ${style.bg} shadow-2xl`}>
              <BookOpen size={42} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter text-white">
                Guia <span className={style.text}>Alpha</span>
              </h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Manual de Indução ao Protocolo Operacional</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {secoes.map((s, i) => (
            <div key={i} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] hover:border-white/10 transition-all group">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl bg-white/5 ${s.cor}`}>
                  <s.icon size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase italic">{s.titulo}</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{s.desc}</p>
                </div>
              </div>

              <ul className="space-y-4">
                {s.dicas.map((dica, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                    <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${style.bg}`} />
                    {dica}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="mt-12 bg-gradient-to-br from-slate-900 to-black border border-white/5 p-10 rounded-[3rem] relative overflow-hidden">
          <div className="absolute right-0 top-0 p-10 opacity-5">
            <Zap size={200} />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-2xl font-black text-white uppercase italic mb-4">Novidades da Versão 4.0</h3>
            <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase mb-8">
              Implementamos o motor de temas reativo e o radar de broadcast. Agora o TI pode enviar avisos globais
              que aparecem no topo da sua tela em tempo real para avisos de manutenção.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-300">
                #RealTimePolling
              </div>
              <div className={`px-4 py-2 rounded-full ${style.bg} text-[9px] font-black uppercase tracking-widest text-white`}>
                #AlphaThemeEngine
              </div>
              <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-300">
                #VercelBlobReady
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-12 text-center">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Painel Alpha © 2026 - Sistema Blindado</p>
        </footer>
      </div>
    </main>
  );
}