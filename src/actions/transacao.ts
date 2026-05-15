"use server";

import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function SalvarTransacoesLote(transacoes: any[], bancoId: number) {
    try {
        const idVinculado = Number(bancoId);

        const dadosParaBanco = transacoes.map(t => {
            let v = 0;
            if (typeof t.valor === 'string') {
                const limpo = t.valor.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
                v = parseFloat(limpo) || 0;
            } else {
                v = Number(t.valor) || 0;
            }

            return {
                data: String(t.data || ""),
                descricao: String(t.descricao || "SEM DESCRIÇÃO").toUpperCase().trim(),
                valor: v,
                bancoId: String(t.bancoId || ""),
                mesReferencia: String(t.mesReferencia || ""),
                origemArquivo: t.origem ? String(t.origem) : "EXTRATO",
                BancosVinculadosId: idVinculado
            };
        });

        await db.transacao.createMany({
            data: dadosParaBanco
        });

        revalidatePath("/");
        return { success: true, count: dadosParaBanco.length };

    } catch (error: any) {
        console.error("ERRO:", error);
        return { success: false, error: "Erro ao salvar no banco corrigido." };
    }
}

export async function BuscarTransacoesPorBanco(bancoId: number) {
    try {
        const transacoes = await db.transacao.findMany({
            where: { BancosVinculadosId: Math.floor(Number(bancoId)) },
            orderBy: { data: 'asc' }
        });
        return { success: true, data: transacoes };
    } catch (error) {
        return { success: false, data: [] };
    }
}

export async function DeletarTransacoesLote(ids: string[]) {
    try {
        await db.transacao.deleteMany({
            where: { id: { in: ids } }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro ao excluir." };
    }
}