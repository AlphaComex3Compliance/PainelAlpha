"use client";

"use client";

import React, { useState } from 'react';
import { X, Search, Laptop, UserCheck, Calendar as CalendarIcon, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from 'sonner';
import { CadastrarCliente } from "@/actions/Clientes";

export default function ModalCadastroCliente({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {

    const [dataContratacao, setDataContratacao] = useState(new Date().toISOString().split('T')[0]);
    const [showServicos, setShowServicos] = useState(false);
    const [showAnalistas, setShowAnalistas] = useState(false);
    const [servicosSelecionados, setServicosSelecionados] = useState<string[]>([]);
    const [analistaSelecionado, setAnalistaSelecionado] = useState("");
    const [isCriandoServico, setIsCriandoServico] = useState(false);
    const [novoServicoNome, setNovoServicoNome] = useState("");
    const [isCriandoAnalista, setIsCriandoAnalista] = useState(false);
    const [novoAnalistaNome, setNovoAnalistaNome] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [dadosEmpresa, setDadosEmpresa] = useState({
        razaoSocial: "",
        nomeFantasia: "",
        dataConstituicao: "",
        uf: "",
        regimeTributario: ""
    });
    const [socios, setSocios] = useState([
        { nome: "", telefone: "", dataNascimento: "", vinculo: "", obs: "" },
        { nome: "", telefone: "", dataNascimento: "", vinculo: "", obs: "" },
        { nome: "", telefone: "", dataNascimento: "", vinculo: "", obs: "" }
    ]);

    const listaServicos = ["Habilitação RADAR - 50K", "Revisão RADAR - 150K", "Revisão RADAR - ILIMITADO", "TTD 409", "Recuperação AFRMM", "Outras Recuperaçoes Tributarias"];
    const listaAnalistas = ["Vitor", "Maria", "Kaline", "Marcelo"];

    const updateSocio = (index: number, field: string, value: string) => {
        const novosSocios = [...socios];
        novosSocios[index] = { ...novosSocios[index], [field]: value };
        setSocios(novosSocios);
    };

    const handleConsultarCNPJ = async () => {
        const cnpjLimpo = cnpj.replace(/\D/g, "");
        if (cnpjLimpo.length !== 14) return toast.error("CNPJ Inválido!");
        setCarregando(true);
        try {
            const res = await fetch(`/api/ReceitaFederal?cnpj=${cnpjLimpo}`);
            const data = await res.json();
            if (data.error) {
                toast.error(data.error);
            } else {
                setDadosEmpresa({
                    razaoSocial: data.razaoSocial,
                    nomeFantasia: data.nomeFantasia,
                    dataConstituicao: data.dataConstituicao,
                    uf: data.uf,
                    regimeTributario: data.regimeTributario
                });
                toast.success("Dados importados!");
            }
        } catch (error) {
            toast.error("Erro ao conectar com a API");
        } finally {
            setCarregando(false);
        }
    };

    const handleFinalizar = async () => {
        if (!dadosEmpresa.razaoSocial || !analistaSelecionado) {
            return toast.error("Preencha o CNPJ e o Analista!");
        }

        const sociosParaEnviar = socios.filter(s => s.nome && s.nome.trim() !== "");

        const temSocioSemVinculo = sociosParaEnviar.some(s => !s.vinculo || s.vinculo.trim() === "");

        if (temSocioSemVinculo) {
            return toast.error("Selecione o Vínculo de todos os sócios preenchidos!");
        }

        setIsSaving(true);

        const payload = {
            cnpj,
            ...dadosEmpresa,
            servicos: servicosSelecionados,
            analistaResponsavel: analistaSelecionado,
            dataContratacao
        };

        const res = await CadastrarCliente(payload, sociosParaEnviar);

        if (res.success) {
            toast.success("Cadastrado!");
            onClose();
            window.location.reload();
        } else {
            toast.error(res.error || "Erro ao salvar");
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-[#0b1220] border border-white/10 w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative custom-scrollbar">

                {/* HEADER */}
                <div className="sticky top-0 bg-[#0b1220]/95 backdrop-blur-md p-8 border-b border-white/5 flex justify-between items-center z-20">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">CADASTRO DE <span className="text-indigo-500">CLIENTE</span></h2>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Integração via API Receita Federal</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"><X size={24} /></button>
                </div>

                <div className="p-8 space-y-8">
                    {/* SEÇÃO 1: CNPJ E DADOS FISCAIS */}
                    <section className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        <div className="md:col-span-4 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">CNPJ</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="00.000.000/0000-00"
                                    value={cnpj}
                                    onChange={(e) => setCnpj(e.target.value)}
                                    className="w-full bg-slate-950 border border-indigo-500/30 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-indigo-500 transition-all"
                                />
                                <button
                                    onClick={handleConsultarCNPJ}
                                    disabled={carregando}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {carregando ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <Search size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-8 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Razão Social</label>
                            <input
                                disabled
                                value={dadosEmpresa.razaoSocial}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-400 cursor-not-allowed"
                                placeholder="Consultar CNPJ..."
                            />
                        </div>

                        <div className="md:col-span-6 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Nome Fantasia</label>
                            <input
                                disabled
                                value={dadosEmpresa.nomeFantasia}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-400 cursor-not-allowed"
                            />
                        </div>

                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Data Constituição</label>
                            <input
                                disabled
                                value={dadosEmpresa.dataConstituicao}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-400 cursor-not-allowed"
                            />
                        </div>

                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">UF / Regime</label>
                            <input
                                disabled
                                value={dadosEmpresa.uf && dadosEmpresa.regimeTributario ? `${dadosEmpresa.uf} - ${dadosEmpresa.regimeTributario}` : ""}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-slate-400 cursor-not-allowed"
                            />
                        </div>
                    </section>


                    {/* SEÇÃO 2: OPERACIONAL (BOTÕES FUNCIONAIS) */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                        <div

                            className="space-y-2 relative">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                                Serviços ({servicosSelecionados.length})
                            </label>
                            <button
                                onClick={() => setShowServicos(!showServicos)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-300 flex justify-between items-center hover:border-indigo-500/50 transition-all"
                            >
                                {servicosSelecionados.length > 0 ? servicosSelecionados.join(", ") : "Selecionar Serviço"}
                                <Laptop size={16} className="text-indigo-500 shrink-0 ml-2" />
                            </button>

                            {showServicos && (
                                <div className="absolute top-full mt-2 w-full bg-slate-900 border border-white/10 rounded-2xl p-4 z-30 shadow-2xl animate-in zoom-in-95 duration-200">
                                    <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                                        {listaServicos.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => {
                                                    setServicosSelecionados([s]);
                                                    setShowServicos(false);
                                                }}
                                                className="w-full text-left p-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-indigo-400 transition-all"
                                            >
                                                {s}
                                            </button>
                                        ))}

                                        {!isCriandoServico ? (
                                            <button
                                                onClick={() => setIsCriandoServico(true)}
                                                className="w-full text-left p-3 rounded-xl text-xs font-black text-emerald-500 hover:bg-emerald-500/10 transition-all flex items-center gap-2 border-t border-white/5 mt-2"
                                            >
                                                <Plus size={14} /> NOVO SERVIÇO
                                            </button>
                                        ) : (
                                            <div className="mt-2 p-2 border-t border-white/5 space-y-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Nome do serviço..."
                                                    value={novoServicoNome}
                                                    onChange={(e) => setNovoServicoNome(e.target.value)}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (novoServicoNome) {
                                                                setServicosSelecionados([novoServicoNome]);
                                                                setShowServicos(false);
                                                                setIsCriandoServico(false);
                                                                setNovoServicoNome("");
                                                            }
                                                        }}
                                                        className="flex-1 bg-emerald-600 text-white text-[9px] font-black p-2 rounded-lg uppercase"
                                                    >
                                                        Confirmar
                                                    </button>
                                                    <button
                                                        onClick={() => setIsCriandoServico(false)}
                                                        className="bg-slate-800 text-slate-400 text-[9px] font-black p-2 rounded-lg uppercase"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Analista Responsável</label>
                            <button
                                onClick={() => { setShowAnalistas(!showAnalistas); setIsCriandoAnalista(false); }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-300 flex justify-between items-center hover:border-indigo-500/50 transition-all"
                            >
                                {analistaSelecionado || "Escolher Analista"} <UserCheck size={16} className="text-indigo-500" />
                            </button>

                            {/* SUB-MODAL ANALISTAS */}
                            {showAnalistas && (
                                <div className="absolute top-full mt-2 w-full bg-slate-900 border border-white/10 rounded-2xl p-4 z-30 shadow-2xl animate-in zoom-in-95 duration-200">
                                    <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                                        {listaAnalistas.map(a => (
                                            <button
                                                key={a}
                                                onClick={() => { setAnalistaSelecionado(a); setShowAnalistas(false); }}
                                                className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all ${analistaSelecionado === a ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-white/5 text-slate-400'}`}
                                            >
                                                {a}
                                            </button>
                                        ))}

                                        {/* OPÇÃO NOVO ANALISTA */}
                                        {!isCriandoAnalista ? (
                                            <button
                                                onClick={() => setIsCriandoAnalista(true)}
                                                className="w-full text-left p-3 rounded-xl text-[10px] font-black text-emerald-500 hover:bg-emerald-500/10 transition-all flex items-center gap-2 border-t border-white/5 mt-2 pt-3"
                                            >
                                                <Plus size={14} /> NOVO ANALISTA
                                            </button>
                                        ) : (
                                            <div className="mt-2 p-2 border-t border-white/5 space-y-2 animate-in slide-in-from-top-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Nome do analista..."
                                                    value={novoAnalistaNome}
                                                    onChange={(e) => setNovoAnalistaNome(e.target.value)}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white outline-none focus:border-emerald-500"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            if (novoAnalistaNome) {
                                                                setAnalistaSelecionado(novoAnalistaNome);
                                                                setShowAnalistas(false);
                                                                setIsCriandoAnalista(false);
                                                                setNovoAnalistaNome("");
                                                            }
                                                        }}
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black p-2 rounded-lg uppercase transition-colors"
                                                    >
                                                        Confirmar
                                                    </button>
                                                    <button
                                                        onClick={() => setIsCriandoAnalista(false)}
                                                        className="bg-slate-800 hover:bg-slate-700 text-slate-400 text-[9px] font-black p-2 rounded-lg uppercase transition-colors"
                                                    >
                                                        Sair
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>


                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Data de Contratação</label>
                            <input type="date" value={dataContratacao} onChange={(e) => setDataContratacao(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-indigo-500 transition-all [color-scheme:dark]" />
                        </div>
                    </section>

                    {/* SEÇÃO 3: TABELA SÓCIOS */}
                    <section className="space-y-4 pt-6 border-t border-white/5">
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                            SÓCIOS / RESPONSÁVEIS
                            <Plus
                                size={12}
                                className="text-indigo-500 cursor-pointer hover:scale-125 transition-transform"
                            />
                        </h3>
                        <div className="bg-slate-950/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 text-[9px] font-black uppercase text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">Nome do Responsável</th>
                                        <th className="px-6 py-4">Telefone / WhatsApp</th>
                                        <th className="px-6 py-4 text-center">Data de Nascimento</th>
                                        <th className="px-6 py-4">Vínculo</th>
                                        <th className="px-6 py-4">Observações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {socios.map((socio, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-2">
                                                <input
                                                    value={socio.nome || ""}
                                                    onChange={(e) => updateSocio(i, "nome", e.target.value)}
                                                    className="w-full bg-transparent border-none text-xs text-white p-2 outline-none placeholder:text-slate-700"
                                                    placeholder="Nome..."
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    value={socio.telefone || ""}
                                                    onChange={(e) => updateSocio(i, "telefone", e.target.value)}
                                                    className="w-full bg-transparent border-none text-xs text-white p-2 outline-none placeholder:text-slate-700"
                                                    placeholder="(00) 00000-0000"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    value={socio.dataNascimento || ""}
                                                    onChange={(e) => updateSocio(i, "dataNascimento", e.target.value)}
                                                    className="w-full bg-transparent border-none text-xs text-center text-white p-2 outline-none placeholder:text-slate-700"
                                                    placeholder="DD/MM/AAAA"
                                                />
                                            </td>

                                            <td className="px-4 py-2">
                                                <select
                                                    required
                                                    value={socio.vinculo || ""}
                                                    onChange={(e) => updateSocio(i, "vinculo", e.target.value)}
                                                    className="w-full bg-transparent border-none text-xs text-white p-2 outline-none cursor-pointer appearance-none focus:ring-0"
                                                >
                                                    <option value="" className="bg-slate-900 text-slate-500">Selecione...</option>
                                                    <option value="Sócio Proprietário" className="bg-slate-900">Sócio Proprietário</option>
                                                    <option value="Sócio Oculto" className="bg-slate-900">Sócio Oculto</option>
                                                    <option value="Funcionário/Colaborador" className="bg-slate-900">Funcionário/Colaborador</option>
                                                    <option value="Contador Interno" className="bg-slate-900">Contador Interno</option>
                                                    <option value="Contador Externo" className="bg-slate-900">Contador Externo</option>
                                                    <option value="Despachante Aduaneiro" className="bg-slate-900">Despachante Aduaneiro</option>
                                                    <option value="Outro" className="bg-slate-900">Outro</option>
                                                </select>
                                            </td>

                                            <td className="px-4 py-2">
                                                <input
                                                    value={socio.obs || ""}
                                                    onChange={(e) => updateSocio(i, "obs", e.target.value)}
                                                    className="w-full bg-transparent border-none text-xs text-white p-2 outline-none placeholder:text-slate-700"
                                                    placeholder="Obs..."
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* RODAPÉ  */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button onClick={onClose} className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Cancelar</button>
                        <button
                            onClick={handleFinalizar}
                            disabled={isSaving}
                            className={`px-12 py-4 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-3
                                    ${isSaving
                                    ? 'bg-indigo-400 cursor-not-allowed opacity-80'
                                    : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95'
                                }`}
                            >
                            {isSaving ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                "Salvar Cliente"
                            )}
                        </button></div>
                </div>
            </div>
        </div>
    );
}
