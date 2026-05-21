"use client";

import { Plus, Trash2, Users } from "lucide-react";

export interface Socio {
    nome: string;
    telefone: string;
    dataNascimento: string;
    vinculo: string;
    obs: string;
}

const VINCULOS = ["Sócio", "Administrador", "Sócio-Administrador", "Procurador", "Representante Legal"];

interface Props {
    socios: Socio[];
    onChange: (socios: Socio[]) => void;
    disabled?: boolean;
}

const socioVazio = (): Socio => ({
    nome: "",
    telefone: "",
    dataNascimento: "",
    vinculo: "",
    obs: "",
});

export default function QuadroSocios({ socios, onChange, disabled = false }: Props) {
    const update = (index: number, field: keyof Socio, value: string) => {
        const novo = [...socios];
        novo[index] = { ...novo[index], [field]: value };
        onChange(novo);
    };

    const adicionar = () => onChange([...socios, socioVazio()]);

    const remover = (index: number) => onChange(socios.filter((_, i) => i !== index));

    const inputCls =
        "w-full h-10 bg-slate-950/80 border border-white/10 rounded-xl px-3 text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:outline-none transition-colors disabled:opacity-50";

    const labelCls = "text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1";

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Users size={12} />
                    Quadro Societário
                </label>
                {!disabled && (
                    <button
                        type="button"
                        onClick={adicionar}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest hover:bg-blue-600/20 transition-colors"
                    >
                        <Plus size={11} />
                        Adicionar Sócio
                    </button>
                )}
            </div>

            {socios.length === 0 && (
                <div className="py-6 text-center text-[10px] text-slate-600 font-black uppercase tracking-widest border border-dashed border-white/5 rounded-2xl">
                    Nenhum sócio adicionado
                </div>
            )}

            {socios.map((socio, i) => (
                <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-3"
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                            Sócio {i + 1}
                        </span>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={() => remover(i)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={13} />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Nome *</label>
                            <input
                                type="text"
                                placeholder="Nome completo"
                                value={socio.nome}
                                onChange={(e) => update(i, "nome", e.target.value)}
                                disabled={disabled}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Telefone</label>
                            <input
                                type="text"
                                placeholder="(00) 00000-0000"
                                value={socio.telefone}
                                onChange={(e) => update(i, "telefone", e.target.value)}
                                disabled={disabled}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Data de Nascimento</label>
                            <input
                                type="date"
                                value={socio.dataNascimento}
                                onChange={(e) => update(i, "dataNascimento", e.target.value)}
                                disabled={disabled}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Vínculo *</label>
                            <select
                                value={socio.vinculo}
                                onChange={(e) => update(i, "vinculo", e.target.value)}
                                disabled={disabled}
                                className={inputCls}
                            >
                                <option value="">Selecione...</option>
                                {VINCULOS.map((v) => (
                                    <option key={v} value={v}>
                                        {v}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className={labelCls}>Observação</label>
                            <input
                                type="text"
                                placeholder="Opcional"
                                value={socio.obs}
                                onChange={(e) => update(i, "obs", e.target.value)}
                                disabled={disabled}
                                className={inputCls}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
