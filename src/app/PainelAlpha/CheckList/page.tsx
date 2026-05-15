import db from "@/lib/prisma";
import ListaClientesOperacional from "./ListaClientesOperacional";
import { Plus } from "lucide-react";

export default async function OperacionalPage() {

    
    const empresas = await db.operacionalClientes.findMany({ include: { cliente: true } });
    const usuarios = await db.clienteOperacional.findMany(); // Busca todos os usuários de acesso

    const clientes = await db.operacionalClientes.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-8 space-y-8 bg-[#020617] min-h-screen text-slate-200">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">
                        Portfolio Operacional
                    </h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                        Gestão de Clientes e Protocolos
                    </p>
                </div>


            </header>

            <ListaClientesOperacional dadosIniciais={clientes} usuariosAcesso={usuarios} />
        </div>
    );
}