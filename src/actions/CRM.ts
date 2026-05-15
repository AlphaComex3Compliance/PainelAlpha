"use server";

import { auth } from "../../auth";
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const REVALIDATE = "/PainelAlpha/AlphaCRM";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EtapaKanban =
  | "PROSPECCAO"
  | "QUALIFICACAO"
  | "REUNIAO"
  | "PROPOSTA"
  | "NEGOCIACAO"
  | "FECHADO_GANHO"
  | "FECHADO_PERDIDO";

export type TipoAtividade = "LIGACAO" | "EMAIL" | "REUNIAO" | "TAREFA" | "NOTA";

// ─── Oportunidades ────────────────────────────────────────────────────────────

export async function criarOportunidade(data: {
  titulo: string;
  empresa?: string;
  valor?: number;
  etapa?: EtapaKanban;
  probabilidade?: number;
  clienteId?: number;
  descricao?: string;
  dataFechamento?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    const op = await (db as any).crm_oportunidades.create({
      data: {
        titulo: data.titulo.trim(),
        empresa: data.empresa?.trim() || null,
        valor: data.valor ?? null,
        etapa: data.etapa ?? "PROSPECCAO",
        probabilidade: data.probabilidade ?? 50,
        responsavelId: Number(session.user.id),
        clienteId: data.clienteId ?? null,
        descricao: data.descricao?.trim() || null,
        dataFechamento: data.dataFechamento || null,
        ordem: 0,
      },
    });
    revalidatePath(REVALIDATE);
    return { success: true, id: op.id };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function atualizarOportunidade(
  id: number,
  data: Partial<{
    titulo: string;
    empresa: string;
    valor: number | null;
    etapa: EtapaKanban;
    probabilidade: number;
    clienteId: number | null;
    descricao: string;
    dataFechamento: string;
    perdaMotivo: string;
    ordem: number;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await (db as any).crm_oportunidades.update({ where: { id }, data });
    revalidatePath(REVALIDATE);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function moverOportunidade(id: number, novaEtapa: EtapaKanban) {
  return atualizarOportunidade(id, { etapa: novaEtapa });
}

export async function excluirOportunidade(id: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await (db as any).crm_oportunidades.delete({ where: { id } });
    revalidatePath(REVALIDATE);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function buscarOportunidades() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    return await (db as any).crm_oportunidades.findMany({
      include: {
        responsavel: { select: { id: true, nome: true, imagemUrl: true } },
        cliente: { select: { id: true, razaoSocial: true, nomeFantasia: true } },
        atividades: { where: { concluida: false }, select: { id: true } },
      },
      orderBy: [{ etapa: "asc" }, { ordem: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}

// ─── Contatos ────────────────────────────────────────────────────────────────

export async function criarContato(data: {
  nome: string;
  email?: string;
  telefone?: string;
  cargo?: string;
  empresa?: string;
  clienteId?: number;
  origem?: string;
  tags?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await (db as any).crm_contatos.create({
      data: {
        nome: data.nome.trim(),
        email: data.email?.trim() || null,
        telefone: data.telefone?.trim() || null,
        cargo: data.cargo?.trim() || null,
        empresa: data.empresa?.trim() || null,
        clienteId: data.clienteId ?? null,
        origem: data.origem || null,
        tags: data.tags || null,
      },
    });
    revalidatePath(REVALIDATE);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function atualizarContato(
  id: number,
  data: Partial<{
    nome: string;
    email: string;
    telefone: string;
    cargo: string;
    empresa: string;
    clienteId: number | null;
    origem: string;
    tags: string;
  }>
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await (db as any).crm_contatos.update({ where: { id }, data });
    revalidatePath(REVALIDATE);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function excluirContato(id: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await (db as any).crm_contatos.delete({ where: { id } });
    revalidatePath(REVALIDATE);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function buscarContatos(busca?: string) {
  try {
    return await (db as any).crm_contatos.findMany({
      where: busca
        ? {
            OR: [
              { nome: { contains: busca } },
              { empresa: { contains: busca } },
              { email: { contains: busca } },
            ],
          }
        : undefined,
      include: {
        cliente: { select: { id: true, razaoSocial: true } },
      },
      orderBy: { nome: "asc" },
    });
  } catch {
    return [];
  }
}

// ─── Atividades ──────────────────────────────────────────────────────────────

export async function criarAtividade(data: {
  tipo: TipoAtividade;
  titulo: string;
  descricao?: string;
  dataPrevista?: string;
  oportunidadeId?: number;
  clienteId?: number;
  contatoId?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await (db as any).crm_atividades.create({
      data: {
        tipo: data.tipo,
        titulo: data.titulo.trim(),
        descricao: data.descricao?.trim() || null,
        dataPrevista: data.dataPrevista || null,
        oportunidadeId: data.oportunidadeId ?? null,
        clienteId: data.clienteId ?? null,
        contatoId: data.contatoId ?? null,
        autorId: Number(session.user.id),
        concluida: false,
      },
    });
    revalidatePath(REVALIDATE);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function concluirAtividade(id: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await (db as any).crm_atividades.update({
      where: { id },
      data: { concluida: true, dataRealizada: new Date().toISOString() },
    });
    revalidatePath(REVALIDATE);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function excluirAtividade(id: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    await (db as any).crm_atividades.delete({ where: { id } });
    revalidatePath(REVALIDATE);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function buscarAtividades(filtros?: {
  concluida?: boolean;
  oportunidadeId?: number;
  autorId?: number;
}) {
  try {
    return await (db as any).crm_atividades.findMany({
      where: {
        ...(filtros?.concluida !== undefined ? { concluida: filtros.concluida } : {}),
        ...(filtros?.oportunidadeId ? { oportunidadeId: filtros.oportunidadeId } : {}),
        ...(filtros?.autorId ? { autorId: filtros.autorId } : {}),
      },
      include: {
        autor: { select: { id: true, nome: true, imagemUrl: true } },
        oportunidade: { select: { id: true, titulo: true, empresa: true } },
        contato: { select: { id: true, nome: true } },
      },
      orderBy: [{ concluida: "asc" }, { dataPrevista: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}

// ─── Dashboard stats ─────────────────────────────────────────────────────────

export async function buscarStatsCRM() {
  try {
    const [oportunidades, atividades, contatos, clientes] = await Promise.all([
      (db as any).crm_oportunidades.findMany({
        select: { etapa: true, valor: true, createdAt: true },
      }),
      (db as any).crm_atividades.findMany({
        where: { concluida: false },
        select: { id: true, tipo: true, dataPrevista: true },
      }),
      (db as any).crm_contatos.count(),
      (db as any).crm_oportunidades.groupBy({
        by: ["etapa"],
        _count: { id: true },
        _sum: { valor: true },
      }),
    ]);

    const hoje = new Date().toISOString().split("T")[0];
    const atividadesHoje = atividades.filter(
      (a: any) => a.dataPrevista?.startsWith(hoje)
    ).length;
    const atividadesAtrasadas = atividades.filter(
      (a: any) => a.dataPrevista && a.dataPrevista < hoje
    ).length;

    const pipelineTotal = oportunidades
      .filter((o: any) => !["FECHADO_GANHO", "FECHADO_PERDIDO"].includes(o.etapa))
      .reduce((sum: number, o: any) => sum + (o.valor || 0), 0);

    const fechadosGanho = oportunidades.filter((o: any) => o.etapa === "FECHADO_GANHO");
    const receitaFechada = fechadosGanho.reduce((sum: number, o: any) => sum + (o.valor || 0), 0);

    const totalOps = oportunidades.length;
    const ganhos = fechadosGanho.length;
    const taxaConversao = totalOps > 0 ? Math.round((ganhos / totalOps) * 100) : 0;

    return {
      pipelineTotal,
      receitaFechada,
      totalOportunidades: totalOps,
      totalContatos: contatos,
      atividadesHoje,
      atividadesAtrasadas,
      taxaConversao,
      porEtapa: clientes,
    };
  } catch {
    return {
      pipelineTotal: 0,
      receitaFechada: 0,
      totalOportunidades: 0,
      totalContatos: 0,
      atividadesHoje: 0,
      atividadesAtrasadas: 0,
      taxaConversao: 0,
      porEtapa: [],
    };
  }
}
