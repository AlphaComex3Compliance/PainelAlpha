"use server";

import db from "@/lib/prisma";
import { auth } from "../../auth";
import { revalidatePath } from "next/cache";

export async function salvarAtalhosAction(atalhos: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await db.usuarios.update({
      where: { id: Number(session.user.id) },
      data: { atalhos: atalhos.join(",") }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao salvar atalhos" };
  }
}

export async function salvarPreferenciasAction(atalhosIds: string[], esconder: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Não autorizado" };

  try {
    await db.usuarios.update({
      where: { id: Number(session.user.id) },
      data: {
        atalhos: atalhosIds.join(","),
        esconderBloqueados: esconder
      }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha no banco" };
  }
}

export async function atualizarInterfaceAction(tema: string, densidade: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    await db.usuarios.update({
      where: { id: Number(session.user.id) },
      data: {
        tema_interface: tema,
        densidade_painel: densidade
      }
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function toggleBibbleAction(ativo: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    await (db.usuarios as any).update({
      where: { id: Number(session.user.id) },
      data: { bibble_ativo: ativo },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}
