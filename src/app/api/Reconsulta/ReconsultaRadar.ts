"use server";
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function prepararReconsultaLote(tipo: 'ERROS' | 'NAO_HABILITADOS') {
  try {
    const condicao = tipo === 'ERROS' 
      ? { situacao_radar: { in: ["ERRO", "ERRO NA API", ""] } }
      : { situacao_radar: { in: ["NÃO HABILITADA", "NÃO LOCALIZADO - RECONSULTAR"] } };

    const deletados = await db.consultas_radar.deleteMany({
      where: condicao
    });

    revalidatePath("/PainelAlpha/ConsultaRadar");
    return { success: true, count: deletados.count };
  } catch (error) {
    return { success: false };
  }
}


