
import { redirect } from "next/navigation";
import { auth } from "../../../../../auth";
import { getPerformanceAcumulada, getPerformanceMarketing } from "@/actions/ComercialControle";
import MarketingDashboard from "./dashboard";

export default async function MarketingPage({
    searchParams,
}: {
    searchParams: Promise<{ mes?: string }>;
}) {

    const session = await auth();
    const sParams = await searchParams;

    if (!session) redirect("/");

    const mes = parseInt(sParams?.mes || new Date().getMonth().toString());
    const ano = new Date().getFullYear();

    const dadosEquipe = await getPerformanceMarketing(mes, ano);
    
    const dadosGerais = await getPerformanceAcumulada(session.user.nome, mes, ano); 

    return (
        <MarketingDashboard
            dadosEquipe={dadosEquipe}
        />
    );
}