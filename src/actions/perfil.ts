"use server";

import db from "@/lib/prisma";
import { auth, signOut } from "../../auth";
import { hashSync, compareSync } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function alterarSenhaPropriaAction(formData: FormData) {
    try {


        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Sessão expirada." };

        const senhaAtual = formData.get("senhaAtual")?.toString();
        const senhaNova = formData.get("novaSenha")?.toString();

        if (!senhaAtual || !senhaNova) return { success: false, error: "Preencha os campos." };

        const usuarioBanco = await db.usuarios.findUnique({
            where: { id: Number(session.user.id) }
        });

        if (!usuarioBanco) return { success: false, error: "Usuário não encontrado." };

        const senhaCorreta = compareSync(senhaAtual, usuarioBanco.senha);
        if (!senhaCorreta) return { success: false, error: "Senha atual incorreta." };

        await db.usuarios.update({
            where: { id: usuarioBanco.id },
            data: { senha: hashSync(senhaNova, 10) }
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Erro na sincronização." };
    }
}

export async function atualizarFotoPerfilAction(url: string | null) {
    try {
      const session = await auth();
      
      const userId = session?.user?.id;
      if (!userId) return { success: false, error: "Sessão inválida." };
  
      console.log("📡 Tentando atualizar foto para o ID:", userId);
  
      const usuarioAtualizado = await db.usuarios.update({
        where: { 
          id: Number(userId)
        },
        data: { 
          imagemUrl: url 
        }
      });
  
      console.log("✅ Usuário atualizado no banco:", usuarioAtualizado.id);
  
      revalidatePath("/PainelAlpha/InfosPerfil/Perfil");
      
      return { success: true };
    } catch (error: any) {
      console.error("❌ ERRO NO PRISMA:", error.message);
      return { success: false, error: "Erro ao sincronizar imagem no banco." };
    }
  }

  export async function deletarImagemAction() {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    await db.usuarios.update({
        where: { id: Number(session.user.id) },
        data: { imagemUrl: null }
    });

    return { success: true };
}