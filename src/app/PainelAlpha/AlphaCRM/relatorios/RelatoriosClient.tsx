"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { TemaAlpha } from "@/lib/temas";

const ETAPAS_ORD = ["PROSPECCAO","QUALIFICACAO","REUNIAO","PROPOSTA","NEGOCIACAO","FECHADO_GANHO","FECHADO_PERDIDO"];
const ETAPAS_LABEL: Record<string,string> = {
  PROSPECCAO:"Prospecção", QUALIFICACAO:"Qualificação", REUNIAO:"Reunião",
  PROPOSTA:"Proposta", NEGOCIACAO:"Negociação", FECHADO_GANHO:"Ganho", FECHADO_PERDIDO:"Perdido",
};

function fmtBRL(v: number) {
  return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(v);
}

function Card({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5" style={{ borderColor: `rgba(${accent},0.1)` }}>
      <h3 className="text-sm font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

const TOOLTIP_STYLE = {
  backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12, color: "#f1f5f9", fontSize: 12,
};

function RelKPI({ label, value, sub, color, accent }: { label: string; value: string | number; sub?: string; color?: string; accent: string }) {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5" style={{ borderColor: `rgba(${accent},0.1)` }}>
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-black" style={{ color: color || "white" }}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function RelatoriosClient({ oportunidades, atividades, visual }: { oportunidades: any[]; atividades: any[]; visual: TemaAlpha }) {
  const accent = visual.accent;

  const [periodo, setPeriodo] = useState<"7" | "30" | "90" | "all">("30");

  const opsAtivas = oportunidades.filter(o => !["FECHADO_GANHO","FECHADO_PERDIDO"].includes(o.etapa));
  const opsGanhas = oportunidades.filter(o => o.etapa === "FECHADO_GANHO");
  const opsPerdidas = oportunidades.filter(o => o.etapa === "FECHADO_PERDIDO");

  // Funil
  const funnelData = ETAPAS_ORD.filter(e => !["FECHADO_GANHO","FECHADO_PERDIDO"].includes(e)).map(e => ({
    name: ETAPAS_LABEL[e],
    count: oportunidades.filter(o => o.etapa === e).length,
    valor: oportunidades.filter(o => o.etapa === e).reduce((s,o) => s + (o.valor||0),0),
  }));

  // Pizza: ganhos x perdidos x ativos
  const pieData = [
    { name: "Ativos", value: opsAtivas.length, color: `rgb(${accent})` },
    { name: "Ganhos", value: opsGanhas.length, color: "rgb(52,211,153)" },
    { name: "Perdidos", value: opsPerdidas.length, color: "rgb(248,113,113)" },
  ].filter(d => d.value > 0);

  // Por responsável
  const porResponsavel = useMemo(() => {
    const map: Record<string, { nome: string; total: number; valor: number; ganhos: number }> = {};
    oportunidades.forEach(o => {
      const nome = o.responsavel?.nome || "Desconhecido";
      if (!map[nome]) map[nome] = { nome, total: 0, valor: 0, ganhos: 0 };
      map[nome].total++;
      map[nome].valor += o.valor || 0;
      if (o.etapa === "FECHADO_GANHO") map[nome].ganhos++;
    });
    return Object.values(map).sort((a,b) => b.total - a.total);
  }, [oportunidades]);

  // Atividades por tipo
  const porTipo = useMemo(() => {
    const map: Record<string, number> = {};
    atividades.forEach(a => { map[a.tipo] = (map[a.tipo]||0) + 1; });
    return Object.entries(map).map(([tipo, count]) => ({ tipo, count }));
  }, [atividades]);

  const TIPO_LABEL: Record<string,string> = { LIGACAO:"Ligações", EMAIL:"E-mails", REUNIAO:"Reuniões", TAREFA:"Tarefas", NOTA:"Notas" };

  const taxaConversao = oportunidades.length > 0 ? Math.round((opsGanhas.length / oportunidades.length) * 100) : 0;
  const ticketMedio = opsGanhas.length > 0
    ? opsGanhas.reduce((s,o) => s + (o.valor||0), 0) / opsGanhas.length
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-white">Relatórios</h1>
        <div className="flex gap-1 bg-slate-900 border border-white/5 rounded-xl p-1">
          {([["7","7d"],["30","30d"],["90","90d"],["all","Tudo"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => setPeriodo(v)}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
              style={periodo === v
                ? { background: `rgba(${accent},0.2)`, color: `rgb(${accent})` }
                : { color: "#64748b" }}
            >{l}</button>
          ))}
        </div>
      </div>

      {/* KPIs resumo */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <RelKPI accent={accent} label="Total de Oportunidades" value={oportunidades.length} />
        <RelKPI accent={accent} label="Taxa de Conversão" value={`${taxaConversao}%`} color="rgb(52,211,153)" sub={`${opsGanhas.length} fechados`} />
        <RelKPI accent={accent} label="Ticket Médio" value={fmtBRL(ticketMedio)} color={`rgb(${accent})`} />
        <RelKPI accent={accent} label="Pipeline em Aberto"
          value={fmtBRL(opsAtivas.reduce((s,o) => s + (o.valor||0), 0))}
          sub={`${opsAtivas.length} oportunidades`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Funil por etapa */}
        <Card title="Volume por Etapa do Funil" accent={accent}>
          {funnelData.every(d => d.count === 0)
            ? <p className="text-slate-500 text-sm text-center py-8">Nenhuma oportunidade registrada.</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={funnelData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="count" name="Qtd." fill={`rgba(${accent},0.7)`} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </Card>

        {/* Pizza status */}
        <Card title="Distribuição por Status" accent={accent}>
          {pieData.length === 0
            ? <p className="text-slate-500 text-sm text-center py-8">Nenhuma oportunidade registrada.</p>
            : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="55%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {pieData.map((d,i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-slate-300">{d.name}</span>
                      <span className="font-bold text-white ml-1">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </Card>

        {/* Por responsável */}
        <Card title="Performance por Responsável" accent={accent}>
          {porResponsavel.length === 0
            ? <p className="text-slate-500 text-sm text-center py-8">Sem dados.</p>
            : (
              <div className="space-y-3">
                {porResponsavel.map((r,i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                      style={{ background: `rgba(${accent},0.3)` }}>
                      {r.nome[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-white truncate">{r.nome}</span>
                        <span className="text-slate-400 shrink-0 ml-2">{r.total} ops · {r.ganhos} ganhos</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${r.total > 0 ? Math.max((r.ganhos/r.total)*100, r.ganhos > 0 ? 5 : 0) : 0}%`, background: `rgb(${accent})` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </Card>

        {/* Atividades por tipo */}
        <Card title="Atividades por Tipo" accent={accent}>
          {porTipo.length === 0
            ? <p className="text-slate-500 text-sm text-center py-8">Nenhuma atividade registrada.</p>
            : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={porTipo.map(d => ({ ...d, tipo: TIPO_LABEL[d.tipo] || d.tipo }))} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="tipo" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="count" name="Total" fill={`rgba(${accent},0.7)`} radius={[0,6,6,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </Card>
      </div>
    </div>
  );
}
