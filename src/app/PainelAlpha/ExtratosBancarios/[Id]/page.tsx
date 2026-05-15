"use client";

import React, { useEffect, useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Download,
    PlusCircle,
    Database,
    MapPin,
    Calendar,
    Loader2,
    ShieldCheck,
    Upload,
    TrendingUp,
    Trash2,
    AlertCircle,
    X,
    Eye,
    Filter,
    Search,
    Layers,
    Minus,
    Plus,
    EyeIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BuscarEmpresaPorId } from '@/actions/Extratos';
import { AtualizarAnotacaoBanco, ExcluirBancoVinculado, VincularNovoBanco } from '@/actions/bancos';
import { CriarNovoPeriodo } from '@/actions/periodos';
import ModalAdicionarBanco from './Modais/ModalBanco';
import ModalCriarPeriodo from './Modais/ModalCriarPeriodo';
import { toast } from 'sonner';
import ModalUploadExtrato from './Modais/ModalUploadExtrato';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import PainelConferencia from './Modais/ModalExtratos';
import PainelTransacoes from './Modais/ModalTransacoes';

interface PageProps {
    params: Promise<{ Id: string }>;
}

interface Transacao {
    id: string;
    data: Date | string;
    descricao: string;
    valor: number;
    bancoId?: string;
    mesReferencia: string;
    selecionado: boolean;
    BancosVinculados: {
        nomeBanco: string;
    };
}

const exportarRelatorioExcel = async (transacoes: any[], razaoSocial: string, cnpj: string) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório Radar');

    const paletaCores = [
        'FFF1F5FE',
        'FFFFF1F1',
        'FFF0FDF4',
        'FFFFFEF2',
        'FFF5F3FF',
        'FFFFF7ED',
        'FFECFEFF',
    ];

    const bancoCores: Record<string, string> = {};
    let corIndex = 0;

    transacoes.forEach(t => {
        const nome = (t.nomeBanco || "BANCO").toUpperCase();
        if (!bancoCores[nome]) {
            bancoCores[nome] = paletaCores[corIndex % paletaCores.length];
            corIndex++;
        }
    });

    worksheet.columns = [
        { key: 'mes', width: 20 },
        { key: 'banco', width: 22 },
        { key: 'data', width: 15 },
        { key: 'descricao', width: 55 },
        { key: 'valor', width: 18 },
        { key: 'justificativa', width: 40 },
    ];

    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '15 5160: COMPROVANTE DE TRANSFERENCIA DE RECURSOS DISPONIVEIS (Artigo 6º, I, "c" da Portaria Coana nº 72/2020)';
    titleCell.font = { name: 'Arial', size: 10, bold: true };

    worksheet.getCell('A2').value = 'EMPRESA:';
    worksheet.getCell('B2').value = razaoSocial?.toUpperCase() || "NOME NÃO INFORMADO";
    worksheet.getCell('A3').value = 'CNPJ:';
    worksheet.getCell('B3').value = cnpj || "CNPJ NÃO INFORMADO";
    [worksheet.getCell('A2'), worksheet.getCell('A3')].forEach(c => c.font = { bold: true });

    const headerRow = worksheet.getRow(5);
    headerRow.values = ['MÊS REF.', 'BANCO', 'DATA', 'DESCRIÇÃO', 'VALOR (R$)', 'JUSTIFICATIVA'];
    headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '475569' } };
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    const dadosOrdenados = [...transacoes].sort((a, b) => {
        const converterDataRef = (ref: string) => {
            const [mes, ano] = ref.split('/');
            const meses: any = { 'Janeiro': '01', 'Fevereiro': '02', 'Março': '03', 'Abril': '04', 'Maio': '05', 'Junho': '06', 'Julho': '07', 'Agosto': '08', 'Setembro': '09', 'Outubro': '10', 'Novembro': '11', 'Dezembro': '12' };
            return `${ano}${meses[mes] || '00'}`;
        };
        const refA = converterDataRef(a.mesReferencia);
        const refB = converterDataRef(b.mesReferencia);

        if (refA !== refB) return refB.localeCompare(refA);
        if (a.nomeBanco !== b.nomeBanco) return a.nomeBanco.localeCompare(b.nomeBanco);
        return new Date(a.data).getTime() - new Date(b.data).getTime();
    });

    dadosOrdenados.forEach((t) => {
        const nomeBanco = (t.nomeBanco || "BANCO").toUpperCase();
        const corHex = bancoCores[nomeBanco];

        const row = worksheet.addRow({
            mes: t.mesReferencia.toUpperCase(),
            banco: nomeBanco,
            data: t.data ? String(t.data).toUpperCase() : "",
            descricao: (t.descricao || "").toUpperCase(),
            valor: Number(t.valor || 0),
            justificativa: ""
        });

        row.eachCell((cell, colNumber) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };

            if (colNumber === 1) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '94a3b8' } };
                cell.font = { color: { argb: 'FFFFFF' }, bold: true };
            } else {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: corHex } };
                if (colNumber === 5) {
                    cell.numFmt = '"R$ " #,##0.00';
                    cell.alignment = { horizontal: 'right' };
                    cell.font = { bold: true, color: { argb: Number(t.valor) < 0 ? 'BE123C' : '000000' } };
                }
            }
        });
    });

    let inicioMergeMes = 6;
    let inicioMergeBanco = 6;

    for (let i = 6; i <= worksheet.rowCount; i++) {
        const mesAtual = worksheet.getCell(`A${i}`).value;
        const mesProximo = i < worksheet.rowCount ? worksheet.getCell(`A${i + 1}`).value : null;
        const bancoAtual = worksheet.getCell(`B${i}`).value;
        const bancoProximo = i < worksheet.rowCount ? worksheet.getCell(`B${i + 1}`).value : null;

        if (mesAtual !== mesProximo) {
            if (i > inicioMergeMes) worksheet.mergeCells(`A${inicioMergeMes}:A${i}`);
            inicioMergeMes = i + 1;
        }

        if (bancoAtual !== bancoProximo || mesAtual !== mesProximo) {
            if (i > inicioMergeBanco) worksheet.mergeCells(`B${inicioMergeBanco}:B${i}`);
            inicioMergeBanco = i + 1;
        }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Relatorio_Radar_${razaoSocial.replace(/\s+/g, '_')}.xlsx`);
};



export default function DetalhesEmpresa({ params }: PageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const idDaURL = resolvedParams.Id;

    const [linhasExtraidas, setLinhasExtraidas] = useState<Transacao[]>([]);

    const [empresa, setEmpresa] = useState<any>(null);
    const [carregando, setCarregando] = useState(true);
    const [modalBancoAberto, setModalBancoAberto] = useState(false);
    const [modalPeriodoAberto, setModalPeriodoAberto] = useState(false);
    const [periodoSelecionadoId, setPeriodoSelecionadoId] = useState<number | null>(null);
    const [modalOCRAberto, setModalOCRAberto] = useState(false);
    const [contextoOCR, setContextoOCR] = useState<any>(null);
    const [periodosAbertos, setPeriodosAbertos] = useState<number[]>([]);
    const [bancoParaExcluir, setBancoParaExcluir] = useState<any>(null);
    const [dadosBancosCache, setDadosBancosCache] = useState<Record<string, Transacao[]>>({});
    const [showPreview, setShowPreview] = useState(false);
    const [modalVisualizarSalvos, setModalVisualizarSalvos] = useState(false);
    const [bancoSelecionadoId, setBancoSelecionadoId] = useState<number | null>(null);



    const atualizarCacheBanco = (bancoId: string, bancoNome: string, mesRef: string, linhas: any[]) => {
        const novosDados = linhas.map(l => ({
            ...l,
            bancoId: bancoId,
            mesReferencia: mesRef,
            nomeBanco: bancoNome,
            selecionado: true
        }));

        setLinhasExtraidas(prev => {
            const semDuplicados = prev.filter(item =>
                !(item.bancoId === bancoId && item.mesReferencia === mesRef)
            );

            const listaFinal = [...semDuplicados, ...novosDados];

            (window as any).backupDados = listaFinal;

            console.log("CONTEÚDO DO ESTADO AGORA:", listaFinal);
            return listaFinal;
        });

        toast.success(`Dados de ${mesRef} adicionados com sucesso.`);
    };



    useEffect(() => {
        if (empresa && empresa.periodos) {
            const todasAsTransacoesDoBanco = empresa.periodos.flatMap((periodo: any) =>
                (periodo.bancos || periodo.BancosVinculados || []).flatMap((banco: any) =>
                    (banco.transacoes || banco.Transacoes || []).map((t: any) => ({
                        ...t,
                        bancoId: banco.id,
                        mesReferencia: `${periodo.mes}/${periodo.ano}`,
                        nomeBanco: banco.nomeBanco || banco.nome,
                        selecionado: true
                    }))
                )
            );
            setLinhasExtraidas(todasAsTransacoesDoBanco);
        }
    }, [empresa]);

    const togglePeriodo = (id: number) => {
        setPeriodosAbertos(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const carregarDados = async () => {
        if (!idDaURL) return;
        try {
            const res = await BuscarEmpresaPorId(idDaURL);
            if (res.success) setEmpresa(res.data);
            else router.push('/PainelAlpha/ExtratosBancarios');
        } catch (err) {
            toast.error("Erro de conexão");
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, [idDaURL]);

    const handleCriarPeriodo = async (dados: { mes: string, ano: string }) => {
        const res = await CriarNovoPeriodo(dados.mes, dados.ano, Number(idDaURL));
        if (res.success) {
            toast.success("Período criado");
            setModalPeriodoAberto(false);
            carregarDados();
        }
    };

    const handleSalvarBanco = async (dados: { bancoSel: any, descricao: string }) => {
        try {
            if (!periodoSelecionadoId) return;
            const res = await VincularNovoBanco({
                bancoId: dados.bancoSel.id,
                nome: dados.bancoSel.nome,
                logo: dados.bancoSel.logo,
                descricao: dados.descricao,
                periodoId: Number(periodoSelecionadoId)
            });
            if (res.success) {
                toast.success("Banco vinculado!");
                setModalBancoAberto(false);
                carregarDados();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fecharModalECleanup = () => {
        setModalOCRAberto(false);
        setContextoOCR(null);
        setShowPreview(false)
    };

    return (
        <div className="min-h-screen bg-[#020617]">
            {carregando || !empresa ? (
                <div className="flex flex-col items-center justify-center h-screen">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-200 p-4 md:p-8 font-sans">
                    <div className="max-w-[1400px] mx-auto space-y-10">
                        {/* HEADER PREMIUM RESTAURADO */}
                        <header className="relative overflow-hidden bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl">
                            <button onClick={() => router.back()} className="cursor-pointer group flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-all mb-10 uppercase text-[10px] font-black tracking-widest">
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                Voltar para listagem
                            </button>

                            <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                                <div className="space-y-6">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-xl text-[14px] font-black uppercase tracking-tighter border border-indigo-500/20 flex items-center gap-2">
                                            <ShieldCheck size={12} />
                                            {empresa.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}
                                        </div>
                                        <div className="px-4 py-1.5 bg-slate-800/80 text-slate-400 rounded-xl text-[14px] font-black uppercase tracking-tighter border border-white/5">
                                            {empresa.regimeTributario}
                                        </div>
                                    </div>
                                    <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">{empresa.razaoSocial}</h1>
                                    <h1 className="md:text-2xl font-bold text-gray-600 italic tracking-tighter leading-none">{empresa.nomeFantasia}</h1>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-800/50 rounded-2xl border border-white/5"><MapPin size={18} className="text-indigo-500" /></div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Localização</span>
                                                <span className="text-sm font-bold text-slate-200 uppercase tracking-tighter">{empresa.municipio} / {empresa.uf}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-800/50 rounded-2xl border border-white/5"><Calendar size={18} className="text-indigo-500" /></div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Constituição</span>
                                                <span className="text-sm font-bold text-slate-200 uppercase tracking-tighter">{empresa.dataConstituicao}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowPreview(true)}
                                    className="cursor-pointer group relative flex items-center justify-center px-6 py-3 font-bold text-white transition-all duration-300 bg-slate-800 rounded-xl hover:bg-slate-900 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <div className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-r from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />


                                    <Eye size={20} className="mr-2 text-blue-400 group-hover:scale-110 transition-transform" />
                                    <span className="tracking-wide">Visualizar e Exportar Relatório</span>
                                </button>
                            </div>
                        </header>

                        <button
                            onClick={() => setModalPeriodoAberto(true)}
                            className="w-full group relative overflow-hidden bg-indigo-600 p-10 rounded-[3rem] hover:bg-indigo-500 transition-all duration-500 shadow-2xl shadow-indigo-900/20 active:scale-[0.99]"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                                <TrendingUp size={120} />
                            </div>
                            <div className="cursor-pointer relative z-10 flex items-center justify-between">
                                <div className="text-left space-y-1">
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter group-hover:translate-x-2 transition-transform">+ Adicionar Mês de Análise</h3>
                                    <p className="text-[11px] text-indigo-100 uppercase font-bold tracking-[0.3em] opacity-70 italic">Clique para iniciar um novo ciclo cronológico de extratos</p>
                                </div>
                                <div className="h-16 w-16 rounded-3xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md border border-white/30">
                                    <PlusCircle size={32} />
                                </div>
                            </div>
                        </button>

                        <div className="space-y-6">
                            {empresa?.periodos?.map((periodo: any) => {
                                const estaAberto = periodosAbertos.includes(periodo.id);
                                return (
                                    <div key={periodo.id} className="flex flex-col">
                                        <div
                                            onClick={() => togglePeriodo(periodo.id)}
                                            className={`cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 px-10 py-8 bg-slate-900/60 border ${estaAberto ? 'border-indigo-500/40' : 'border-white/5'} rounded-[3rem] backdrop-blur-xl relative overflow-hidden transition-all duration-500 group`}
                                        >
                                            <div className={`absolute top-0 left-0 h-full w-1 transition-all duration-500 ${estaAberto ? 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-slate-700'}`} />
                                            <div className="flex items-center gap-6">
                                                <div className={`h-16 w-16 rounded-3xl flex items-center justify-center transition-all duration-500 ${estaAberto ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                                    <Calendar size={32} />
                                                </div>
                                                <div>
                                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                                                        {periodo.mes} <span className="text-indigo-500">/ {periodo.ano}</span>
                                                    </h3>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1 italic">
                                                        {periodo.bancos?.length || 0} Instituições Vinculadas
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPeriodoSelecionadoId(periodo.id);
                                                        setModalBancoAberto(true);
                                                    }}
                                                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-[10px] font-black text-white uppercase tracking-[0.2em] rounded-2xl border border-white/10 transition-all active:scale-95"
                                                >
                                                    <Database size={16} className="text-indigo-400" /> Vincular Instituição
                                                </button>
                                                <div className={`transition-transform duration-500 text-slate-500 ${estaAberto ? 'rotate-180' : ''}`}>
                                                    <TrendingUp size={24} className="opacity-20" />
                                                </div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {estaAberto && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                    <div className="grid grid-cols-1 gap-4 pl-12 border-l-2 border-indigo-500/20 ml-16 mt-6 pb-10">
                                                        {periodo.bancos?.length > 0 ? (
                                                            periodo.bancos.map((banco: any) => (
                                                                <motion.div key={banco.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="group bg-slate-900/30 border border-white/5 rounded-[2.5rem] p-6 hover:bg-slate-900/50 hover:border-indigo-500/30 transition-all flex flex-col xl:flex-row items-center justify-between gap-6">
                                                                    <div className="flex items-center gap-6 flex-1 w-full">
                                                                        <div className="h-20 w-20 rounded-[1.5rem] bg-white/5 border border-white/10 p-4 flex items-center justify-center shadow-2xl group-hover:border-indigo-500/50 transition-colors">
                                                                            <img src={banco.logo} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" alt={banco.nomeBanco} />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{banco.nomeBanco}</h4>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                                <p className="text-[14px] text-slate-500 font-bold uppercase tracking-widest">{banco.descricao || "Conta Principal"}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                                                                        <div className="flex items-center gap-3">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setContextoOCR({
                                                                                        bancoId: banco.id,
                                                                                        banco: banco.nomeBanco,
                                                                                        mes: `${periodo.mes}/${periodo.ano}`
                                                                                    });
                                                                                    setModalOCRAberto(true);
                                                                                }}
                                                                                className="cursor-pointer h-14 w-14 flex items-center justify-center bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-2xl transition-all shadow-lg"
                                                                            >
                                                                                <Upload size={20} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setBancoSelecionadoId(Number(banco.id));
                                                                                    setModalVisualizarSalvos(true);
                                                                                }}
                                                                                className="group flex items-center gap-2 p-2.5 bg-emerald-500/5 hover:bg-emerald-500/20 border border-emerald-500/10 hover:border-emerald-500/40 rounded-xl transition-all duration-300"
                                                                                title="Ver dados salvos neste banco"
                                                                            >
                                                                                <Database size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                                                                    Dados Salvos
                                                                                </span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setBancoParaExcluir(banco)}
                                                                                className="cursor-pointer h-14 w-14 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl transition-all border border-rose-500/20 group/delete"
                                                                            >
                                                                                <Trash2 size={20} className="group-hover/delete:scale-110 transition-transform" />
                                                                            </button>
                                                                            <div className="flex-1 xl:flex-none px-6 py-4 bg-black/40 rounded-2xl border border-white/5 min-w-[280px] lg:min-w-[400px]">
                                                                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Anotação Interna</span>
                                                                                <input
                                                                                    type="text"
                                                                                    defaultValue={banco.anotacao || ""}
                                                                                    onBlur={async (e) => {
                                                                                        if (e.target.value !== banco.anotacao) {
                                                                                            const res = await AtualizarAnotacaoBanco(banco.id, e.target.value);
                                                                                            if (res.success) toast.success("Nota salva");
                                                                                        }
                                                                                    }}
                                                                                    placeholder="Clique para adicionar uma nota..."
                                                                                    className="bg-transparent border-none p-0 text-[11px] font-bold text-slate-300 focus:ring-0 w-full uppercase"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            ))
                                                        ) : (
                                                            <div className="py-10 px-10 border-2 border-dashed border-white/5 rounded-[3rem] text-left">
                                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-relaxed">Nenhuma conta vinculada.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}

            <ModalAdicionarBanco isOpen={modalBancoAberto} onClose={() => setModalBancoAberto(false)} onSave={handleSalvarBanco} />
            <ModalCriarPeriodo isOpen={modalPeriodoAberto} onClose={() => setModalPeriodoAberto(false)} onSave={handleCriarPeriodo} />
            <ModalUploadExtrato
                isOpen={modalOCRAberto}
                onClose={() => setModalOCRAberto(false)}
                dadosContexto={contextoOCR}
                onGuardarDados={(linhas: any[]) => atualizarCacheBanco(contextoOCR.bancoId, contextoOCR.banco, contextoOCR.mes, linhas)}
            />

            <AnimatePresence>
                {bancoParaExcluir && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-slate-900 border border-white/10 p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl">
                            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle size={32} /></div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Excluir Instituição?</h3>
                            <p className="text-sm text-slate-400 mb-8 uppercase font-bold text-[10px] tracking-widest">Isso apagará todos os dados vinculados ao <span className="text-white">{bancoParaExcluir.nomeBanco}</span>.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setBancoParaExcluir(null)} className="flex-1 py-4 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Cancelar</button>
                                <button onClick={async () => {
                                    const res = await ExcluirBancoVinculado(bancoParaExcluir.id);
                                    if (res.success) { toast.success("Banco removido"); setBancoParaExcluir(null); carregarDados(); }
                                }} className="flex-1 py-4 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Excluir</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPreview && contextoOCR && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
                        <PainelConferencia
                            isOpen={showPreview}
                            onClose={fecharModalECleanup}
                            empresa={empresa}
                            linhas={linhasExtraidas}
                            setLinhasExtraidas={setLinhasExtraidas}
                            bancoId={Number(contextoOCR.bancoId)}
                            dadosContexto={contextoOCR}
                            onAtualizar={carregarDados}
                            onExport={(dadosFiltrados) => {
                                exportarRelatorioExcel(dadosFiltrados, empresa?.razaoSocial, empresa?.cnpj);
                                setShowPreview(false);
                            }}
                        />
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalVisualizarSalvos && bancoSelecionadoId && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-[#020617] border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
                        >
                            {/* Header do Modal */}
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                        <Database size={20} />
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase italic">Registros no Banco de Dados</h3>
                                </div>
                                <button
                                    onClick={() => setModalVisualizarSalvos(false)}
                                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <PainelTransacoes bancoId={bancoSelecionadoId} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPreview && empresa && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
                        <PainelConferencia
                            empresa={empresa}
                            linhas={linhasExtraidas}
                            setLinhasExtraidas={setLinhasExtraidas}
                            onClose={() => setShowPreview(false)}
                            onExport={(dadosFiltrados) => {
                                exportarRelatorioExcel(dadosFiltrados, empresa.razaoSocial, empresa.cnpj);
                                setShowPreview(false);
                            }}
                        />
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}