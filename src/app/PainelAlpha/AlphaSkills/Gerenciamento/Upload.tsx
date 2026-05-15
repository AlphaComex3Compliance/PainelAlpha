"use client";

import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, CheckCircle2, Loader2, Tags, Plus, Film, X, FolderPlus, FolderKanban, AlignLeft } from 'lucide-react';
import { createVideo } from '@/actions/GetVideos';
import { getModulos } from '@/actions/GetVideos';
import { toast } from 'sonner';
import { upload } from '@vercel/blob/client';
import ModalModulos from './CriarModulo';
import { useRouter } from 'next/navigation';

export default function SecaoUpload({ onSuccess }: { onSuccess: () => void }) {
    const router = useRouter();
    const videoInputRef = React.useRef<HTMLInputElement>(null);
    const thumbInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbFile, setThumbFile] = useState<File | null>(null);
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");

    const [modulosDisponiveis, setModulosDisponiveis] = useState<any[]>([]);
    const [modulosSelecionados, setModulosSelecionados] = useState<any[]>([]);
    const [showModulos, setShowModulos] = useState(false);
    const [modalModuloOpen, setModalModuloOpen] = useState(false);

    const fetchModulos = async () => {
        const data = await getModulos();
        setModulosDisponiveis(data);
    };

    useEffect(() => {
        fetchModulos();
    }, [modalModuloOpen]);

    const toggleModulo = (modulo: any) => {
        setModulosSelecionados(prev =>
            prev.find(m => m.id === modulo.id)
                ? prev.filter(m => m.id !== modulo.id)
                : [...prev, modulo]
        );
    };

    const handleUpload = async () => {
        if (!videoFile || !titulo || modulosSelecionados.length === 0) {
            toast.error("Preencha o título, vídeo e selecione ao menos um módulo.");
            return;
        }

        setIsUploading(true);
        try {
            const videoBlob = await upload(videoFile.name, videoFile, {
                access: 'public',
                handleUploadUrl: '/api/UploadSkills',
            });

            let thumbUrl = "";
            if (thumbFile) {
                const thumbBlob = await upload(thumbFile.name, thumbFile, {
                    access: 'public',
                    handleUploadUrl: '/api/UploadSkills',
                });
                thumbUrl = thumbBlob.url;
            }

            const size = (videoFile.size / (1024 * 1024)).toFixed(1) + "MB";

            const setoresUnicos = Array.from(new Set(
                modulosSelecionados.flatMap(m => m.setor.split(", "))
            )).join(", ");

            const result = await createVideo({
                titulo,
                setor: setoresUnicos,
                url: videoBlob.url,
                descricao,
                thumbUrl,
                tamanho: size,
                modulosIds: modulosSelecionados.map(m => m.id)
            });

            if (result?.success) {
                setVideoFile(null);
                setThumbFile(null);
                setTitulo("");
                setModulosSelecionados([]);
                setShowModulos(false);

                if (videoInputRef.current) videoInputRef.current.value = "";
                if (thumbInputRef.current) thumbInputRef.current.value = "";

                toast.success("Mídia publicada e vinculada aos módulos!");

                if (onSuccess) onSuccess();
                router.refresh();
            } else {
                toast.error(result?.error || "Erro ao processar upload.");
            }
        } catch (error) {
            toast.error("Erro ao processar upload.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <div className="lg:col-span-5">
                <div className="bg-[#161616] p-8 rounded-[2.5rem] border border-white/5 sticky top-10 shadow-2xl">
                    <header className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-white">Upload de Mídia</h2>
                            <p className="text-[9px] text-slate-500 uppercase mt-1">Vincular aula a módulos</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setModalModuloOpen(true)}
                                className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 hover:bg-blue-500 hover:text-white transition-all cursor-pointer group flex items-center gap-2"
                                title="Criar Novo Módulo"
                            >
                                <FolderPlus size={18} />
                                <span className="text-[8px] font-black uppercase pr-1 hidden sm:block">Módulos</span>
                            </button>
                            <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500 border border-orange-500/10">
                                <Film size={18} />
                            </div>
                        </div>
                    </header>

                    <div className="space-y-4">

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase ml-2">Título da Aula</label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Ex: Introdução ao CRM"
                                className="w-full px-5 py-4 bg-[#1C1C1C] border border-white/5 rounded-2xl text-xs text-white outline-none focus:border-orange-500 focus:bg-[#222] transition-all"
                            />
                        </div>

                        <div className="relative">
                            <AlignLeft size={14} className="absolute left-4 top-4 text-slate-600" />
                            <textarea
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                placeholder="Descrição opcional..."
                                className="w-full bg-[#1C1C1C] border border-white/5 pl-10 pr-4 py-4 rounded-xl text-xs text-white outline-none focus:border-orange-500 min-h-[80px] resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className={`group relative border-2 border-dashed ${videoFile ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/5 bg-[#1C1C1C]'} rounded-3xl p-6 transition-all text-center`}>
                                <input
                                    type="file"
                                    ref={videoInputRef}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="video/*"
                                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                />
                                <div className={`w-10 h-10 ${videoFile ? 'bg-orange-500 text-white' : 'bg-orange-500/10 text-orange-500'} rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors`}>
                                    {videoFile ? <CheckCircle2 size={20} /> : <Upload size={20} />}
                                </div>
                                <p className="text-[10px] font-bold text-white uppercase">{videoFile ? videoFile.name : "Arquivo de Vídeo"}</p>
                            </div>

                            <div className={`group relative border-2 border-dashed ${thumbFile ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/5 bg-[#1C1C1C]'} rounded-3xl p-5 transition-all flex items-center gap-4`}>
                                <input
                                    type="file"
                                    ref={thumbInputRef}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                                />
                                <div className={`w-10 h-10 ${thumbFile ? 'bg-blue-500 text-white' : 'bg-blue-500/10 text-blue-500'} rounded-xl flex items-center justify-center transition-colors`}>
                                    {thumbFile ? <CheckCircle2 size={18} /> : <ImageIcon size={18} />}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] font-bold text-white uppercase truncate">{thumbFile ? thumbFile.name : "Miniatura (Capa)"}</p>
                                </div>
                            </div>
                        </div>

                        {/* SELETOR DE MÓDULOS */}
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => setShowModulos(!showModulos)}
                                className={`cursor-pointer w-full flex items-center justify-between px-5 py-4 rounded-2xl text-xs transition-all border ${modulosSelecionados.length > 0 ? 'bg-blue-500/5 border-blue-500/30 text-white' : 'bg-[#1C1C1C] border-white/5 text-slate-400'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <FolderKanban size={16} className={modulosSelecionados.length > 0 ? "text-blue-500" : "text-slate-600"} />
                                    <span className="font-bold uppercase tracking-tighter text-[10px]">
                                        {modulosSelecionados.length > 0
                                            ? modulosSelecionados.map(m => m.nome).join(", ")
                                            : "Vincular a Módulos"}
                                    </span>
                                </div>
                                <Plus size={14} className={`transition-transform duration-300 ${showModulos ? 'rotate-45 text-blue-500' : ''}`} />
                            </button>

                            {showModulos && (
                                <div className="grid grid-cols-1 gap-2 p-3 bg-[#111] rounded-2xl border border-white/5 animate-in fade-in slide-in-from-top-2 duration-200 max-h-48 overflow-y-auto custom-scrollbar">
                                    {modulosDisponiveis.length > 0 ? (
                                        modulosDisponiveis.map((modulo) => {
                                            const isSelected = modulosSelecionados.find(m => m.id === modulo.id);
                                            return (
                                                <button
                                                    key={modulo.id}
                                                    type="button"
                                                    onClick={() => toggleModulo(modulo)}
                                                    className={`cursor-pointer flex hover:border-2 hover:border-blue-500/50 items-center justify-between px-4 py-3 rounded-xl transition-all border ${isSelected ? 'bg-blue-500/20 border-blue-500 text-blue-500' : 'bg-[#1C1C1C] border-transparent text-slate-600 hover:bg-white/5'}`}
                                                >
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-[9px] font-black uppercase">{modulo.nome}</span>
                                                        <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{modulo.setor}</span>
                                                    </div>
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-800 bg-black'}`}>
                                                        {isSelected && <CheckCircle2 size={10} />}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="py-4 text-center text-[8px] font-black text-slate-700 uppercase italic">
                                            Nenhum módulo encontrado. Crie um acima.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            disabled={isUploading}
                            onClick={handleUpload}
                            className={`cursor-pointer w-full py-5 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-2xl group ${isUploading ? 'bg-orange-900/50 cursor-wait' : 'bg-orange-600 hover:bg-orange-500 shadow-orange-950/20'}`}
                        >
                            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                            {isUploading ? "Sincronizando..." : "Finalizar Publicação"}
                        </button>
                    </div>
                </div>
            </div>

            <ModalModulos isOpen={modalModuloOpen} onClose={() => setModalModuloOpen(false)} />
        </>
    );
}