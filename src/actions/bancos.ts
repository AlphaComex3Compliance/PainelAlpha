"use server";
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function VincularNovoBanco(dados: {
    bancoId: string;
    nome: string;
    logo: string;
    descricao: string;
    periodoId: number;
}) {
    try {
        await db.bancosVinculados.create({
            data: {
                bancoId: dados.bancoId,
                nomeBanco: dados.nome, 
                logo: dados.logo, 
                descricao: dados.descricao,
                periodoId: dados.periodoId 
            }
        });

        revalidatePath(`/PainelAlpha/ExtratosBancarios`); 
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro interno." };
    }
}

export async function AtualizarAnotacaoBanco(id: number, anotacao: string) {
    try {
        await db.bancosVinculados.update({
            where: { id },
            data: { anotacao }
        });
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function ExcluirBancoVinculado(bancoId: number) {
    try {
        await db.bancosVinculados.delete({
            where: { id: bancoId }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erro ao excluir banco" };
    }
}