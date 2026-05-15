"use server";
import db from "@/lib/prisma";

export async function getConsultasPaginadas(
    page: number = 1,
    limit: number = 20,
    filtros: any = {}
) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filtros.filtroSituacao && filtros.filtroSituacao !== "todos") {
        where.situacao_radar = filtros.filtroSituacao;
    }

    if (filtros.filtroSubmodalidade && filtros.filtroSubmodalidade !== "todos") {
        where.submodalidade = filtros.filtroSubmodalidade;
    }

    let orderBy: any = { data_consulta: 'desc' };

    if (filtros.ordem === "asc") orderBy = { razao_social: 'asc' };
    if (filtros.ordem === "desc") orderBy = { razao_social: 'desc' };
    if (filtros.ordemData === "antigos") orderBy = { data_consulta: 'asc' };
    if (filtros.ordemData === "recentes") orderBy = { data_consulta: 'desc' };

    try {
        const [consultas, total] = await Promise.all([
            db.consultas_radar.findMany({
                where,
                take: limit,
                skip: skip,
                orderBy,
            }),
            db.consultas_radar.count({ where }),
        ]);

        return {
            success: true,
            data: consultas.map(c => ({
                
                cnpj: c.cnpj,
                razaoSocial: c.razao_social,
                nomeFantasia: c.nome_fantasia,
                situacao: c.situacao_radar,
                submodalidade: c.submodalidade,
                municipio: c.municipio,
                dataSituacao: c.data_situacao,
                dataConstituicao: c.data_constituicao,
                regimeTributario: c.regime_tributario,
                capitalSocial: c.capital_social,
                data_opcao: c.data_opcao,
                dataConsulta: c.data_consulta,
                uf: c.uf

            })),
            totalPages: Math.ceil(total / limit),
            totalRecords: total
        };
    } catch (error) {
        console.error("Erro na busca:", error);
        return { success: false, data: [], totalPages: 0, totalRecords: 0 };
    }
}

export async function getConsultasHoje(filtros: any = {}) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const where: any = {
        data_consulta: { gte: hoje }
    };

    if (filtros.filtroSituacao && filtros.filtroSituacao !== "todos") {
        where.situacao_radar = filtros.filtroSituacao;
    }

    if (filtros.filtroSubmodalidade && filtros.filtroSubmodalidade !== "todos") {
        where.submodalidade = filtros.filtroSubmodalidade;
    }

    // Ordenação
    let orderBy: any = { data_consulta: 'desc' };
    if (filtros.ordem === "asc") orderBy = { razao_social: 'asc' };
    if (filtros.ordem === "desc") orderBy = { razao_social: 'desc' };

    try {
        const consultas = await db.consultas_radar.findMany({
            where,
            orderBy,
        });

        return {
            success: true,
            data: consultas.map(c => ({
                razaoSocial: c.razao_social,
                cnpj: c.cnpj,
                id: c.id
            }))
        };
    } catch (error) {
        return { success: false, data: [] };
    }
}

