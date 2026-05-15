"use client";

import React, { useState, useMemo } from 'react';
import { Search, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import BotaoVoltar from '@/components/BotaoVoltarMinimalista';
import TrilhaCarrossel from './TrilhaCarrossel';
import ModuloModal from './ModuloModal';

export default function AlphaSkillsClient({ session, initialModulos, initialVideos, initialProgresso }: any) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedModulo, setSelectedModulo] = useState<any>(null);

    const isAdmin = session?.user?.role === "Admin";

    const setores = useMemo(() => {
        const grupos = initialModulos.reduce((acc: any, m: any) => {
            const s = m.setor || "Geral";
            if (!acc[s]) acc[s] = [];
            acc[s].push(m);
            return acc;
        }, {});

        return Object.keys(grupos).sort().map(nomeSetor => {
            const itemsOrdenados = grupos[nomeSetor].sort((a: any, b: any) => {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });

            const itemsProcessados = itemsOrdenados.map((mod: any, index: number) => {
                const tituloFormatado = `Módulo ${index + 1}: `;

                if (isAdmin) {
                    return { ...mod, nomeExibicao: tituloFormatado, isLiberado: true };
                }

                if (!mod.bloqueado || index === 0) {
                    return { ...mod, nomeExibicao: tituloFormatado, isLiberado: true };
                }

                const moduloAnterior = itemsOrdenados[index - 1];
                const idRequisito = mod.requerModuloId || moduloAnterior.id;

                const aulasDoRequisito = (initialVideos || []).filter((v: any) =>
                    v.modulo?.some((m: any) => String(m.id) === String(idRequisito))
                );

                if (aulasDoRequisito.length === 0) {
                    return { ...mod, nomeExibicao: tituloFormatado, isLiberado: true };
                }

                const concluidas = (initialProgresso || []).filter((p: any) =>
                    aulasDoRequisito.some((a: any) => String(a.id) === String(p.aulaId)) && p.concluido
                );

                const pct = (concluidas.length / aulasDoRequisito.length) * 100;
                const isLiberado = pct >= (mod.percentualMinimo || 100);

                return {
                    ...mod,
                    nomeExibicao: tituloFormatado, 
                    isLiberado,
                    nomeAnterior: moduloAnterior.nome
                };
            });

            return { nome: nomeSetor, items: itemsProcessados };
        }).filter(s => s.items.length > 0);

    }, [initialModulos, initialVideos, initialProgresso, searchTerm]);

    // Se o módulo anterior não tem aulas, libera para não travar o fluxo
    //if (aulasDoRequisito.length === 0) {
    //     return { ...mod, isLiberado: true };
    // }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden">

            <div className="absolute top-8 left-6 md:left-16 z-[60]">
                <BotaoVoltar />
            </div>

            <div className="fixed inset-0 flex items-center justify-center z-0 pointer-events-none overflow-hidden">
                <div className="absolute w-[800px] h-[800px] bg-orange-600/5 rounded-full blur-[120px]" />

                <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.10, scale: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    src="/Logotipo-1.png"
                    className="w-[90%] max-w-[800px] object-contain filter brightness-200"
                    alt="Alpha Logo Background"
                />
            </div>

            <section className="relative h-[50vh] md:h-[65vh] flex items-center px-6 md:px-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent z-10" />
                <div className="absolute inset-0 opacity-30">
                    <img
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070"
                        className="w-full h-full object-cover scale-110 blur-sm"
                        alt="Background"
                    />
                </div>

                <div className="fixed inset-0 flex items-center justify-center z-0 pointer-events-none overflow-hidden">
                    <div className="absolute w-[800px] h-[800px] bg-orange-600/5 rounded-full blur-[120px]" />
                    <motion.img
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.10, scale: 1 }}
                        src="/Logotipo-1.png"
                        className="w-[90%] max-w-[800px] object-contain filter brightness-200"
                    />
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent z-10" />
                <div className="relative z-20 max-w-3xl">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-6 italic">
                            Alpha<br /><span className="text-orange-500">Skills</span>
                        </h1>
                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="O que quer aprender?"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                />
                            </div>
                            {isAdmin && (
                                <Link href="/PainelAlpha/AlphaSkills/Gerenciamento">
                                    <button className="cursor-pointer bg-white text-black px-6 py-4 rounded-2xl hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2 font-bold uppercase text-xs">
                                        <Settings size={18} /> Gerenciar
                                    </button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            <div className="px-6 md:px-16 -mt-10 md:-mt-20 pb-20 relative z-30 space-y-12 md:space-y-20">
                {setores.map((setor) => (
                    <TrilhaCarrossel
                        key={setor.nome}
                        setor={setor}
                        onSelectModulo={setSelectedModulo}
                    />
                ))}
            </div>

            <AnimatePresence>
                {selectedModulo && (
                    <ModuloModal
                        modulo={selectedModulo}
                        videos={initialVideos}
                        onClose={() => setSelectedModulo(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}