import { auth } from "../../../../auth";
import { getModulos, getVideos, getUserProgresso } from "@/actions/GetVideos";
import AlphaSkillsClient from "./AlphaSkillsClient";

export default async function AlphaSkillsPage() {
  const session = await auth();
  const userId = session?.user?.id || "";

  const [mods, vids, progressRaw] = await Promise.all([
    getModulos(),
    getVideos(),
    getUserProgresso(userId)
  ]);

  const progress = (progressRaw || []).map((p: any) => ({
    aulaId: String(p.aulaId),
    concluido: Boolean(p.concluido)
  }));

  const todosModulosOrdenados = [...mods].sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0));

  const modulosProcessados = mods.map(mod => {
    if (!mod.bloqueado) {
      return { ...mod, isLiberado: true };
    }

    let idRequisito = mod.requerModuloId;

    if (!idRequisito) {
      const idxGlobal = todosModulosOrdenados.findIndex((m: any) => m.id === mod.id);
      if (idxGlobal > 0) {
        idRequisito = todosModulosOrdenados[idxGlobal - 1].id;
      }
    }

    if (!idRequisito) {
      return { ...mod, isLiberado: true };
    }

    const aulasRequisito = vids.filter((v: any) =>
      v.modulo?.some((m: any) => String(m.id) === String(idRequisito))
    );

    const concluidas = progress.filter((p: any) =>
      aulasRequisito.some((a: any) => String(a.id) === String(p.aulaId)) && p.concluido
    );

    const pct = aulasRequisito.length > 0 ? (concluidas.length / aulasRequisito.length) * 100 : 0;
    const meta = mod.percentualMinimo || 100;

    return {
      ...mod,
      isLiberado: pct >= meta,
      nomeAnterior: mods.find((m: any) => String(m.id) === String(idRequisito))?.nome
    };
  });

  return (
    <AlphaSkillsClient 
      session={session} 
      initialModulos={modulosProcessados} 
      initialVideos={vids}
      initialProgresso={progress}
    />
  );
}