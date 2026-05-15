"use server";
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function excluirEmpresasAction(ids: number[]) {
    try {
        await db.radar_fiscal.deleteMany({
            where: { id: { in: ids } }
        });
        revalidatePath("/PainelAlpha/RadarFiscal");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
