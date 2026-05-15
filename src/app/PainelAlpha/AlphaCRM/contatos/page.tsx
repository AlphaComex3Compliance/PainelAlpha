import { auth } from "../../../../../auth";
import { getTema } from "@/lib/temas";
import { buscarContatos } from "@/actions/CRM";
import ContatosClient from "./ContatosClient";

export const dynamic = "force-dynamic";

export default async function ContatosPage() {
  const session = await auth();
  const visual = getTema((session?.user as any)?.tema_interface || "blue");
  const contatos = await buscarContatos();
  return <ContatosClient contatos={contatos} visual={visual} />;
}
