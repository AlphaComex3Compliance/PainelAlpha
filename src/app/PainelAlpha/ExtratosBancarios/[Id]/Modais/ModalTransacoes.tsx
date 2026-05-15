"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Search, Trash2, Square, CheckSquare, ListX, 
    ArrowUpDown, ChevronDown 
} from 'lucide-react';
import { toast } from 'sonner';
import { BuscarTransacoesPorBanco, DeletarTransacoesLote } from '@/actions/transacao';

export default function PainelTransacoes({ bancoId }: { bancoId: number }) {
    const [transacoes, setTransacoes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("");
    const [ordenacao, setOrdenacao] = useState("valor+"); 
    const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

    const carregarDados = async () => {
        setLoading(true);
        const res = await BuscarTransacoesPorBanco(bancoId);
        if (res.success) setTransacoes(res.data);
        setLoading(false);
        setSelecionados(new Set());
    };

    useEffect(() => { carregarDados(); }, [bancoId]);

    const transacoesExibidas = useMemo(() => {
        let resultado = transacoes.filter(t => {
            const termo = filtro.toLowerCase();
            const descMatch = t.descricao?.toLowerCase().includes(termo);
            const valorMatch = t.valor?.toString().includes(termo) || 
                               t.valor?.toLocaleString('pt-BR').includes(termo);
            return descMatch || valorMatch;
        });

        resultado.sort((a, b) => {
            switch (ordenacao) {
                case "valor+":
                    return b.valor - a.valor;
                case "valor-":
                    return a.valor - b.valor;
                default:
                    return 0;
            }
        });

        return resultado;
    }, [transacoes, filtro, ordenacao]);

    const toggleTodos = () => {
        if (selecionados.size === transacoesExibidas.length) {
            setSelecionados(new Set());
        } else {
            setSelecionados(new Set(transacoesExibidas.map(t => t.id)));
        }
    };

    const toggleSelecionar = (id: string) => {
        const novos = new Set(selecionados);
        if (novos.has(id)) novos.delete(id);
        else novos.add(id);
        setSelecionados(novos);
    };

    const handleDeletarLote = async () => {
        const ids = Array.from(selecionados);
        if (ids.length === 0) return;
        if (!confirm(`Deseja excluir ${ids.length} lançamentos selecionados?`)) return;

        const res = await DeletarTransacoesLote(ids);
        if (res.success) {
            setTransacoes(prev => prev.filter(t => !ids.includes(t.id)));
            setSelecionados(new Set());
            toast.success(`${ids.length} itens removidos.`);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20 text-slate-500 uppercase text-[10px] font-black tracking-[0.3em]">
            Sincronizando registros...
        </div>
    );

    return (
        <div className="w-full space-y-6">
            {/* Toolbar Superior */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-[2rem] border border-white/10">
                
                {/* Search Input */}
                <div className="relative flex-1 w-full lg:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="BUSCAR TRANSAÇÃO..." 
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-[11px] font-bold text-white uppercase outline-none focus:border-indigo-500/50 transition-all"
                    />
                </div>

                {/* Filtros de Ordenação e Seleção */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={14} />
                        <select 
                            value={ordenacao}
                            onChange={(e) => setOrdenacao(e.target.value)}
                            className="appearance-none bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-[10px] font-black uppercase text-white outline-none focus:border-indigo-500/50 transition-all cursor-pointer w-full"
                        >
                            <option value="valor+">Valor: Maior Primeiro</option>
                            <option value="valor-">Valor: Menor Primeiro</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
                    </div>

                    <button onClick={toggleTodos} className="px-5 py-3 bg-white/5 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all whitespace-nowrap">
                        {selecionados.size === transacoesExibidas.length ? <CheckSquare size={16}/> : <Square size={16}/>}
                        {selecionados.size === transacoesExibidas.length ? "Limpar" : "Todos"}
                    </button>
                </div>
            </div>

            {/* Tabela de Dados */}
            <div className="bg-black/20 rounded-[2.5rem] border border-white/5 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">
                            <th className="px-6 py-5 w-10">Sel.</th>
                            <th className="px-6 py-5">Data</th>
                            <th className="px-6 py-5">Descrição</th>
                            <th className="px-6 py-5 text-right">Valor (R$)</th>
                            <th className="px-6 py-5 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {transacoesExibidas.map((t) => (
                            <tr key={t.id} className={`group transition-colors ${selecionados.has(t.id) ? 'bg-indigo-500/5' : 'hover:bg-white/[0.02]'}`}>
                                <td className="px-6 py-4">
                                    <button onClick={() => toggleSelecionar(t.id)} className="text-slate-600 hover:text-indigo-400 transition-colors">
                                        {selecionados.has(t.id) ? <CheckSquare size={18} className="text-indigo-500"/> : <Square size={18}/>}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-[12px] font-bold text-slate-400">{t.data}</td>
                                <td className="px-6 py-4">
                                    <div className="text-[13px] font-black text-white uppercase italic tracking-tight">{t.descricao}</div>
                                </td>
                                <td className={`px-6 py-4 text-right text-[15px] font-black ${t.valor < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {t.valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => { if(confirm("Remover este registro?")) DeletarTransacoesLote([t.id]).then(carregarDados) }} 
                                        className="p-2 text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {transacoesExibidas.length === 0 && (
                    <div className="p-20 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        Nenhuma transação encontrada para este filtro.
                    </div>
                )}
            </div>

            {/* Footer Flutuante (Ações em Lote) */}
            {selecionados.size > 0 && (
                <div className="sticky bottom-6 bg-indigo-600 p-4 mx-6 rounded-2xl flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-indigo-400/30 animate-in slide-in-from-bottom-8">
                    <div className="flex items-center gap-4 ml-4">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <ListX size={18} className="text-white" />
                        </div>
                        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
                            {selecionados.size} Registros Marcados
                        </span>
                    </div>
                    <button 
                        onClick={handleDeletarLote}
                        className="flex items-center gap-3 bg-white text-indigo-700 px-8 py-3 rounded-xl text-[11px] font-black uppercase hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95"
                    >
                        Excluir Selecionados
                    </button>
                </div>
            )}
        </div>
    );
}