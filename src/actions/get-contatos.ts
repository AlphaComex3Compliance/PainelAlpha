"use server"

import { auth } from "../../auth";
import db from "@/lib/prisma";

export async function getContatosChat() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const meuId = Number(session.user.id);

  try {
    const agentes = await db.usuarios.findMany({
      where: { id: { not: meuId } },
      include: {
        conversasP1: { where: { p2Id: meuId } },
        conversasP2: { where: { p1Id: meuId } },
      }
    });

    const listaFormatada = agentes.map((agente) => {
      const conversa = agente.conversasP1[0] || agente.conversasP2[0];
      
      return {
        id: agente.id,
        nome: agente.nome,
        imagemUrl: agente.imagemUrl,
        tema_interface: agente.tema_interface,
        ultimaMsg: conversa?.ultimaMsg || "",
        updatedAt: conversa?.updatedAt || new Date(0), 
        isOnline: false, 
      };
    });

    return listaFormatada.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error(error);
    return [];
  }
}