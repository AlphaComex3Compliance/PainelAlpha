"use server";

import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";



export async function salvarPlanilhaNoBancoAction(nome: string, bufferArray: number[]) {
    try {
        const buffer = Buffer.from(bufferArray);

        const tabela = (db as any).historico_planilha_fiscal;

        if (!tabela) {
            throw new Error("Tabela historico_planilha_fiscal não encontrada no Prisma Client.");
        }

        await tabela.create({
            data: {
                nome: nome,
                arquivo: buffer,
                data: new Date()
            }
        });

        revalidatePath("/PainelAlpha/RadarFiscal");
        return { success: true };
    } catch (error: any) {
        console.error("❌ ERRO AO SALVAR NO TURSO:", error.message);
        return { success: false, error: error.message };
    }
}


export async function getHistoricoPlanilhas() {
    try {


        return await (db as any).historico_planilha_fiscal.findMany({
            select: { id: true, nome: true, data: true },
            orderBy: { data: 'desc' }
        });
    } catch {
        return [];
    }
}

export async function baixarPlanilhaDoBanco(id: number) {
    try {
        const registro = await (db as any).historico_planilha_fiscal.findUnique({ where: { id } });
        if (!registro) return null;
        return {
            nome: registro.nome,
            base64: Buffer.from(registro.arquivo).toString('base64')
        };
    } catch {
        return null;
    }
}

export async function excluirPlanilhaBanco(id: number) {
    try {
        await (db as any).historico_planilha_fiscal.delete({
            where: { id }
        });

        revalidatePath("/PainelAlpha/RadarFiscal");
        return { success: true };
    } catch (error: any) {
        console.error("❌ ERRO AO EXCLUIR PLANILHA:", error.message);
        return { success: false, error: error.message };
    }
}
