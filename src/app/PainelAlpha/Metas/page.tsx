import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { getDadosMetas } from "@/actions/Metas";
import MetasClient from "./MetasClient";

export const dynamic = "force-dynamic";

export default async function MetasPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const dados = await getDadosMetas();
    const agora = new Date();

    return (
        <MetasClient
            dadosIniciais={dados}
            isAdmin={session.user.role === "Admin"}
            mesAtual={agora.getMonth() + 1}
            anoAtual={agora.getFullYear()}
        />
    );
}
