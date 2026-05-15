import { auth } from "../../../../../auth";
import { getTema } from "@/lib/temas";
import { buscarOportunidades } from "@/actions/CRM";
import PipelineClient from "./PipelineClient";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const session = await auth();
  const temaNome = (session?.user as any)?.tema_interface || "blue";
  const visual = getTema(temaNome);
  const oportunidades = await buscarOportunidades();

  return <PipelineClient oportunidades={oportunidades} visual={visual} session={session} />;
}
