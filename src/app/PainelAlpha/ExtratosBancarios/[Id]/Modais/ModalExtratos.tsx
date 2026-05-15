"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Plus, Minus, Layers, Search, Download,
    Trash2, AlertCircle, Info
} from 'lucide-react';
import { Transacao } from '@prisma/client';

interface PainelProps {
    empresa: { razaoSocial: string; cnpj: string };
    linhas: any[];
    setLinhasExtraidas: React.Dispatch<React.SetStateAction<any[]>>;
    onClose: () => void;
    onExport: (dados: any[]) => void;
    bancoId?: number;
    isOpen?: boolean;
    dadosContexto?: any;
    onAtualizar?: () => Promise<void>;
}

export default function PainelConferencia({ empresa, linhas, setLinhasExtraidas, onClose, onExport, isOpen }: PainelProps) {
    const [filtroExportacao, setFiltroExportacao] = useState<'todos' | 'entradas' | 'saidas'>('todos');
    const [valorMinimo, setValorMinimo] = useState("");
    const [valorMaximo, setValorMaximo] = useState("");
    const [showModalSelecionar, SetshowModalSelecionar] = useState(false);
    const [selecionados, setSelecionados] = useState<number[]>([]);

    const [pesquisa, setPesquisa] = useState('');
    const [excluidosTemporarios, setExcluidosTemporarios] = useState<number[]>([]);

    const formatarMoedaInput = (valor: string) => {
        const apenasNumeros = valor.replace(/\D/g, "");
        if (!apenasNumeros) return "";
        return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(
            parseFloat(apenasNumeros) / 100
        );
    };

    const executarExportacao = () => {
        const parseValorInput = (val: string) => {
            if (!val) return null;
            const num = Number(val.replace(/\D/g, '')) / 100;
            return isNaN(num) ? null : num;
        };

        const min = parseValorInput(valorMinimo);
        const max = parseValorInput(valorMaximo);

        const baseDados = showModalSelecionar
            ? linhas.filter((_, idx) => !excluidosTemporarios.includes(idx))
            : linhas;

        const filtrados = baseDados.filter((t) => {
            const v = Number(t.valor);
            const termo = pesquisa.toLowerCase();

            const bateBusca = !showModalSelecionar || !pesquisa || (
                String(t.descricao).toLowerCase().includes(termo) ||
                String(t.nomeBanco).toLowerCase().includes(termo) ||
                String(t.data).toLowerCase().includes(termo)
            );

            let passaTipo = true;
            if (filtroExportacao === 'entradas') passaTipo = v > 0;
            if (filtroExportacao === 'saidas') passaTipo = v < 0;

            const valorParaFiltro = Math.abs(v);

            let passaFaixa = true;
            if (min !== null && valorParaFiltro < min) passaFaixa = false;
            if (max !== null && valorParaFiltro > max) passaFaixa = false;

            return bateBusca && passaTipo && passaFaixa;
        });

        if (filtrados.length === 0) return alert("Nenhum dado encontrado com esses filtros.");

        const dadosParaExportar = filtrados.map(item => {
            let dataVisual = String(item.data).trim();
            return {
                ...item,
                data: dataVisual.toUpperCase()
            };
        });

        onExport(dadosParaExportar);
    };

    const linhasNegativas = useMemo(() => {
        return linhas.filter((t, index) => {
            const v = typeof t.valor === 'string' ? parseFloat(t.valor.replace(/\./g, '').replace(',', '.')) : Number(t.valor);
            const jaExcluido = excluidosTemporarios.includes(index);
            const termo = pesquisa.toLowerCase();
            const bateComBusca = t.descricao.toLowerCase().includes(termo) || t.nomeBanco.toLowerCase().includes(termo) || t.data.includes(termo);
            return v < 0 && !jaExcluido && bateComBusca;
        });
    }, [linhas, pesquisa, excluidosTemporarios]);

    const excluirVisual = (indexOriginal: number) => {
        setExcluidosTemporarios([...excluidosTemporarios, indexOriginal]);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-7xl max-h-[92vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        >
            <div className="p-8 border-b bg-white flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                        Conferência de Lançamentos
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                            {empresa.cnpj}
                        </span>
                        <p className="text-sm text-slate-500 font-bold uppercase italic">{empresa.razaoSocial}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="cursor-pointer p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-rose-500"
                >
                    <X size={28} />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead className="sticky top-0 z-20">
                        <tr className="bg-slate-900 text-white">
                            <th className="p-5 text-left text-[10px] font-black uppercase tracking-[0.2em] first:rounded-l-2xl">Mês Ref.</th>
                            <th className="p-5 text-left text-[10px] font-black uppercase tracking-[0.2em]">Instituição</th>
                            <th className="p-5 text-left text-[10px] font-black uppercase tracking-[0.2em]">Data</th>
                            <th className="p-5 text-left text-[10px] font-black uppercase tracking-[0.2em]">Descrição Detalhada</th>
                            <th className="p-5 text-right text-[10px] font-black uppercase tracking-[0.2em] last:rounded-r-2xl">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {linhas.map((t, i) => (
                            <tr key={i} className="group bg-white hover:bg-indigo-50/50 transition-all shadow-sm">
                                <td className="p-5 border-y border-l border-slate-100 first:rounded-l-2xl text-slate-900 font-black italic">
                                    {t.mesReferencia}
                                </td>
                                <td className="p-5 border-y border-slate-100 text-slate-500 font-bold text-xs uppercase">
                                    {t.nomeBanco}
                                </td>
                                <td className="p-5 border-y border-slate-100 text-slate-600 font-bold text-[11px] whitespace-nowrap">
                                    {t.data}
                                </td>
                                <td className="p-5 border-y border-slate-100 text-slate-800 font-medium text-[11px] uppercase leading-tight max-w-md">
                                    {t.descricao}
                                </td>
                                <td className={`p-5 border-y border-r border-slate-100 last:rounded-r-2xl text-right font-black text-sm ${t.valor < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {Number(t.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-8 border-t bg-slate-50 flex flex-col gap-8">
                <div className="flex flex-wrap items-end justify-between gap-8">
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Filtrar Movimentação</p>
                        <div className="flex bg-slate-200 p-1.5 rounded-[1.2rem] border border-slate-300 shadow-inner">
                            <button onClick={() => setFiltroExportacao('entradas')} className={`cursor-pointer px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${filtroExportacao === 'entradas' ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Plus size={14} strokeWidth={3} /> Entradas
                            </button>
                            <button onClick={() => setFiltroExportacao('saidas')} className={`cursor-pointer px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${filtroExportacao === 'saidas' ? 'bg-rose-600 text-white shadow-lg scale-105' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Minus size={14} strokeWidth={3} /> Saídas
                            </button>
                            <button onClick={() => setFiltroExportacao('todos')} className={`cursor-pointer px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${filtroExportacao === 'todos' ? 'bg-slate-800 text-white shadow-lg scale-105' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Layers size={14} strokeWidth={3} /> Tudo
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Faixa de Valor (R$)</p>
                        <div className="flex items-center gap-3">
                            <input type="text" placeholder="Mínimo R$ 0,00" value={valorMinimo} onChange={(e) => setValorMinimo(formatarMoedaInput(e.target.value))} className="w-40 bg-white border border-slate-300 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-right shadow-sm" />
                            <span className="text-slate-400 font-black text-[10px] uppercase italic">até</span>
                            <input type="text" placeholder="Máximo R$ 0,00" value={valorMaximo} onChange={(e) => setValorMaximo(formatarMoedaInput(e.target.value))} className="w-40 bg-white border border-slate-300 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-right shadow-sm" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <button onClick={onClose} className="cursor-pointer px-6 py-4 text-slate-400 hover:text-slate-900 font-black text-[11px] uppercase tracking-widest transition-all">
                            Cancelar
                        </button>
                        <button
                            onClick={() => SetshowModalSelecionar(true)}
                            className="group cursor-pointer flex items-center gap-3 bg-amber-50 hover:bg-amber-100 text-amber-700 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-amber-200 transition-all active:scale-95 shadow-sm"
                        >
                            <Search size={18} className="group-hover:scale-110 transition-transform" />
                            Conferir Lançamentos
                        </button>
                        <button
                            onClick={executarExportacao}
                            className={`cursor-pointer flex items-center gap-3 px-10 py-5 rounded-[1.5rem] font-black text-xs shadow-2xl transition-all hover:scale-105 text-white active:scale-95 ${filtroExportacao === 'entradas' ? 'bg-emerald-600 shadow-emerald-200' :
                                filtroExportacao === 'saidas' ? 'bg-rose-600 shadow-rose-200' :
                                    'bg-slate-900 shadow-slate-200'
                                }`}
                        >
                            <Download size={20} strokeWidth={2.5} />
                            EXPORTAR {filtroExportacao.toUpperCase()}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showModalSelecionar && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="bg-white w-full max-w-6xl h-[88vh] rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col"
                        >
                            <div className="px-8 py-6 bg-white border-b border-slate-100 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="bg-indigo-100 p-1.5 rounded-lg">
                                            <Layers size={20} className="text-indigo-600" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">
                                            Conferência Geral de Lançamentos
                                        </h3>
                                    </div>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider opacity-60">
                                        Revise entradas e saídas. Pesquise por valor, data ou descrição.
                                    </p>
                                </div>
                                <button onClick={() => SetshowModalSelecionar(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex gap-4 items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Pesquisar valor (ex: 150,00), data ou descrição..."
                                        className="w-full pl-10 pr-4 py-3 bg-white text-gray-500 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                                        value={pesquisa}
                                        onChange={(e) => setPesquisa(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const filtradas = linhas.filter((t, idx) => {
                                                const termo = pesquisa.toLowerCase();
                                                const vStr = Number(t.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).toLowerCase();
                                                return !excluidosTemporarios.includes(idx) && (
                                                    t.descricao.toLowerCase().includes(termo) ||
                                                    t.nomeBanco.toLowerCase().includes(termo) ||
                                                    t.data.includes(termo) ||
                                                    vStr.includes(termo)
                                                );
                                            });
                                            const idsParaSelecionar = filtradas.map(f => linhas.indexOf(f));
                                            setSelecionados(selecionados.length === filtradas.length ? [] : idsParaSelecionar);
                                        }}
                                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors"
                                    >
                                        {selecionados.length > 0 ? 'Inverter Seleção' : 'Selecionar Filtrados'}
                                    </button>

                                    {selecionados.length > 0 && (
                                        <button
                                            onClick={() => {
                                                setExcluidosTemporarios([...excluidosTemporarios, ...selecionados]);
                                                setSelecionados([]);
                                            }}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-all"
                                        >
                                            <Trash2 size={14} /> Apagar Selecionados
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto px-8 py-2">
                                <table className="w-full text-left border-separate border-spacing-y-2">
                                    <thead className="sticky top-0 bg-white z-10">
                                        <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                            <th className="pl-4 w-12">Sel.</th>
                                            <th>Instituição</th>
                                            <th>Data</th>
                                            <th>Descrição Detalhada</th>
                                            <th className="text-right pr-6">Valor</th>
                                            <th className="text-center w-20">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {linhas.filter((t, idx) => {
                                            const termo = pesquisa.toLowerCase();
                                            const vStr = Number(t.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).toLowerCase();
                                            const bate = t.descricao.toLowerCase().includes(termo) ||
                                                t.nomeBanco.toLowerCase().includes(termo) ||
                                                t.data.includes(termo) ||
                                                vStr.includes(termo);
                                            return !excluidosTemporarios.includes(idx) && bate;
                                        }).map((t) => {
                                            const idxOriginal = linhas.indexOf(t);
                                            const isSelected = selecionados.includes(idxOriginal);
                                            return (
                                                <tr key={idxOriginal} className={`group transition-all ${isSelected ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'bg-white'} border border-slate-100 shadow-sm rounded-xl`}>
                                                    <td className="p-4 rounded-l-2xl">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {
                                                                setSelecionados(prev =>
                                                                    prev.includes(idxOriginal) ? prev.filter(id => id !== idxOriginal) : [...prev, idxOriginal]
                                                                );
                                                            }}
                                                            className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
                                                        />
                                                    </td>
                                                    <td className="p-4 text-[10px] font-black text-slate-500 uppercase italic">
                                                        {t.nomeBanco}
                                                    </td>
                                                    <td className="p-4 text-slate-600 text-xs font-bold">
                                                        {t.data}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-slate-900 text-[11px] font-bold uppercase leading-tight max-w-md group-hover:text-indigo-600 transition-colors">
                                                            {t.descricao}
                                                        </div>
                                                    </td>
                                                    <td className={`p-4 text-right font-black text-sm pr-6 ${t.valor < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                        {Number(t.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </td>
                                                    <td className="p-4 text-center rounded-r-2xl">
                                                        <button
                                                            onClick={() => excluirVisual(idxOriginal)}
                                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <div className="flex gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionados</span>
                                        <span className="text-xl font-black text-indigo-600 tracking-tighter">{selecionados.length}</span>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200 self-center" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Visível</span>
                                        <span className={`text-xl font-black tracking-tighter ${linhas.reduce((acc, t, idx) => !excluidosTemporarios.includes(idx) ? acc + Number(t.valor) : acc, 0) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {linhas.reduce((acc, t, idx) => !excluidosTemporarios.includes(idx) ? acc + Number(t.valor) : acc, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setSelecionados([]);
                                            setExcluidosTemporarios([]);
                                            SetshowModalSelecionar(false);
                                        }}
                                        className="cursor-pointer px-8 py-4 bg-white border border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                                    >
                                        Resetar e Sair
                                    </button>

                                    <button
                                        onClick={executarExportacao}
                                        className={`cursor-pointer flex items-center gap-3 px-10 py-5 rounded-[1.5rem] font-black text-xs shadow-2xl transition-all hover:scale-105 text-white active:scale-95 ${filtroExportacao === 'entradas' ? 'bg-emerald-600 shadow-emerald-200' :
                                            filtroExportacao === 'saidas' ? 'bg-rose-600 shadow-rose-200' :
                                                'bg-slate-900 shadow-slate-200'
                                            }`}
                                    >
                                        <Download size={20} strokeWidth={2.5} />
                                        EXPORTAR
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}