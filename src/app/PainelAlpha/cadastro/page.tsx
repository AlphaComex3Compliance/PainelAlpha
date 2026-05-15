import { auth } from '../../../../auth'
import CadastroUsuarios from "@/components/FormCadastro";
import { redirect } from 'next/navigation';

export default async function CadastroPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  if (session?.user?.role !== "Admin" && !session?.user?.permissoes?.includes("cadastro")) {
    redirect("/"); 
  }

  return (
    <main className="text-alpha min-h-screen bg-[#020617] flex flex-col">

      <div className="text-alpha flex-1 w-full h-full flex flex-col overflow-hidden">
        <CadastroUsuarios />
      </div>
    </main>
  );
}
