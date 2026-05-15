import { pdf } from '@react-pdf/renderer';
import { FichaAlphaPDF } from './GerarFicha';
import { useEffect, useState } from 'react';
import { upsertConsulta } from '@/actions/PreAnalise';

export const ModalPDF = ({ dados, radarDados, user, isOpen, onClose }: any) => {
    const [dadosManuais, setDadosManuais] = useState({
        dataSituacao: new Date().toLocaleDateString('pt-BR'),
        horaSituacao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        mesProtocolo: new Date().toLocaleDateString('pt-BR', { month: 'long' }),
        telefone: "",
        nomeResponsavel: "",
        observacoes: ""
    });

    const prontoParaPDF = dados.rfb.status === "success" && dados.radar.status !== "loading";




    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const gerarEVisualizar = async () => {
        const radarReal = radarDados?.dados || radarDados;

        const payload = {
            ...dados,
            radar: radarReal,
            extra: dadosManuais,
            telefone: dadosManuais.telefone,
            nomeResponsavel: dadosManuais.nomeResponsavel,
            observacoes: dadosManuais.observacoes,
        };

        console.log("PAYLOAD FINAL PARA O PDF:", payload);

        await upsertConsulta(payload);

        const doc = <FichaAlphaPDF dados={payload} userLogado={user} />;
        const blob = await pdf(doc).toBlob();
        window.open(URL.createObjectURL(blob), '_blank');
    };


    const dataAbertura = dados?.rfb?.dados?.dataConstituicao || "";
    const agora = new Date();

    let maisDe5Anos = false;
    let menosDe5Anos = false;

    if (dataAbertura && dataAbertura.includes("/")) {
        const [dia, mes, ano] = dataAbertura.split("/").map(Number);
        const dataAberturaDoc = new Date(ano, mes - 1, dia);

        let idade = agora.getFullYear() - dataAberturaDoc.getFullYear();
        const m = agora.getMonth() - dataAberturaDoc.getMonth();

        if (m < 0 || (m === 0 && agora.getDate() < dataAberturaDoc.getDate())) {
            idade--;
        }

        maisDe5Anos = idade >= 5;
        menosDe5Anos = idade < 5;
    }


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                <div className="bg-gray-50 px-8 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Finalizar Ficha</h2>
                    <p className="text-xs text-gray-500">Preencha os campos manuais abaixo.</p>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {/* SEÇÃO DE CAMPOS MANUAIS */}
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                        <div className="col-span-2 text-[10px] font-bold text-orange-600 uppercase mb-2">Preenchimento Manual</div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nome do Responsavel da empresa</label>
                            <input
                                type="text"
                                value={dadosManuais.nomeResponsavel}
                                onChange={(e) => setDadosManuais({ ...dadosManuais, nomeResponsavel: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-black border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Telefone</label>
                            <input
                                type="text"
                                value={dadosManuais.telefone}
                                onChange={(e) => setDadosManuais({ ...dadosManuais, telefone: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-black border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Data</label>
                            <input
                                type="text"
                                value={dadosManuais.dataSituacao}
                                onChange={(e) => setDadosManuais({ ...dadosManuais, dataSituacao: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-black border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Hora</label>
                            <input
                                type="text"
                                value={dadosManuais.horaSituacao}
                                onChange={(e) => setDadosManuais({ ...dadosManuais, horaSituacao: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-black border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">mês de protocolo</label>
                            <input
                                type="text"
                                value={dadosManuais.mesProtocolo}
                                onChange={(e) => setDadosManuais({ ...dadosManuais, mesProtocolo: e.target.value })}
                                className="w-full px-3 py-2 bg-white text-black border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>

                    </div>
                    <div className="mt-6">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Observações
                        </label>
                        <textarea
                            rows={4}
                            value={dadosManuais.observacoes}
                            onChange={(e) => setDadosManuais({ ...dadosManuais, observacoes: e.target.value })}
                            placeholder="Digite aqui detalhes relevantes sobre a situação da empresa ou do Radar..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all resize-none placeholder:text-gray-300"
                        />
                        <p className="text-[9px] text-gray-400 mt-1 italic">
                            * Este texto aparecerá na seção final do documento PDF.
                        </p>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Card RFB */}
                    <div className="p-4 rounded-xl border border-gray-100 bg-blue-50/30">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Dados Receita Federal</span>
                        <h3 className="font-semibold text-gray-800 mt-1 truncate">
                            {dados?.rfb?.dados?.razaoSocial || "Empresa não identificada"}
                        </h3>
                        <p className="text-ls text-gray-700 mt-1">Fantasia: {dados?.rfb?.dados?.nomeFantasia || "---"}</p>
                        <p className="text-xs text-gray-500 mt-1">CNPJ: {dados?.rfb?.dados?.cnpj || "---"}</p>
                        <p className="text-xs text-gray-500">UF: {dados?.rfb?.dados?.uf || "--"}</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${maisDe5Anos ? 'border-green-100 bg-green-50/30' : 'border-blue-100 bg-blue-50/30'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Tempo de Constituição</span>
                        <h3 className="font-semibold text-gray-800 mt-1">
                            {maisDe5Anos ? "Mais de 5 Anos" : "Menos de 5 Anos"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Abertura: {dados?.rfb?.dados?.dataConstituicao || "--"}</p>
                    </div>


                    {/* Card Capital Social */}
                    <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Capital Social</span>
                        <h3 className="font-semibold text-gray-800 mt-1">
                            {dados?.rfb?.dados?.capitalSocial
                                ? Number(dados.rfb.dados.capitalSocial).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                : "Não informado"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Valor declarado na Receita Federal do Brazil</p>
                    </div>

                    {/* Card Siscomex (Radar) */}
                    <div className="p-4 rounded-xl border border-orange-100 bg-orange-50/30">
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Consulta Siscomex</span>
                        <h3 className="font-semibold text-gray-800 mt-1 uppercase">
                            {radarDados?.submodalidade || "Não Identificado"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Situação: {radarDados?.situacao || "---"}</p>
                        <p className="text-xs text-gray-500">Data: {radarDados?.dataSituacao || "--"}</p>
                    </div>

                    {/* Card Empresa Aqui */}
                    <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30">
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Empresa Aqui</span>
                        <h3 className="font-semibold text-gray-800 mt-1">
                            {dados?.empresaqui?.dados?.regimeEA || "Regime não informado"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Natureza: {dados?.rfb?.dados?.natureza_juridica || "---"}</p>
                    </div>

                    {/* Card Usuário */}
                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Emitido por</span>
                        <h3 className="font-semibold text-gray-700 mt-1">{user}</h3>
                        <p className="text-xs text-gray-500 mt-1">Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                    </div>

                </div>

                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="cursor-pointer px-6 py-2.5 text-gray-900 font-medium hover:bg-red-500 rounded-lg transition-colors"
                    >
                        Fechar
                    </button>

                    <button
                        onClick={gerarEVisualizar}
                        className="cursor-pointer flex items-center justify-center gap-2 px-8 py-2.5 bg-[#FF6B00] text-white font-bold rounded-lg hover:bg-[#E66000] shadow-lg shadow-orange-200 transition-all transform active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Gerar Documento PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalPDF;