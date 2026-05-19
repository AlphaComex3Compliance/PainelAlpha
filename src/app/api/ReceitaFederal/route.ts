import { NextResponse } from "next/server";

function fmtDate(iso: string | null | undefined): string {
    if (!iso) return "";
    const parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

async function getReceitaDataFromCnpjWs(cnpj: string) {
    const resp = await fetch(
        `https://publica.cnpj.ws/cnpj/${cnpj}`,
        { cache: "no-store", headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (!resp.ok) throw new Error(`publica.cnpj.ws HTTP ${resp.status}`);
    const d = await resp.json();
    if (d.message) throw new Error(d.message);

    const est = d.estabelecimento || {};
    const simples = d.simples || {};
    const mapCnae = (item: any) => ({ code: item.subclasse || item.id || "", text: item.descricao || "" });

    return {
        cnpj: est.cnpj || cnpj,
        razaoSocial: (d.razao_social || "").toUpperCase(),
        nomeFantasia: (est.nome_fantasia || "Sem nome fantasia").toUpperCase(),
        municipio: (est.cidade?.nome || "").toUpperCase(),
        uf: (est.estado?.sigla || "").toUpperCase(),
        dataConstituicao: fmtDate(est.data_inicio_atividade),
        regimeTributario: simples.simples === "Sim" ? "Simples Nacional" : "Regime Normal",
        capitalSocial: d.capital_social || 0,
        data_opcao: simples.data_opcao_simples || null,
        optante_simples: simples.simples === "Sim",
        data_exclusaoSimples: simples.data_exclusao_simples || null,
        optante_simei: simples.mei === "Sim",
        data_opcaoSimei: simples.data_opcao_mei || null,
        data_exclusaoSimei: simples.data_exclusao_mei || null,
        atividade_principal: est.atividade_principal ? [mapCnae(est.atividade_principal)] : [],
        atividades_secundarias: (est.atividades_secundarias || []).map(mapCnae),
        abertura_bruta: est.data_inicio_atividade || "",
        simples: {
            optante: simples.simples === "Sim",
            data_opcao: simples.data_opcao_simples || null,
            data_exclusao: simples.data_exclusao_simples || null,
        },
        bairro: (est.bairro || "").toUpperCase(),
        cep: est.cep,
        email: (est.email || "").toLowerCase(),
        telefone: est.ddd1 && est.telefone1 ? `(${est.ddd1}) ${est.telefone1}` : "",
        logradouro: (est.logradouro || "").toUpperCase(),
        numero: est.numero,
        situacao: (est.situacao_cadastral || "ATIVA").toUpperCase(),
        natureza_juridica: d.natureza_juridica?.descricao || "",
        porte: d.porte?.descricao || "",
        qsa: (d.socios || []).map((s: any) => ({ nome: s.nome, qual: s.qualificacao_socio?.descricao || "" }))
    };
}

export async function getReceitaData(cnpj: string) {
    try {
        const resp = await fetch(
            `https://www.receitaws.com.br/v1/cnpj/${cnpj}`,
            {
                cache: "no-store",
                headers: { 'User-Agent': 'Mozilla/5.0' }
            }
        );

        if (resp.ok) {
            const d = await resp.json();
            if (!d.status || d.status === "OK") {
                return {
                    cnpj: d.cnpj,
                    razaoSocial: (d.nome || "").toUpperCase(),
                    nomeFantasia: (d.fantasia || "Sem nome fantasia").toUpperCase(),
                    municipio: (d.municipio || "").toUpperCase(),
                    uf: (d.uf || "").toUpperCase(),
                    dataConstituicao: d.abertura || "",
                    regimeTributario: d.simples?.optante ? "Simples Nacional" : "Regime Normal",
                    capitalSocial: d.capital_social || 0,
                    data_opcao: d.simples?.data_opcao || d.opcao_pelo_simples_data || null,
                    optante_simples: !!d.simples?.optante,
                    data_exclusaoSimples: d.simples?.data_exclusao,
                    optante_simei: !!d.simei?.optante,
                    data_opcaoSimei: d.simei?.data_opcao,
                    data_exclusaoSimei: d.simei?.data_exclusao,
                    atividade_principal: d.atividade_principal || [],
                    atividades_secundarias: d.atividades_secundarias || [],
                    abertura_bruta: d.abertura,
                    simples: d.simples,
                    bairro: (d.bairro || "").toUpperCase(),
                    cep: d.cep,
                    email: (d.email || "").toLowerCase(),
                    telefone: d.telefone,
                    logradouro: (d.logradouro || "").toUpperCase(),
                    numero: d.numero,
                    situacao: (d.situacao || "ATIVA").toUpperCase(),
                    natureza_juridica: d.natureza_juridica,
                    porte: d.porte,
                    qsa: d.qsa || []
                };
            }
        }
    } catch {
        // ReceitaWS falhou — tenta fallback
    }

    console.log(`ReceitaWS falhou para ${cnpj}, tentando publica.cnpj.ws`);
    return await getReceitaDataFromCnpjWs(cnpj);
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const cnpj = (searchParams.get("cnpj") || "").replace(/\D/g, "");

        if (!cnpj || cnpj.length !== 14) {
            return NextResponse.json(
                { error: "CNPJ obrigatório e deve conter 14 dígitos" },
                { status: 400 }
            );
        }

        const data = await getReceitaData(cnpj);

        return NextResponse.json({
            ...data,
            capitalSocialFormatado: data.capitalSocial
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(data.capitalSocial))
                : "R$ 0,00",
            cnaes: {
                principal: data.atividade_principal,
                secundarios: data.atividades_secundarias
            }
        });

    } catch (err: any) {
        console.error("ReceitaFederal ERROR:", err.message);
        return NextResponse.json(
            { error: err.message || "Erro interno ao consultar CNPJ" },
            { status: 500 }
        );
    }
}
