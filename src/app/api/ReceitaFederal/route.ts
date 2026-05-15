import { NextResponse } from "next/server";

export async function getReceitaData(cnpj: string) {
    const resp = await fetch(
        `https://www.receitaws.com.br/v1/CNPJ/${cnpj}`,
        {
            cache: "no-store",
            headers: { 'User-Agent': 'Mozilla/5.0' }
        }
    );

    if (!resp.ok) throw new Error(`Erro ReceitaWS HTTP ${resp.status}`);

    const d = await resp.json();

    if (d.status && d.status !== "OK") throw new Error(d.message);

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
        console.error("ReceitaWS ERROR:", err.message);
        return NextResponse.json(
            { error: err.message || "Erro interno ao consultar ReceitaWS" },
            { status: 500 }
        );
    }
}