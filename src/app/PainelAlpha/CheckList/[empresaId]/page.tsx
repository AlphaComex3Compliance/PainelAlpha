import db from "@/lib/prisma";
import EmbasamentoRetomada from "../Embasamentos/EmbasamentoRetomada";
import EmbasamentoFinanceiro from "../Embasamentos/EmbasamentoDisFinanc";
import EmbasamentoDAS from "../Embasamentos/EmbasamentoDAS";
import { getTema } from "@/lib/temas";
import { auth } from "../../../../../auth";
import { redirect } from "next/navigation";

export default async function PageEmbasamento({ params, configBanco }: { params: Promise<{ empresaId: string }>, configBanco: any }) {
    const session = await auth();

    const resolvedParams = await params;
    const { empresaId } = resolvedParams;

    const empresa = await db.operacionalClientes.findUnique({
        where: { id: empresaId },
        include: { cliente: true }
    });

    const userDb = await db.usuarios.findUnique({
        where: { id: Number(session?.user?.id) },
        select: { 
          tema_interface: true, 
          densidade_painel: true,
          atalhos: true,
          esconderBloqueados: true
        }
      });


    if (!session) {
        redirect("/");
    }


    if (!empresa) return <div className="p-10 text-white font-black">Empresa não encontrada</div>;

    return (
        <div className="p-8 min-h-screen bg-black">
           

            <div className="z-10">
                {empresa.embasamento === "EmbasamentoFinanceiro" && (
                    <EmbasamentoFinanceiro empresa={empresa} />
                )}

                {empresa.embasamento === "EmbasamentoRetomada" && (
                    <EmbasamentoRetomada
                        empresa={empresa}
                        configBanco={{
                            tema: userDb?.tema_interface || "blue"
                        }}
                    />
                )}

                {empresa.embasamento === "EmbasamentoDAS" && (
                    <EmbasamentoDAS empresa={empresa} />
                )}
            </div>
        </div>
    );
}