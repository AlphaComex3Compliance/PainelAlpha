import { auth } from "../../../../../auth";
import { getTema } from "@/lib/temas";
import { buscarOportunidades, buscarAtividades } from "@/actions/CRM";
import RelatoriosClient from "./RelatoriosClient";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  const session = await auth();
  const visual = getTema((session?.user as any)?.tema_interface || "blue");
  const [oportunidades, atividades] = await Promise.all([
    buscarOportunidades(),
    buscarAtividades(),
  ]);
  return <RelatoriosClient oportunidades={oportunidades} atividades={atividades} visual={visual} />;
}
