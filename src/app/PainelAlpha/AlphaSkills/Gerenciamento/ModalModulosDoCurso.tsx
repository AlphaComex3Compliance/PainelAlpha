"use client";

import { useState } from 'react';
import { X, PlayCircle, Unlink, BookOpen, FolderKanban, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { desvincularModuloDeCurso } from '@/actions/Cursos';
import Image from 'next/image';
import { toast } from 'sonner';

interface Modulo {
    id: string;
    nome: string;
    imagemUrl?: string | null;
    aprendizado?: string | null;
    setor?: string | null;
    ordemNoCurso?: number;
}

interface Curso {
    id: string;
    nome: string;
    capa?: string | null;
    setores: string[];
    modulos: Modulo[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    curso: Curso | null;
    onVerAulas: (modulo: Modulo) => void;
    onSuccess: () => void;
}

export default function ModalModulosDoCurso({ isOpen, onClose, curso, onVerAulas, onSuccess }: Props) {
    const [removendoId, setRemovendoId] = useState<string | null>(null);

    if (!isOpen || !curso) return null;

    const handleRemover = async (moduloId: string, moduloNome: string) => {
        setRemovendoId(moduloId);
        try {
            const res = await desvincularModuloDeCurso(curso.id, moduloId);
            if (res.success) {
                toast.success(`"${moduloNome}" removido do curso.`);
                onSuccess();
            } else {
                toast.error('Erro ao remover módulo.');
            }
        } catch {
            toast.error('Erro ao remover módulo.');
        } finally {
            setRemovendoId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-[#0A0A0A] border border-white/10 rounded-[3rem] max-w-xl w-full flex flex-col max-h-[85vh] overflow-hidden shadow-2xl"
            >
                <div className="p-6 border-b border-white/5 bg-[#0F0F0F] flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {curso.capa
                            ? <Image src={curso.capa} alt={curso.nome} fill className="object-cover" unoptimized />
                            : <BookOpen size={22} className="text-orange-500" />
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-orange-500/70 uppercase tracking-widest">Módulos do Curso</p>
                        <h3 className="text-sm font-black text-white uppercase italic truncate">{curso.nome}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {curso.setores.map(s => (
                                <span key={s} className="text-[7px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full font-black uppercase">{s}</span>
                            ))}
                            <span className="text-[7px] bg-white/5 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase">
                                {curso.modulos.length} módulo{curso.modulos.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                    {curso.modulos.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3">
                            <FolderKanban size={32} className="text-slate-800" />
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Nenhum módulo neste curso</p>
                        </div>
                    ) : (
                        curso.modulos.map((mod) => (
                            <div
                                key={mod.id}
                                className="group flex items-center gap-4 p-4 bg-[#111] border border-white/5 rounded-[2rem] hover:border-orange-500/20 transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                    {mod.imagemUrl
                                        ? <img src={mod.imagemUrl} alt="" className="w-full h-full object-cover" />
                                        : <FolderKanban size={18} className="text-slate-700" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[11px] font-black text-white uppercase truncate">{mod.nome}</h4>
                                    {mod.aprendizado && (
                                        <p className="text-[9px] text-slate-600 truncate mt-0.5">{mod.aprendizado}</p>
                                    )}
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => { onVerAulas(mod); onClose(); }}
                                        title="Ver aulas do módulo"
                                        className="p-2.5 bg-white/5 hover:bg-orange-600 text-slate-500 hover:text-white rounded-xl transition-all cursor-pointer border border-white/5"
                                    >
                                        <PlayCircle size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleRemover(mod.id, mod.nome)}
                                        disabled={removendoId === mod.id}
                                        title="Remover do curso"
                                        className="p-2.5 bg-white/5 hover:bg-red-600 text-slate-500 hover:text-white rounded-xl transition-all cursor-pointer border border-white/5 disabled:opacity-50"
                                    >
                                        {removendoId === mod.id
                                            ? <Loader2 size={14} className="animate-spin" />
                                            : <Unlink size={14} />
                                        }
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
}
