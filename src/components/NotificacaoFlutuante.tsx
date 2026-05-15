"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { MessageSquare, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getTema } from "@/lib/temas";

let audioGlobal: HTMLAudioElement | null = null;
if (typeof window !== "undefined") {
    audioGlobal = new Audio("/sounds/notification.mp3");
    audioGlobal.preload = "auto";
}

export function NotificacaoFlutuante() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const ultimaMsgId = useRef<number | null>(null);
    const isFetching = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const primeiraCarga = useRef(true); 

    const temaNome = (session?.user as any)?.tema_interface || "blue";
    const style = getTema(temaNome);

    const checkNovasMensagens = useCallback(async () => {
        if (status !== "authenticated" || !session?.user?.id || isFetching.current) return;

        try {
            isFetching.current = true;
            const res = await fetch(`/api/notificacoes?v=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
            });
            
            if (!res.ok) throw new Error();
            const msg = await res.json();

            if (!msg || msg.nenhum || !msg.id) {
                isFetching.current = false;
                return;
            }

            if (primeiraCarga.current) {
                ultimaMsgId.current = msg.id;
                primeiraCarga.current = false;
                return;
            }

            if (msg.id !== ultimaMsgId.current) {
                ultimaMsgId.current = msg.id;

                if (audioGlobal) {
                    audioGlobal.pause();
                    audioGlobal.currentTime = 0;
                    audioGlobal.volume = 0.5;
                    audioGlobal.play().catch(() => {});
                }

                toast.custom((t) => (
                    <div
                        onClick={() => {
                            router.push(`/PainelAlpha/Chamados`);
                            toast.dismiss(t);
                        }}
                        className={`w-[380px] bg-slate-950/95 border ${style.border} p-6 rounded-[2.2rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl cursor-pointer hover:scale-[1.02] transition-all group relative overflow-hidden`}
                    >
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${style.bg} shadow-[0_0_15px_rgba(0,0,0,0.5)]`} />
                        <div className="flex items-start gap-5">
                            <div className={`p-3.5 ${style.bg} bg-opacity-10 rounded-2xl ${style.text} group-hover:rotate-12 transition-transform border ${style.border}`}>
                                <MessageSquare size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${style.text}`}>Transmission Alert</p>
                                    <div className="flex gap-1">
                                        <div className={`w-1 h-1 rounded-full ${style.bg} animate-pulse`} />
                                    </div>
                                </div>
                                <p className="text-[13px] font-black text-white truncate mb-1">
                                    {msg.autor?.nome}
                                </p>
                                <p className="text-[11px] font-medium text-slate-400 italic line-clamp-2 leading-relaxed">
                                    "{msg.texto}"
                                </p>
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest truncate pr-4">Ref: {msg.chamado?.titulo}</p>
                                    <ArrowRight size={14} className={style.text} />
                                </div>
                            </div>
                        </div>
                    </div>
                ), { duration: 8000, id: `msg-${msg.id}` });
            }
        } catch (e) {
        } finally {
            isFetching.current = false;
            const delay = document.hidden ? 30000 : 6000;
            timeoutRef.current = setTimeout(checkNovasMensagens, delay);
        }
    }, [session, status, router, style]);

    useEffect(() => {
        if (status === "authenticated") {
            checkNovasMensagens();
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [status, checkNovasMensagens]);

    return null;
}