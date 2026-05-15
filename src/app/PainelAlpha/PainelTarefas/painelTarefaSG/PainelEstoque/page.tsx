"use client"

import { useState, useEffect, useMemo } from "react";
import {
    Plus, Package, Trash2, Edit3, Search, X, Loader2,
    ChevronRight, ShoppingCart, LayoutGrid, Tag,
    Image as ImageIcon, AlertTriangle, ArrowRight,
    ArrowUpRight, Info
} from "lucide-react";
import {
    SalvarProduto, buscarProdutos, DeletarProduto,
    buscarListaCompra, AdicionarAoCarrinho,
    RemoverDaLista, ConfirmarCarrinhoParaLista
} from "@/actions/Estoque";
import { SalvarCategoria, buscarCategorias, DeletarCategoria } from "@/actions/Estoque";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

interface Categoria {
    id: string;
    nome: string;
}

interface ProdutoEstoque {
    id: string;
    nome: string;
    quantidade: number;
    estoqueMinimo: number;
    unidade: string;
    precoMedio: number | null;
    imagem?: string | null;
    categoriaId: string;
    categoria?: { nome: string };
}

export default function PainelEstoquePro() {
    const [busca, setBusca] = useState("");
    const [filtroCat, setFiltroCat] = useState("TODOS");
    const [showModal, setShowModal] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);

    const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [listaCompraDoBanco, setListaCompraDoBanco] = useState<any[]>([]);

    const [form, setForm] = useState({
        id: "", nome: "", categoriaId: "", quantidade: 0,
        estoqueMinimo: 1, unidade: "un", precoMedio: 0, imagem: ""
    });

    const itensNoCarrinho = listaCompraDoBanco.filter(item => item.status === "CARRINHO");
    const [nomeNovaCat, setNomeNovaCat] = useState("");

    useEffect(() => { carregarDados(); }, []);

    async function carregarDados() {
        setLoading(true);
        try {
            const [p, c, l] = await Promise.all([
                buscarProdutos(),
                buscarCategorias(),
                buscarListaCompra()
            ]);
            setProdutos(p as any);
            setCategorias(c as any);
            setListaCompraDoBanco(l as any);
        } finally {
            setLoading(false);
        }
    }

    const handleSalvarProduto = async () => {
        if (!form.nome || !form.categoriaId) return toast.error("Preencha os campos obrigatórios!");
        setIsSaving(true);
        const res = await SalvarProduto(form);
        if (res.success) {
            toast.success("Sincronizado com Sucesso!");
            fecharModal();
            carregarDados();
        }
        setIsSaving(false);
    };

    const handleAddCategoria = async () => {
        if (!nomeNovaCat) return;
        const res = await SalvarCategoria(nomeNovaCat.toUpperCase());
        if (res.success) {
            toast.success("Categoria Registrada");
            setNomeNovaCat("");
            carregarDados();
        }
    };

    const fecharModal = () => {
        setShowModal(false);
        setForm({ id: "", nome: "", categoriaId: "", quantidade: 0, estoqueMinimo: 1, unidade: "un", precoMedio: 0, imagem: "" });
    };

    const filtrados = useMemo(() => {
        return produtos.filter(p =>
            p.nome.toLowerCase().includes(busca.toLowerCase()) &&
            (filtroCat === "TODOS" || p.categoriaId === filtroCat)
        );
    }, [produtos, busca, filtroCat]);

    const stats = useMemo(() => ({
        total: produtos.length,
        criticos: produtos.filter(p => p.quantidade <= p.estoqueMinimo).length,
        valor: produtos.reduce((acc, p) => acc + ((p.precoMedio || 0) * p.quantidade), 0)
    }), [produtos]);

    return (
        <div className="min-h-screen bg-[#08080a] text-slate-300 p-4 lg:p-10 selection:bg-indigo-500/30 font-sans">
            <div className="max-w-[1600px] mx-auto">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                    <div className="flex items-center gap-6">
                        <motion.div
                            initial={{ rotate: -10, scale: 0.9 }}
                            animate={{ rotate: 0, scale: 1 }}
                            className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[1.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.3)] border border-white/10"
                        >
                            <LayoutGrid className="text-white" size={32} />
                        </motion.div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">
                                Alpha <span className="text-indigo-500">Estoque</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase">Sistema de Alta Performance</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={() => setShowCatModal(true)}
                            className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white cursor-pointer"
                        >
                            <Tag size={22} />
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex-1 md:flex-none bg-white text-black hover:bg-indigo-500 hover:text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 cursor-pointer group"
                        >
                            <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> Novo Conteudo
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {[
                        { label: "Inventário Total", val: stats.total, icon: Package, color: "text-indigo-500", bg: "bg-indigo-500/10", action: null },
                        { label: "No minimo", val: stats.criticos, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10", action: null },
                        { label: "No Carrinho", val: itensNoCarrinho.length, icon: ShoppingCart, color: "text-amber-400", bg: "bg-amber-400/10", action: () => setShowCartModal(true) }
                    ].map((s, i) => (
                        <motion.button
                            key={i}
                            whileHover={s.action ? { y: -5 } : {}}
                            onClick={s.action || undefined}
                            className={`relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex items-center gap-8 group text-left transition-all ${s.action ? 'cursor-pointer hover:bg-white/[0.05] hover:border-white/10' : 'cursor-default'}`}
                        >
                            <div className={`p-5 rounded-3xl ${s.bg} ${s.color} border border-white/5 shadow-inner`}>
                                <s.icon size={28} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-2">{s.label}</p>
                                <p className="text-3xl font-black text-white italic tracking-tighter leading-none">
                                    {s.val} <span className="text-[10px] not-italic text-slate-600 ml-1 uppercase">{typeof s.val === 'number' ? 'unidades' : ''}</span>
                                </p>
                            </div>
                            {s.action && <ArrowUpRight size={20} className="text-slate-700 group-hover:text-white transition-colors" />}
                        </motion.button>
                    ))}
                </div>

                <div className="sticky top-4 z-40 flex flex-col lg:flex-row gap-4 mb-12 bg-[#08080a]/80 backdrop-blur-md p-2 rounded-3xl border border-white/5 shadow-2xl">
                    <div className="flex-1 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                        <input
                            placeholder="Pesquisar no banco de dados..."
                            className="w-full bg-white/5 border border-transparent rounded-[1.5rem] py-5 pl-16 pr-6 text-sm font-bold text-white outline-none focus:bg-white/[0.08] focus:border-indigo-500/30 transition-all placeholder:text-slate-700 uppercase"
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 p-1.5 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setFiltroCat("TODOS")}
                            className={`cursor-pointer px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filtroCat === "TODOS" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
                        >
                            Ver Todos
                        </button>
                        {categorias.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setFiltroCat(c.id)}
                                className={`cursor-pointer px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filtroCat === c.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
                            >
                                {c.nome}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="py-40 flex flex-col items-center">
                        <div className="relative">
                            <Loader2 className="animate-spin text-indigo-500" size={48} />
                            <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
                        </div>
                        <p className="mt-6 text-[10px] font-black uppercase text-slate-600 tracking-[0.8em]">Sincronizando Banco</p>
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {filtrados.map(p => {
                                const qtd = Number(p.quantidade);
                                const min = Number(p.estoqueMinimo);
                                const isCritico = qtd <= min;
                                const isAtencao = !isCritico && qtd <= (min + 2);

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={p.id}
                                        className={`group relative bg-white/[0.02] border rounded-[3rem] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)]
                                                ${isCritico ? 'border-rose-500/40 shadow-[inset_0_0_40px_rgba(244,63,94,0.05)]' :
                                                isAtencao ? 'border-amber-500/40 shadow-[inset_0_0_40px_rgba(245,158,11,0.03)]' :
                                                    'border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="relative h-64 w-full bg-[#121214] overflow-hidden">
                                            {p.imagem ? (
                                                <img
                                                    src={p.imagem}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] opacity-80 group-hover:opacity-100"
                                                    alt={p.nome}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-800">
                                                    <Package size={50} strokeWidth={1} />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent opacity-60" />

                                            <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 z-20">
                                                <button
                                                    onClick={async () => {
                                                        const res = await AdicionarAoCarrinho(p);
                                                        if (res.success) {
                                                            toast.success(`${p.nome} preparado para compra`, { icon: <ShoppingCart size={14} /> });
                                                            carregarDados();
                                                        }
                                                    }}
                                                    className="p-4 bg-white text-black rounded-2xl hover:bg-amber-500 hover:text-white transition-all shadow-2xl cursor-pointer"
                                                >
                                                    <ShoppingCart size={18} />
                                                </button>
                                                <button
                                                    onClick={() => { setForm({ ...p, imagem: p.imagem || "", precoMedio: p.precoMedio || 0 }); setShowModal(true); }}
                                                    className="p-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl hover:bg-indigo-600 transition-all border border-white/10 cursor-pointer"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Remover ${p.nome}?`)) DeletarProduto(p.id).then(carregarDados);
                                                    }}
                                                    className="p-4 bg-white/10 backdrop-blur-xl text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all border border-white/10 cursor-pointer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="absolute bottom-6 left-6 z-20">
                                                {isCritico && (
                                                    <div className="px-4 py-2 text-[9px] font-black text-white uppercase rounded-xl shadow-2xl flex items-center gap-2 bg-rose-600 border border-rose-400/50">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                                        Reposição Imediata
                                                    </div>
                                                )}
                                                {isAtencao && (
                                                    <div className="px-4 py-2 text-[9px] font-black text-white uppercase rounded-xl shadow-2xl bg-amber-600 border border-amber-400/50">
                                                        Estoque Baixo
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-8 flex-1 flex flex-col relative">
                                            <div className="flex justify-between items-start mb-4">
                                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] truncate pr-4">
                                                    {p.categoria?.nome || 'Insumo Alpha'}
                                                </p>
                                                <Info size={14} className="text-slate-700" />
                                            </div>

                                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8 leading-tight group-hover:text-indigo-400 transition-colors">
                                                {p.nome}
                                            </h3>

                                            <div className="mt-auto grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Atual</p>
                                                    <div className="flex items-baseline gap-3">
                                                        <span className={`text-3xl font-black italic tracking-tighter ${isCritico ? 'text-rose-500' : isAtencao ? 'text-amber-500' : 'text-white'}`}>
                                                            {qtd}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-slate-500 uppercase">{p.unidade}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Mínimo</p>
                                                    <p className="text-xl font-black italic text-slate-500">
                                                        {min}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[150] flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#0c0c0e] border border-white/10 w-full max-w-2xl rounded-[3.5rem] p-12 relative shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Edição de <span className="text-indigo-500">Conteudo</span></h2>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Configuração de Produto</p>
                                </div>
                                <button onClick={fecharModal} className="p-4 bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded-2xl transition-all cursor-pointer"><X size={24} /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Nome do produto</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/5 p-6 rounded-[1.5rem] text-sm font-bold text-white outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all uppercase placeholder:text-slate-800"
                                        placeholder="EX: DETERGENTE INDUSTRIAL 5L"
                                        value={form.nome}
                                        onChange={e => setForm({ ...form, nome: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                {/* ESTOQUE ATUAL */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Estoque Atual</label>
                                    <div className="flex items-center justify-between bg-white/5 border border-white/5 p-2 rounded-[2rem]">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, quantidade: Math.max(0, form.quantidade - 1) })}
                                            className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-rose-500/20 text-white rounded-2xl transition-all active:scale-90 cursor-pointer border border-white/5"
                                        >
                                            <span className="text-2xl font-light">-</span>
                                        </button>

                                        <input
                                            type="text"
                                            className="w-20 bg-transparent text-center text-xl font-black text-white outline-none"
                                            value={form.quantidade}
                                            onChange={e => setForm({ ...form, quantidade: Number(e.target.value) })}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, quantidade: form.quantidade + 1 })}
                                            className="w-14 h-14 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all active:scale-90 cursor-pointer shadow-lg shadow-indigo-600/20"
                                        >
                                            <Plus size={20} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Estoque de Segurança</label>
                                    <div className="flex items-center justify-between bg-white/5 border border-white/5 p-2 rounded-[2rem]">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, estoqueMinimo: Math.max(1, form.estoqueMinimo - 1) })}
                                            className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-rose-500/20 text-white rounded-2xl transition-all active:scale-90 cursor-pointer border border-white/5"
                                        >
                                            <span className="text-2xl font-light">-</span>
                                        </button>

                                        <input
                                            type="text"
                                            className="w-20 bg-transparent text-center text-xl font-black text-white outline-none"
                                            value={form.estoqueMinimo}
                                            onChange={e => setForm({ ...form, estoqueMinimo: Number(e.target.value) })}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, estoqueMinimo: form.estoqueMinimo + 1 })}
                                            className="w-14 h-14 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all active:scale-90 cursor-pointer shadow-lg shadow-indigo-600/20"
                                        >
                                            <Plus size={20} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Unidade de Medida</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/5 p-6 rounded-[1.5rem] text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all uppercase"
                                        placeholder="UN, KG, LT, CX"
                                        value={form.unidade}
                                        onChange={e => setForm({ ...form, unidade: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Setor/Categoria</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/5 p-6 rounded-[1.5rem] text-sm font-bold text-white outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
                                        value={form.categoriaId}
                                        onChange={e => setForm({ ...form, categoriaId: e.target.value })}
                                    >
                                        <option value="">SELECIONAR...</option>
                                        {categorias.map(c => <option key={c.id} value={c.id} className="bg-[#0c0c0e]">{c.nome}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-4">Link da Mídia (Imagem)</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/5 p-6 rounded-[1.5rem] text-sm font-bold text-white outline-none focus:border-indigo-500/50 transition-all"
                                        placeholder="https://..."
                                        value={form.imagem}
                                        onChange={e => setForm({ ...form, imagem: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-6 mt-14">
                                <button onClick={fecharModal} className="flex-1 p-6 text-[11px] font-black uppercase text-slate-500 hover:text-white transition-colors cursor-pointer">Descartar</button>
                                <button
                                    onClick={handleSalvarProduto}
                                    disabled={isSaving}
                                    className="flex-[2] bg-indigo-600 hover:bg-indigo-500 p-6 rounded-2xl text-[11px] font-black uppercase text-white flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={3} />} Salvar no Inventário
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCatModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-[#0c0c0e] border border-white/10 w-full max-w-md rounded-[3rem] p-10 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Sectors</h2>
                                <button onClick={() => setShowCatModal(false)} className="p-3 hover:bg-white/5 rounded-xl cursor-pointer"><X size={20} /></button>
                            </div>
                            <div className="flex gap-3 mb-8">
                                <input
                                    placeholder="NOME DO SETOR..."
                                    className="flex-1 bg-white/5 border border-white/5 p-5 rounded-2xl text-[10px] font-black text-white outline-none focus:border-indigo-500 uppercase"
                                    value={nomeNovaCat}
                                    onChange={e => setNomeNovaCat(e.target.value)}
                                />
                                <button onClick={handleAddCategoria} className="bg-indigo-600 p-5 rounded-2xl hover:bg-indigo-500 transition-all text-white cursor-pointer"><Plus size={20} /></button>
                            </div>
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-3 custom-scroll">
                                {categorias.map(c => (
                                    <div key={c.id} className="flex justify-between items-center p-5 bg-white/[0.03] border border-white/5 rounded-[1.5rem] group hover:bg-white/[0.06] transition-all">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white">{c.nome}</span>
                                        <button
                                            onClick={() => { if (confirm('Excluir categoria?')) DeletarCategoria(c.id).then(carregarDados) }}
                                            className="p-2 text-slate-700 hover:text-rose-500 transition-colors cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCartModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[250] flex justify-end"
                    >
                        <div className="absolute inset-0" onClick={() => setShowCartModal(false)} />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="relative h-full w-full max-w-xl bg-[#0c0c0e] border-l border-white/10 p-10 lg:p-14 shadow-[-50px_0_100px_rgba(0,0,0,0.8)] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-16">
                                <div>
                                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Cart <span className="text-amber-500">Summary</span></h2>
                                    <p className="text-[10px] font-black text-slate-600 tracking-[0.4em] uppercase mt-2">Protocolo de Aquisição</p>
                                </div>
                                <button
                                    onClick={() => setShowCartModal(false)}
                                    className="p-4 bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 rounded-2xl transition-all cursor-pointer"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scroll">
                                {itensNoCarrinho.length > 0 ? (
                                    itensNoCarrinho.map((item) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={item.id}
                                            className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] flex items-center justify-between group hover:border-amber-500/30 transition-all"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                                                    <Package size={24} className="text-amber-500/50" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-white uppercase italic tracking-tight mb-1">
                                                        {item.nome}
                                                    </h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] font-black text-indigo-500 uppercase px-2 py-0.5 bg-indigo-500/10 rounded">
                                                            {item.quantidadeAtual} {item.unidade} em estoque
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={async () => {
                                                    const res = await RemoverDaLista(item.produtoId);
                                                    if (res.success) carregarDados();
                                                }}
                                                className="p-4 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all cursor-pointer"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center">
                                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                                            <ShoppingCart size={32} className="text-slate-800" />
                                        </div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-700">Carrinho Vazio</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-12 pt-12 border-t border-white/5">
                                <button
                                    disabled={itensNoCarrinho.length === 0}
                                    onClick={async () => {
                                        const res = await ConfirmarCarrinhoParaLista();
                                        if (res.success) {
                                            toast.success("Lista enviada para o setor de compras!");
                                            setShowCartModal(false);
                                            carregarDados();
                                        }
                                    }}
                                    className="w-full bg-white text-black p-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-amber-500 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-10 cursor-pointer active:scale-95 group"
                                >
                                    Confirmar Pedido <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}