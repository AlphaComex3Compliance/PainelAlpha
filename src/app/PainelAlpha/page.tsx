import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import PainelAlphaClient from "@/components/PainelAlphaClient";
import db from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PainelAlpha() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const userId = Number(session?.user?.id);
  const isAdmin = session?.user?.role === "Admin";

  const userDb = await db.usuarios.findUnique({
    where: { id: Number(session?.user?.id) },
    select: { 
      tema_interface: true, 
      densidade_painel: true,
      atalhos: true,
      esconderBloqueados: true
    }
  });

  const chamados = await db.chamados.findMany({
    where: { 
      ...(isAdmin ? {} : { usuarioId: userId }) 
    },
    select: {
      id: true,
      _count: {
        select: {
          mensagens: {
            where: {
              AND: [
                { autorId: { not: userId } },
                isAdmin ? { lida_admin: false } : { lida_usuario: false }
              ]
            }
          }
        }
      }
    }
  });

  return (
    
    <PainelAlphaClient 
      session={session} 
      chamadosIniciais={chamados}
      configBanco={{
        tema: userDb?.tema_interface || "blue",
        densidade: userDb?.densidade_painel || "default",
        atalhos: userDb?.atalhos || "",
        esconderBloqueados: !!userDb?.esconderBloqueados
      }} 
    />
  );
}
