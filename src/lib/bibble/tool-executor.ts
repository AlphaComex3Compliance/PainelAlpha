import db from "@/lib/prisma";
import { getReceitaData } from "@/app/api/ReceitaFederal/route";

export async function executarTool(
  nome: string,
  params: Record<string, unknown>,
  userId: number
): Promise<string> {
  switch (nome) {
    case "buscar_empresa": {
      const cnpjRaw = String(params.cnpj || "");
      const cnpj = cnpjRaw.replace(/\D/g, "").padStart(14, "0").substring(0, 14);

      if (!cnpj || cnpj === "00000000000000") {
        return "CNPJ inválido.";
      }

      // Check DB cache first
      const cached = await db.consultas_radar.findUnique({ where: { cnpj } });
      if (cached) {
        return JSON.stringify({
          cnpj,
          razao_social: cached.razao_social,
          nome_fantasia: cached.nome_fantasia,
          situacao_radar: cached.situacao_radar,
          submodalidade: cached.submodalidade,
          regime_tributario: cached.regime_tributario,
          capital_social: cached.capital_social,
          municipio: cached.municipio,
          uf: cached.uf,
          data_constituicao: cached.data_constituicao,
          fonte: "cache_local",
        });
      }

      // Fresh from Receita Federal
      try {
        const receita = await getReceitaData(cnpj);
        return JSON.stringify({
          cnpj,
          razao_social: receita.razaoSocial,
          nome_fantasia: receita.nomeFantasia,
          municipio: receita.municipio,
          uf: receita.uf,
          regime_tributario: receita.regimeTributario,
          capital_social: receita.capitalSocial,
          situacao: receita.situacao,
          data_constituicao: receita.dataConstituicao,
          fonte: "receita_federal",
        });
      } catch {
        return `Empresa com CNPJ ${cnpj} não encontrada ou serviço da Receita Federal indisponível.`;
      }
    }

    case "listar_clientes": {
      const busca = String(params.busca || "").trim();
      const limite = Math.min(Number(params.limite || 5), 10);

      if (!busca) return "Informe um nome ou CNPJ para buscar.";

      const clientes = await db.clientes.findMany({
        where: {
          OR: [
            { razaoSocial: { contains: busca } },
            { nomeFantasia: { contains: busca } },
            { cnpj: { contains: busca.replace(/\D/g, "") } },
          ],
        },
        take: limite,
        select: {
          cnpj: true,
          razaoSocial: true,
          nomeFantasia: true,
          status: true,
          regimeTributario: true,
          analistaResponsavel: true,
          uf: true,
        },
      });

      if (!clientes.length) {
        return `Nenhum cliente encontrado para "${busca}".`;
      }

      return JSON.stringify(clientes);
    }

    case "abrir_chamado": {
      const titulo = String(params.titulo || "").trim().substring(0, 100);
      const descricao = String(params.descricao || "").trim();
      const prioridade = String(params.prioridade || "MEDIA");

      if (!titulo || !descricao) {
        return "Dados insuficientes para abrir o chamado.";
      }

      // Deduplication: no duplicate chamado in the last 5 minutes
      const cincoMinAtras = new Date(Date.now() - 5 * 60 * 1000);
      const duplicado = await db.chamados.findFirst({
        where: { usuarioId: userId, titulo, createdAt: { gte: cincoMinAtras } },
      });

      if (duplicado) {
        return `Chamado "${titulo}" já foi registrado recentemente (ID #${duplicado.id}).`;
      }

      const chamado = await db.chamados.create({
        data: {
          titulo,
          descricao: `[Aberto via Bibble]\n\n${descricao}`,
          categoria: "SUPORTE",
          prioridade,
          usuarioId: userId,
          status: "ABERTO",
        },
      });

      return `Chamado #${chamado.id} criado com título "${titulo}" e prioridade ${prioridade}.`;
    }

    default:
      return `Tool desconhecida: ${nome}`;
  }
}
