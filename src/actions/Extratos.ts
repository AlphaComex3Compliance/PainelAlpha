"use server"
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "../../auth";

export async function ListarExtratos() {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Não autorizado", data: [] };

        const dados = await db.extratos.findMany({
            include: {
                periodos: {
                    include: {
                        bancos: {
                            include: {
                                transacoes: true 
                            }
                        }
                    },
                    
                }
            },
        });

        return { success: true, data: dados, error: null };
    } catch (error) {
        console.error(error);
        return { success: false, data: [], error: "Erro ao buscar no banco" };
    }
}

export async function ExtratosClientes(dados: any) {
    try {
        const session = await auth();
        const nomeUsuario = session?.user?.nome || "Usuário Alpha";

        const cnpjLimpo = String(dados.cnpj).replace(/\D/g, "");

        const res = await db.extratos.upsert({
            where: { cnpj: cnpjLimpo },
            update: {
                razaoSocial: String(dados.razaoSocial || "").toUpperCase(),
                nomeFantasia: dados.nomeFantasia?.toUpperCase() || null,
                uf: dados.uf || null,
                municipio: dados.municipio || null,
                regimeTributario: dados.regimeTributario || null,
                updatedAt: new Date(),
            },
            create: {
                cnpj: cnpjLimpo,
                razaoSocial: String(dados.razaoSocial || "").toUpperCase(),
                nomeFantasia: dados.nomeFantasia?.toUpperCase() || null,
                dataConstituicao: dados.dataConstituicao || null,
                uf: dados.uf || null,
                municipio: dados.municipio || null,
                regimeTributario: dados.regimeTributario || null,
                criadoPorNome: nomeUsuario,
            }
        });

        revalidatePath("/PainelAlpha/ExtratosBancarios");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Erro ao salvar cliente." };
    }
}

export async function BuscarEmpresaPorId(id: string | number) {
    try {
        const idNumerico = Number(id);

        if (isNaN(idNumerico)) {
            console.error("ID recebido é inválido:", id);
            return { success: false, error: "ID da empresa é inválido." };
        }

        const empresa = await db.extratos.findUnique({
            where: { id: idNumerico },
            include: {
                periodos: {
                    include: {
                        bancos: {
                            include: {
                                transacoes: true
                            }
                        } 
                        
                    },
                    orderBy: {
                        createdAt: 'desc' 
                    }
                }
            }
        });

        if (!empresa) {
            return { success: false, error: "Empresa não encontrada no banco de dados." };
        }

        return { success: true, data: empresa };

    } catch (error) {
        console.error("Erro ao buscar empresa:", error);
        return { success: false, error: "Erro interno ao buscar dados." };
    }
}






