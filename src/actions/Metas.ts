"use server";

import db from "@/lib/prisma";
import { auth } from "../../auth";
import { startOfMonth, endOfMonth } from "date-fns";

export interface ColaboradorMeta {
    colaboradoraId: string;
    nome: string;
    imagemUrl: string | null;
    tema: string;
    vendas: number;
    meta: number;
}

export interface DadosMetasResult {
    success: true;
    colaboradores: ColaboradorMeta[];
    metaEquipe: number;
    totalVendas: number;
    mes: number;
    ano: number;
}

export interface DadosMetasError {
    success: false;
    error: string;
}

export async function getDadosMetas(): Promise<DadosMetasResult | DadosMetasError> {
    const agora = new Date();
    const mes = agora.getMonth() + 1;
    const ano = agora.getFullYear();

    try {
        // Fonte de verdade: todos os usuários com role COMERCIAL
        const [comerciais, registros, metas, metaEquipe] = await Promise.all([
            db.usuarios.findMany({
                where: { role: "COMERCIAL" },
                select: { nome: true, imagemUrl: true, tema_interface: true },
                orderBy: { nome: "asc" },
            }),
            db.comercialPerformance.groupBy({
                by: ["colaboradoraId"],
                _sum: { contratosHabilitacao: true, contratosRevisao: true },
                where: {
                    dataRegistro: {
                        gte: startOfMonth(agora),
                        lte: endOfMonth(agora),
                    },
                },
            }),
            db.metaUsuario.findMany({ where: { mes, ano } }),
            db.metaEquipe.findFirst({ where: { mes, ano } }),
        ]);

        const colaboradores: ColaboradorMeta[] = comerciais.map((usuario) => {
            const registro = registros.find((r) => r.colaboradoraId === usuario.nome);
            const metaReg = metas.find((m) => m.colaboradoraId === usuario.nome);
            const vendas =
                (registro?._sum.contratosHabilitacao ?? 0) +
                (registro?._sum.contratosRevisao ?? 0);
            return {
                colaboradoraId: usuario.nome,
                nome: usuario.nome,
                imagemUrl: usuario.imagemUrl ?? null,
                tema: usuario.tema_interface ?? "blue",
                vendas,
                meta: metaReg?.metaMensal ?? 0,
            };
        });

        colaboradores.sort((a, b) => b.vendas - a.vendas);

        return {
            success: true,
            colaboradores,
            metaEquipe: metaEquipe?.metaMensal ?? 0,
            totalVendas: colaboradores.reduce((acc, c) => acc + c.vendas, 0),
            mes,
            ano,
        };
    } catch (error) {
        console.error("Erro ao buscar metas:", error);
        return { success: false, error: "Erro ao carregar dados" };
    }
}

export async function getColaboradoresParaConfigurar() {
    const session = await auth();
    if (!session || session.user.role !== "Admin")
        return { success: false as const, error: "Não autorizado" };

    const agora = new Date();
    const mes = agora.getMonth() + 1;
    const ano = agora.getFullYear();

    try {
        const [comerciais, metas, metaEquipe] = await Promise.all([
            db.usuarios.findMany({
                where: { role: "COMERCIAL" },
                select: { nome: true },
                orderBy: { nome: "asc" },
            }),
            db.metaUsuario.findMany({ where: { mes, ano } }),
            db.metaEquipe.findFirst({ where: { mes, ano } }),
        ]);

        return {
            success: true as const,
            colaboradores: comerciais.map((c) => ({
                colaboradoraId: c.nome,
                meta: metas.find((m) => m.colaboradoraId === c.nome)?.metaMensal ?? 0,
            })),
            metaEquipe: metaEquipe?.metaMensal ?? 0,
            mes,
            ano,
        };
    } catch (error) {
        console.error("Erro ao buscar colaboradores:", error);
        return { success: false as const, error: "Erro ao buscar dados" };
    }
}

export async function upsertMetaUsuario(
    colaboradoraId: string,
    metaMensal: number,
    mes: number,
    ano: number
) {
    const session = await auth();
    if (!session || session.user.role !== "Admin")
        return { success: false, error: "Não autorizado" };

    try {
        await db.metaUsuario.upsert({
            where: { colaboradoraId_mes_ano: { colaboradoraId, mes, ano } },
            update: { metaMensal },
            create: { colaboradoraId, metaMensal, mes, ano },
        });
        return { success: true };
    } catch (error) {
        console.error("Erro ao salvar meta:", error);
        return { success: false, error: "Erro ao salvar meta" };
    }
}

export async function upsertMetaEquipe(metaMensal: number, mes: number, ano: number) {
    const session = await auth();
    if (!session || session.user.role !== "Admin")
        return { success: false, error: "Não autorizado" };

    try {
        await db.metaEquipe.upsert({
            where: { mes_ano: { mes, ano } },
            update: { metaMensal },
            create: { metaMensal, mes, ano },
        });
        return { success: true };
    } catch (error) {
        console.error("Erro ao salvar meta da equipe:", error);
        return { success: false, error: "Erro ao salvar meta da equipe" };
    }
}
