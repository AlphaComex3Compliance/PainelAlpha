import { auth } from "../../../../auth";
import PaginaControle from "./PaginaControle";
import { redirect } from "next/navigation";
import { getTema } from "@/lib/temas";

export default async function ControleLeadsPage() {
  const session = await auth();


  const temaNome = (session?.user as any)?.tema_interface || "blue";
  const style = getTema(temaNome);

  if (!session) {
    redirect("/");
  }

  return <PaginaControle
    usuario={session.user}
    temaConfig={style}
  />;
}