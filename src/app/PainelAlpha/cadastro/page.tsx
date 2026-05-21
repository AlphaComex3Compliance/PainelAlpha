import { auth } from '../../../../auth'
import CadastroUsuarios from "@/components/FormCadastro";
import { redirect } from 'next/navigation';
import { getPermissoesEfetivas } from '@/actions/PermissoesSetor';

const ROLES_GESTAO = ['Admin', 'CEO', 'RECURSOS HUMANOS', 'FINANCEIRO'];

export default async function CadastroPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const role = session?.user?.role ?? '';
  const userId = Number(session?.user?.id);

  if (!ROLES_GESTAO.includes(role)) {
    const permissoes = userId > 0 ? await getPermissoesEfetivas(userId) : [];
    if (!permissoes.includes("cadastro")) {
      redirect("/PainelAlpha");
    }
  }

  return (
    <main className="text-alpha min-h-screen bg-[#020617] flex flex-col">
      <div className="text-alpha flex-1 w-full h-full flex flex-col overflow-hidden">
        <CadastroUsuarios currentUserRole={role} />
      </div>
    </main>
  );
}
