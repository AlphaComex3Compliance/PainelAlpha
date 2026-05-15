"use client"

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import {
    LayoutDashboard, Filter, Calendar,
    Globe, MapPin
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Grafico({ dadosAcumulados }: any) {
    const v = { leads: 0, agendadas: 0, realizadas: 0, noShow: 0, habilitacao: 0, revisao: 0, leadsDesqualificados: 0 };
    const router = useRouter();
    const searchParams = useSearchParams();

    const canalUrl = searchParams.get('canal_grafico') || 'GERAL';
    const mesAtualUrl = parseInt(searchParams.get('mes') || new Date().getMonth().toString());
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const handleParamChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const canais = {
        TRAFEGO_PAGO: dadosAcumulados?.canais?.TRAFEGO_PAGO || v,
        CALLIX: dadosAcumulados?.canais?.CALLIX || v,
        INDICACAO: dadosAcumulados?.canais?.INDICACAO || v,
        EVENTOS: dadosAcumulados?.canais?.EVENTOS || v,
        CHINA: dadosAcumulados?.canais?.CHINA || v,
        GERAL: (() => {
            const c = dadosAcumulados?.canais;
            if (!c) return v;
            const todos = [c.TRAFEGO_PAGO, c.CALLIX, c.INDICACAO, c.EVENTOS, c.CHINA];

            return {
                leads: todos.reduce((acc, curr) => acc + (Number(curr?.leads) || 0), 0),
                agendadas: todos.reduce((acc, curr) => acc + (Number(curr?.agendadas) || 0), 0),
                realizadas: todos.reduce((acc, curr) => acc + (Number(curr?.realizadas) || 0), 0),
                noShow: todos.reduce((acc, curr) => acc + (Number(curr?.noShow || curr?.no_show) || 0), 0),
                habilitacao: todos.reduce((acc, curr) => acc + (Number(curr?.habilitacao) || 0), 0),
                revisao: todos.reduce((acc, curr) => acc + (Number(curr?.revisao) || 0), 0)
            };
        })()
    };

    const COLORS = {
        TRAFEGO: '#22c55e',
        CALLIX: '#3b82f6',
        INDICACAO: '#f97316',
        EVENTOS: '#8b5cf6',
        CHINA: '#ef4444'
    };

    const normalizarChave = (nome: string) => {
        return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/\s+/g, '_');
    };

    const dataOrigem = [
        { name: 'Tráfego Pago', value: canais.TRAFEGO_PAGO.leads, color: COLORS.TRAFEGO },
        { name: 'Callix', value: canais.CALLIX.leads, color: COLORS.CALLIX },
        { name: 'Indicação', value: canais.INDICACAO.leads, color: COLORS.INDICACAO },
        { name: 'Eventos', value: canais.EVENTOS.leads, color: COLORS.EVENTOS },
        { name: 'China', value: canais.CHINA.leads, color: COLORS.CHINA },
    ];

    return (
        <div className="min-h-screen  text-slate-200 p-6 space-y-8 pb-20">
            <header className="flex flex-col lg:flex-row items-center justify-between bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <LayoutDashboard className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white uppercase">Gráficos de Leads Alpha</h1>
                        <p className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase">{meses[mesAtualUrl]} / {canalUrl}</p>
                    </div>
                </div>
                <div className="flex gap-3 mt-4 lg:mt-0">
                    <SelectFiltro value={canalUrl} onChange={(v: string) => handleParamChange('canal_grafico', v)} options={['GERAL', 'TRAFEGO_PAGO', 'CALLIX', 'INDICACAO', 'EVENTOS', 'CHINA']} icon={<Filter size={14} />} />
                    <SelectFiltro value={mesAtualUrl} onChange={(v: string) => handleParamChange('mes', v)} options={meses.map((m, i) => ({ label: m, value: i }))} icon={<Calendar size={14} />} />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CardGraficoContainer titulo="ORIGEM - NOVOS LEADS">
                    <PieChartComponent data={dataOrigem} />
                </CardGraficoContainer>

                <CardGraficoContainer titulo="ORIGEM - VENDAS (HABILITAÇÃO)">
                    <PieChartComponent data={dataOrigem.map(d => ({
                        ...d,
                        value: (canais as any)[normalizarChave(d.name)]?.habilitacao || 0
                    }))} />
                </CardGraficoContainer>

                <CardGraficoContainer titulo="QUALIDADE - VENDAS (REVISÃO)">
                    <PieChartComponent data={dataOrigem.map(d => ({
                        ...d,
                        value: (canais as any)[normalizarChave(d.name)]?.revisao || 0
                    }))} />
                </CardGraficoContainer>

            </div>

            <div className="flex flex-col gap-8 w-full">

                <CardGraficoContainer titulo="ORIGEM - NOVOS LEADS">
                    <div className="h-[350px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[
                                    { name: 'Tráfego Pago', valor: canais.TRAFEGO_PAGO.leads, fill: COLORS.TRAFEGO },
                                    { name: 'Callix', valor: canais.CALLIX.leads, fill: COLORS.CALLIX },
                                    { name: 'Indicação', valor: canais.INDICACAO.leads, fill: COLORS.INDICACAO },
                                    { name: 'Eventos', valor: canais.EVENTOS.leads, fill: COLORS.EVENTOS },
                                    { name: 'China', valor: canais.CHINA.leads, fill: COLORS.CHINA }
                                ]}
                                margin={{ left: -20, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />

                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />

                                <Bar
                                    dataKey="valor"
                                    radius={[10, 10, 0, 0]}
                                    barSize={45}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardGraficoContainer>


                <CardGraficoContainer titulo="ORIGEM - VENDAS (HABILITAÇÃO)">
                    <div className="h-[350px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[
                                    { name: 'Tráfego Pago', valor: canais.TRAFEGO_PAGO.habilitacao, fill: COLORS.TRAFEGO },
                                    { name: 'Callix', valor: canais.CALLIX.habilitacao, fill: COLORS.CALLIX },
                                    { name: 'Indicação', valor: canais.INDICACAO.habilitacao, fill: COLORS.INDICACAO },
                                    { name: 'Eventos', valor: canais.EVENTOS.habilitacao, fill: COLORS.EVENTOS },
                                    { name: 'China', valor: canais.CHINA.habilitacao, fill: COLORS.CHINA }
                                ]}
                                margin={{ left: -20, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />

                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />

                                <Bar
                                    dataKey="valor"
                                    radius={[8, 8, 0, 0]}
                                    barSize={45}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardGraficoContainer>

                <CardGraficoContainer titulo="ORIGEM - VENDAS (REVISÃO)">
                    <div className="h-[350px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[
                                    { name: 'Tráfego Pago', valor: canais.TRAFEGO_PAGO.revisao, fill: COLORS.TRAFEGO },
                                    { name: 'Callix', valor: canais.CALLIX.revisao, fill: COLORS.CALLIX },
                                    { name: 'Indicação', valor: canais.INDICACAO.revisao, fill: COLORS.INDICACAO },
                                    { name: 'Eventos', valor: canais.EVENTOS.revisao, fill: COLORS.EVENTOS },
                                    { name: 'China', valor: canais.CHINA.revisao, fill: COLORS.CHINA }
                                ]}
                                margin={{ left: -20, bottom: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />

                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />

                                <Bar
                                    dataKey="valor"
                                    radius={[8, 8, 0, 0]}
                                    barSize={45}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardGraficoContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {Object.entries(canais).map(([key, info]: [string, any]) => (
                    <CardGraficoContainer
                        key={key}
                        titulo={`DETALHAMENTO: ${key.replace('_', ' ')}`}
                    >
                        <div className="h-[300px] w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={[
                                        { label: 'Leads', valor: info.leads, cor: '#3b82f6' },
                                        { label: 'Agendas', valor: info.agendadas, cor: '#8b5cf6' },
                                        { label: 'Realizadas', valor: info.realizadas, cor: '#10b981' },
                                        { label: 'No Show', valor: info.noShow, cor: '#f43f5e' },
                                        { label: 'Habilitação', valor: info.habilitacao, cor: '#fbbf24' },
                                        { label: 'Revisão', valor: info.revisao, cor: '#f97316' }
                                    ]}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />

                                    <Tooltip
                                        shared={false}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: 'gray', border: 'none', borderRadius: '12px' }}
                                    />

                                    <Bar dataKey="valor" radius={[4, 4, 0, 0]} barSize={40}>
                                        {[
                                            '#3b82f6', // Leads
                                            '#8b5cf6', // Agendas
                                            '#10b981', // Realizadas
                                            '#f43f5e', // No Show
                                            '#fbbf24', // Habilitação
                                            '#f97316'  // Revisão
                                        ].map((color, index) => (
                                            <Cell key={`cell-${index}`} fill={color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardGraficoContainer>

                ))}

                <CardGraficoContainer titulo="FUNIL DE CONVERSÃO: EVENTOS">
                    <div className="flex flex-col justify-center h-full space-y-4 px-10">
                        <BarraProgresso label="Leads -> Agendas" atual={canais.EVENTOS.agendadas} total={canais.EVENTOS.leads} cor="bg-purple-500" />
                        <BarraProgresso label="Agendas -> Realizadas" atual={canais.EVENTOS.realizadas} total={canais.EVENTOS.agendadas} cor="bg-indigo-500" />
                        <BarraProgresso label="Realizadas -> Vendas" atual={canais.EVENTOS.habilitacao + canais.EVENTOS.revisao} total={canais.EVENTOS.realizadas} cor="bg-emerald-500" />
                    </div>
                </CardGraficoContainer>
                <CardGraficoContainer titulo="FUNIL DE CONVERSÃO: CHINA">
                    <div className="flex flex-col justify-center h-full space-y-4 px-10">
                        <BarraProgresso label="Leads -> Agendas" atual={canais.CHINA.agendadas} total={canais.CHINA.leads} cor="bg-red-500" />
                        <BarraProgresso label="Agendas -> Realizadas" atual={canais.CHINA.realizadas} total={canais.CHINA.agendadas} cor="bg-orange-500" />
                        <BarraProgresso label="Realizadas -> Vendas" atual={canais.CHINA.habilitacao + canais.CHINA.revisao} total={canais.CHINA.realizadas} cor="bg-yellow-500" />
                    </div>
                </CardGraficoContainer>
            </div>

        </div>
    );
}

function CardGraficoContainer({ titulo, children, icon }: any) {
    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 shadow-xl flex flex-col min-h-[350px]">
            <div className="flex items-center gap-2 mb-6">
                {icon}
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{titulo}</h3>
            </div>
            <div className="flex-1 w-full">{children}</div>
        </div>
    );
}

function PieChartComponent({ data }: any) {
    return (
        <div className="h-full w-full relative">
            <ResponsiveContainer>
                <PieChart>
                    <Pie data={data} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                        {data.map((entry: any, index: number) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }} />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-[8px] font-black text-slate-500 uppercase">Total</p>
                <p className="text-xl font-black text-white">{data.reduce((a: any, b: any) => a + b.value, 0)}</p>
            </div>
        </div>
    );
}

function BarChartSimples({ data }: any) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px' }} />
                <Bar dataKey="valor" radius={[10, 10, 0, 0]} barSize={40}>
                    {data.map((entry: any, index: number) => <Cell key={index} fill={entry.color} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

function BarraProgresso({ label, atual, total, cor }: any) {
    const porc = total > 0 ? Math.min(100, (atual / total) * 100) : 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                <span className="text-slate-400">{label}</span>
                <span className="text-white">{porc.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${cor} transition-all duration-1000`} style={{ width: `${porc}%` }} />
            </div>
        </div>
    );
}

function SelectFiltro({ value, onChange, options, icon }: any) {
    return (
        <div className="cursor-pointer flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-2xl text-xs font-black text-white">
            {icon}
            <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent outline-none cursor-pointer uppercase">
                {options.map((opt: any) => (
                    <option key={opt.value || opt} value={opt.value !== undefined ? opt.value : opt} className="bg-slate-800">
                        {opt.label || opt.replace('_', ' ')}
                    </option>
                ))}
            </select>
        </div>
    );
}

function MetricItem({ label, valor, cor, sub = false }: any) {
    return (
        <div className="flex justify-between items-center">
            <span className={`text-[10px] uppercase tracking-wider ${sub ? 'text-slate-500' : 'text-slate-400 font-medium'}`}>
                {label}
            </span>
            <span className={`text-sm font-black ${cor}`}>
                {valor}
            </span>
        </div>
    );
}