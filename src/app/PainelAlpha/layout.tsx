import type { Metadata } from "next";
import "./style.css";
import { Toaster } from "sonner";
import { auth } from "../../../auth";
import PainelLayoutClient from "@/components/layout/PainelLayoutClient";
import { getPermissoesEfetivas } from "@/actions/PermissoesSetor";

export const metadata: Metadata = {
  title: "Painel Alpha",
};

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string; nome?: string; name?: string; imagemUrl?: string } | undefined;

  const userId = Number(user?.id ?? 0);
  const role = user?.role ?? 'User';

  let permissoes: string[] = [];
  if (userId > 0) {
    permissoes = await getPermissoesEfetivas(userId);
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      <Toaster richColors position="top-right" />
      <PainelLayoutClient
        permissoes={permissoes}
        role={role}
        nome={user?.nome ?? user?.name ?? "Operador"}
        imagemUrl={user?.imagemUrl ?? null}
      >
        {children}
      </PainelLayoutClient>
    </div>
  );
}
