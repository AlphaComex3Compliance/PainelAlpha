"use server";
import  db  from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function CriarNovoPeriodo(mes: string, ano: string, extratoId: number) {
  try {
    const novo = await db.periodosAnalise.create({
      data: {
        mes,
        ano,
        extratoId
      }
    });

    revalidatePath(`/PainelAlpha/ExtratosBancarios/${extratoId}`);
    return { success: true, data: novo };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erro ao criar período." };
  }
}