"use server";
import db from "@/lib/prisma";
import { hashSync } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateUser(idDoUsuario: string, formData: FormData) {
  try {
    const nome = formData.get("nome")?.toString() || "";
    const valorUsuario = formData.get("usuario")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const role = formData.get("role")?.toString() || "User";
    const senhaNova = formData.get("senha")?.toString() || "";
    
    const permissoesArray = formData.getAll("permissoes") as string[];
    const permissoesString = permissoesArray.join(",");

    if (!valorUsuario) {
      return { success: false, error: "O campo usuário é obrigatório." };
    }

    const dataUpdate: any = {
      nome,
      usuario: valorUsuario,
      email,
      role,
      permissoes: permissoesString 
    };

    if (senhaNova && senhaNova.trim() !== "") {
      dataUpdate.senha = hashSync(senhaNova, 10);
    }

    await db.usuarios.update({
      where: {
        id: Number(idDoUsuario)
      },
      data: dataUpdate,
    });

    revalidatePath("/PainelAlpha/cadastro"); 

    return { success: true };
  } catch (error: any) {
    console.error("ERRO AO ATUALIZAR:", error.message);
    return { success: false, error: error.message };
  }
}
