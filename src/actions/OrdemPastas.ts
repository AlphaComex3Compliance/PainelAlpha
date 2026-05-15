"use server"
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache"; 

export async function salvarOrdemPastas(setor: string, ordem: string[]) {
    try {
      await db.ordemPastas.upsert({
        where: { setor },
        update: { ordem: JSON.stringify(ordem) },
        create: {
          setor,
          ordem: JSON.stringify(ordem)
        }
      });
  
      revalidatePath("/docsAlpha"); 
      return { success: true };
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
      console.error("ERRO REAL NO TURSO:", error);
      return { success: false };
    }
}

export async function buscarOrdemPastas(setor: string) {
    try {
      const registro = await db.ordemPastas.findUnique({
        where: { setor }
      });
      if (!registro) return null;
      return JSON.parse(registro.ordem);
    } catch (error) {
      return null;
    }
}