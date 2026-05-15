import { auth } from "../../../../auth";
import { getTema } from "@/lib/temas";
import { buscarStatsCRM, buscarAtividades, buscarOportunidades } from "@/actions/CRM";
import DashboardCRM from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AlphaCRMPage() {
  const session = await auth();
  const temaNome = (session?.user as any)?.tema_interface || "blue";
  const visual = getTema(temaNome);

  const [stats, atividades, oportunidades] = await Promise.all([
    buscarStatsCRM(),
    buscarAtividades({ concluida: false }),
    buscarOportunidades(),
  ]);

  return (
    <DashboardCRM
      stats={stats}
      atividadesPendentes={atividades.slice(0, 8)}
      oportunidades={oportunidades}
      visual={visual}
      session={session}
    />
  );
}
