"use client";

import { useState, useRef, useEffect } from "react";
import { FileUp, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { protocolarNoRadarAction } from "@/actions/RadarFiscal";

export function BotaoUploadExcel() {
    const [processando, setProcessando] = useState(false);
    const [progresso, setProgresso] = useState({ atual: 0, total: 0 });
    const [segundosRestantes, setSegundosRestantes] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (segundosRestantes > 0) {
            interval = setInterval(() => {
                setSegundosRestantes((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [segundosRestantes]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProcessando(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                const cnpjs = json
                    .map(row => {
                        const key = Object.keys(row).find(k => k.toLowerCase() === 'cnpj');
                        return key ? String(row[key]).replace(/\D/g, "") : null;
                    })
                    .filter(cnpj => cnpj && cnpj.length === 14);

                if (cnpjs.length === 0) {
                    toast.error("NENHUM CNPJ VÁLIDO ENCONTRADO");
                    setProcessando(false);
                    return;
                }

                setProgresso({ atual: 0, total: cnpjs.length });

                for (let i = 0; i < cnpjs.length; i++) {
                    const cnpjAtual = cnpjs[i];
                    setProgresso(prev => ({ ...prev, atual: i + 1 }));
                    
                    try {
                        const response = await fetch(`/api/RadarFiscal?cnpj=${cnpjAtual}`);
                        
                        if (!response.ok) {
                            if (response.status === 429) {
                                toast.error("LIMITE DA RECEITA ATINGIDO. AGUARDANDO...");
                            } else {
                                throw new Error(`Erro ${response.status}`);
                            }
                        } else {
                            const dadosBrutos = await response.json();
                            if (dadosBrutos && !dadosBrutos.error) {
                                await protocolarNoRadarAction(dadosBrutos);
                                toast.success(`CNPJ ${cnpjAtual} PROTOCOLADO`);
                            } else {
                                toast.error(`ERRO NO CNPJ ${cnpjAtual}`);
                            }
                        }
                    } catch (err: any) {
                        console.error(`Erro no processamento do CNPJ ${cnpjAtual}:`, err);
                    }

                    if (i < cnpjs.length - 1) {
                        setSegundosRestantes(61);
                        await new Promise(r => setTimeout(r, 61000));
                    }
                }

                toast.success("LOTE FINALIZADO COM SUCESSO!");
            } catch (error) {
                toast.error("ERRO CRÍTICO AO LER PLANILHA");
            } finally {
                setProcessando(false);
                setSegundosRestantes(0);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={processando}
                className="cursor-pointer h-14 px-6 bg-emerald-600/10 border border-emerald-600/20 text-emerald-500 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-80 disabled:cursor-wait"
            >
                {processando ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        {segundosRestantes > 0 
                            ? `PRÓXIMO EM ${segundosRestantes}S` 
                            : `PROCESSANDO ${progresso.atual}/${progresso.total}`}
                    </>
                ) : (
                    <>
                        <FileUp size={18} /> Upload Excel
                    </>
                )}
            </button>
        </>
    );
}
