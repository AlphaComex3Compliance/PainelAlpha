"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Landmark, Info, Search, CheckCircle2 } from 'lucide-react';

const BANCOS_ATUAIS = [
    { id: 'itauC', nome: 'Itaú - Consolidado', logo: 'https://assets.hgbrasil.com/finance/companies/big/itauunibanco.png' },
    { id: 'itau', nome: 'Itaú', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGsT3SsiVHEr22i0zROsQdDulrZn44Fg3FTA&s' },
    { id: 'bradesco', nome: 'Bradesco', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT76Y8Kg3vkr8pHetdO3ELHzbU9OcaN-YtxQw&s' },
    { id: 'nubank', nome: 'Nubank', logo: 'https://s3.amazonaws.com//beta-img.b2bstack.net/uploads/production/provider/image/36/o2hFZ2Wc.png' },
    { id: 'sicredi', nome: 'Sicredi', logo: 'https://yt3.googleusercontent.com/ytc/AIdro_mX0Dsx4mnkCSatUSSs_1X64KqC3LTAbyQrLo-aK3qaC-0=s900-c-k-c0x00ffffff-no-rj' },
    { id: 'santander', nome: 'Santander', logo: 'https://play-lh.googleusercontent.com/g_QDzrOlw8Belx8qb47fUu0MPL6AVFzDdbOz_NJZYQDNLveHYxwiUoe09Wvkxf-_548q' },
    { id: 'bancoBrasil', nome: 'Banco do Brasil', logo: 'https://s3.amazonaws.com//beta-img.b2bstack.net/uploads/production/product/product_image/26449/banco-brasil-logo.png' },
    { id: 'sicoob', nome: 'Sicoob', logo: 'https://scontent.fnvt10-1.fna.fbcdn.net/v/t1.6435-9/64664519_2511764435542395_2898771194410958848_n.png?_nc_cat=111&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=_dbbpUT_UZgQ7kNvwGMJp6b&_nc_oc=AdrA_gLfY-NeWDDcNPYHpOB91rW38jvjV1OwuisnvkGYiBG_hLANhXJWChgq8DgQ2cU&_nc_zt=23&_nc_ht=scontent.fnvt10-1.fna&_nc_gid=m7SikjtuFKqpMg5Y8-IFJQ&_nc_ss=7a30f&oh=00_AfwYcQQ3hzmjBWxcpAiw5s6fq49YUqzqeE8GyE0lJhDDOQ&oe=69EA36E2' },
    { id: 'bancoPan', nome: 'Banco Pan', logo: 'https://www.bancopan.com.br/content/dam/webapp--aem-institucional-blog/categorias/banner_mobile.webp' },
    { id: 'mercadoPago', nome: 'Mercado Pago', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSC5OnfdoTXarZCpxiEFB0yNmSI3ZX_dMxUdQ&s' },
    { id: 'pagBank', nome: 'Pag Bank', logo: 'https://play-lh.googleusercontent.com/O9GpqGB-9aE8Qt79JM1VXoVA5rRQjLb4LVk7yVwd2cuWeAi0ML6uVbc7aXZEOeyYwg=s256-rw' },
    { id: 'c6', nome: 'C6 Bank', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRP1k3xiZGECxPYfI1HB9NAwNIOFcrJ7Y9K5w&s' },
    { id: 'inter', nome: 'Inter', logo: 'https://media.licdn.com/dms/image/v2/D4D05AQFD2dx4DqQ-0w/videocover-high/videocover-high/0/1691499408584?e=2147483647&v=beta&t=rrL0MG7xNh8CQHxE28-z039goMj2ljvXyd1dYnXkFyI' },
    { id: "credcrea", nome: "CredCrea", logo:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLnKtHqFm_6MU1xUj-d4w_ArqWxdn7Wlw-Gw&s" },
    { id: "caixa", nome: "Caixa", logo: "https://pbs.twimg.com/profile_images/1760094261775572992/_U76QhK9.jpg" }
];

export default function ModalAdicionarBanco({ isOpen, onClose, onSave }: any) {
    const [bancoSel, setBancoSel] = useState<any>(null);
    const [descricao, setDescricao] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#0f172a] border border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[2.5rem] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Vincular Nova Conta</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Selecione a instituição financeira</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 sm:p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {BANCOS_ATUAIS.map((banco) => (
                            <button
                                key={banco.id}
                                onClick={() => setBancoSel(banco)}
                                className={`cursor-pointer group relative h-32 rounded-3xl border-2 transition-all duration-500 overflow-hidden flex flex-col items-center justify-center gap-3
                                        ${bancoSel?.id === banco.id
                                        ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                                        : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'}`}
                            >
                                <img
                                    src={banco.logo}
                                    alt={banco.nome}
                                    className={`cursor-pointer w-12 h-12 rounded-xl object-contain transition-all duration-500
                                    ${bancoSel?.id === banco.id ? 'grayscale-0 scale-110' : 'grayscale group-hover:grayscale-[0.5]'}`}
                                />

                                <span className={`text-[10px] font-black uppercase tracking-widest italic transition-colors duration-300
                                    ${bancoSel?.id === banco.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    {banco.nome}
                                </span>

                                {bancoSel?.id === banco.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute top-3 right-3 text-indigo-400"
                                    >
                                        <CheckCircle2 size={18} />
                                    </motion.div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                            <Info size={12} className="text-indigo-500" /> Descrição da Conta
                        </label>
                        <textarea
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Ex: Conta Corrente - Filial Balneário"
                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none h-24"
                        />
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-end">
                    <button
                        onClick={() => onSave({ bancoSel, descricao })}
                        className="cursor-pointer px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-900/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        disabled={!bancoSel || !descricao}
                    >
                        Confirmar Vínculo
                    </button>
                </div>
            </motion.div>
        </div>
    );
}