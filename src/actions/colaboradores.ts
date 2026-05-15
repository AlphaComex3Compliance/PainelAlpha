"use server";

import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function adicionarColaboradorCoreAction(formData: FormData) {
  try {
    const nome = formData.get("nome")?.toString().toUpperCase().trim();
    const setor = formData.get("setor")?.toString().toUpperCase().trim();
    const cargo = formData.get("cargo")?.toString().toUpperCase().trim();
    const data = formData.get("data")?.toString();

    if (!nome || !setor || !cargo) {
      return { success: false, error: "DADOS OBRIGATÓRIOS AUSENTES" };
    }

    await db.colaboradores_core.create({
      data: {
        nome,
        setor,
        cargo,
        data_contratacao: data || null,
        status: "ATIVO",
      },
    });

    revalidatePath("/PainelAlpha/AlphaVault");
    return { success: true };
  } catch (error: any) {
    console.error("ERRO_CORE:", error.message);
    return { success: false, error: error.message };
  }
}

export async function atualizarAgenteSistemaAction(formData: FormData) {
  try {
    const idBruto = formData.get("id")?.toString();
    const cargo = formData.get("cargo")?.toString().toUpperCase().trim();
    const data = formData.get("data")?.toString();
    const status = formData.get("status")?.toString();
    const setor = formData.get("setor")?.toString().toUpperCase().trim();

    if (!idBruto) return { success: false, error: "ID NÃO LOCALIZADO" };

    const isCore = idBruto.startsWith("ext-");
    const idReal = isCore ? idBruto.replace("ext-", "") : idBruto;

    if (isCore) {
      await db.colaboradores_core.update({
        where: { id: parseInt(idReal) },
        data: {
          cargo: cargo || undefined,
          data_contratacao: data || null,
          status: status || "ATIVO",
          setor: setor || "OPERACIONAL",
        },
      });
    } else {
      await db.usuarios.update({
        where: { id: parseInt(idReal) },
        data: {
          cargo: cargo || null,
          data_contratacao: data || null,
          status: status || "ATIVO",
          role: setor || "ADMIN",
        },
      });
    }

    revalidatePath("/PainelAlpha/AlphaVault");
    return { success: true };
  } catch (error: any) {
    console.error("ERRO_AO_SALVAR:", error.message);
    return { success: false, error: error.message };
  }
}

export async function adicionarSistemaCoreAction(formData: FormData) {
  try {
    const nome = formData.get("nome")?.toString().toUpperCase().trim();
    const link = formData.get("link")?.toString().trim();
    const icone = formData.get("icone")?.toString();

    if (!nome || !link) {
      return { success: false, error: "NOME E LINK SÃO OBRIGATÓRIOS" };
    }

    await db.sistemas_core.create({
      data: {
        nome,
        link,
        icone: icone || "google",
      },
    });

    revalidatePath("/PainelAlpha/AlphaVault");
    return { success: true };
  } catch (error: any) {
    console.error("ERRO_SISTEMA_CORE:", error.message);
    return { success: false, error: error.message };
  }
}

export async function adicionarRecursoVaultAction(formData: FormData) {
  try {
    const colabId = formData.get("colaborador_id")?.toString();
    const sistemaId = formData.get("sistema_id")?.toString();
    const login = formData.get("login")?.toString().trim();
    const senha = formData.get("senha")?.toString().trim();

    if (!colabId || !sistemaId || !login || !senha) {
      return { success: false, error: "TODOS OS CAMPOS SÃO OBRIGATÓRIOS" };
    }

    await db.vault_recursos.create({
      data: {
        colaborador_id: colabId,
        sistema_id: parseInt(sistemaId),
        login,
        senha,
      },
    });

    revalidatePath("/PainelAlpha/AlphaVault");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
