"use server"
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function renomearPasta(fichario: string, nomeAntigo: string, nomeNovo: string) {
  try {
    // 🔍 DIAGNÓSTICO: Vamos buscar TODOS os setores e pastas que existem no banco
    const todosDocs = await db.documentos.findMany({
      take: 10,
      select: { setor: true, PastaArquivos: true }
    });
    console.log("AMOSTRA DO BANCO:", JSON.stringify(todosDocs, null, 2));
    console.log("O QUE VOCÊ ENVIOU:", { fichario, nomeAntigo });

    // 🚀 TENTATIVA 1: Busca ignorando Case Sensitive (Maiúsculas/Minúsculas)
    const docs = await db.documentos.findMany({
      where: {
        AND: [
          { setor: { contains: fichario } },
          { PastaArquivos: { contains: nomeAntigo } }
        ]
      },
      select: { id: true }
    });

    if (docs.length === 0) {
      // 🚀 TENTATIVA 2: Busca APENAS pelo nome da pasta (ignorando o fichário para testar)
      const buscaApenasPasta = await db.documentos.findMany({
        where: { PastaArquivos: { contains: nomeAntigo } },
        select: { id: true }
      });
      
      if (buscaApenasPasta.length > 0) {
        console.log("ACHEI A PASTA, MAS O SETOR/FICHÁRIO ESTÁ DIFERENTE NO BANCO!");
        const ids = buscaApenasPasta.map(d => d.id);
        await db.documentos.updateMany({
          where: { id: { in: ids } },
          data: { PastaArquivos: nomeNovo.toUpperCase().trim() }
        });
        revalidatePath("/PainelAlpha/DocsAlpha");
        return { success: true, count: ids.length };
      }

      return { success: false, count: 0, error: "Dados não batem com o banco" };
    }

    const ids = docs.map(d => d.id);
    await db.documentos.updateMany({
      where: { id: { in: ids } },
      data: { PastaArquivos: nomeNovo.toUpperCase().trim() }
    });

    revalidatePath("/PainelAlpha/DocsAlpha");
    return { success: true, count: ids.length };
  } catch (error) {
    return { success: false };
  }
}
