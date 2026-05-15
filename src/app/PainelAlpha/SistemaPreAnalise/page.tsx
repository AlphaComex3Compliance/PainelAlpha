import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { getTema } from "@/lib/temas";
import SistemaPreAnaliseClient from "./SistemaPreAnaliseClient";

export default async function SistemaPreAnalise() {
    const session = await auth();
    if (!session) redirect("/login");

    const temaNome = (session.user as any)?.tema_interface || "blue";
    const visual = getTema(temaNome);

    return (
        <SistemaPreAnaliseClient
            sessionUser={{
                nome: (session.user as any)?.nome ?? session.user?.nome ?? null,
                role: (session.user as any)?.role ?? null,
            }}
            visual={visual}
        />
    );
}
