import { auth } from "../../../../../auth";
import { getTema } from "@/lib/temas";
import { buscarAtividades, buscarOportunidades } from "@/actions/CRM";
import AtividadesClient from "./AtividadesClient";

export const dynamic = "force-dynamic";

export default async function AtividadesPage() {
  const session = await auth();
  const visual = getTema((session?.user as any)?.tema_interface || "blue");
  const [atividades, oportunidades] = await Promise.all([
    buscarAtividades(),
    buscarOportunidades(),
  ]);
  return <AtividadesClient atividades={atividades} oportunidades={oportunidades} visual={visual} />;
}
