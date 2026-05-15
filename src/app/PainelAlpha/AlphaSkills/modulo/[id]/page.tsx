import { getModulos, getVideos, getUserProgresso } from "@/actions/GetVideos";
import ModuloDetalhesClient from "./ModuloDetalhesClient";
import { redirect, notFound } from "next/navigation";
import { auth } from "../../../../../../auth";


export default async function ModuloPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    const session = await auth();

    if (!session) {
        redirect("/");
    }

    const [mods, vids, progresso] = await Promise.all([
        getModulos(),
        getVideos(),
        getUserProgresso(session.user.id || "")
    ]);

    const moduloAtual = mods.find((m: any) => String(m.id) === String(id));

    if (moduloAtual?.bloqueado) {
        const todosModulosOrdenados = mods.sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0));
        const indexAtual = todosModulosOrdenados.findIndex((m: any) => m.id === moduloAtual.id);

        if (indexAtual > 0) {
            const moduloAnterior = todosModulosOrdenados[indexAtual - 1];

            const aulasAnt = vids.filter((v: any) => v.modulo?.some((m: any) => m.id === moduloAnterior.id));
            const concluidasAnt = progresso.filter((p: any) => aulasAnt.some(a => a.id === p.aulaId) && p.concluido);

            if (concluidasAnt.length < aulasAnt.length) {
                redirect("/PainelAlpha/AlphaSkills?msg=conclua-o-anterior");
            }
        }
    }


    const aulasDoModulo = vids
        .filter((v: any) => {
            const relacaoModulo = v.modulo || v.modulos || [];
            return relacaoModulo.some((m: any) => String(m.id) === String(id));
        })
        .sort((a: any, b: any) => (Number(a.ordem) || 0) - (Number(b.ordem) || 0));

    return (
        <ModuloDetalhesClient
            session={session}
            modulo={moduloAtual}
            aulasIniciais={aulasDoModulo}
            progressoInicial={progresso}
        />
    );
}