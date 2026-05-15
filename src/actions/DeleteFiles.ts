'use server'
import  db  from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// APAGAR APENAS O REGISTRO DO ARQUIVO 
export async function excluirApenasArquivo(id: number) {
  try {
    await db.arquivos_radar.delete({ where: { id } });
    revalidatePath("/PainelAlpha/Historico");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao remover arquivo" };
  }
}

// APAGAR UM CNPJ ESPECÍFICO 
export async function excluirCnpjEspecifico(id: number) {
  try {
    await db.consultas_radar.delete({ where: { id } });
    revalidatePath("/PainelAlpha/ConsultarRadar");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
