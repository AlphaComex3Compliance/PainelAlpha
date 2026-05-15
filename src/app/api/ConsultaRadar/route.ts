import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cnpj = (searchParams.get("cnpj") || "").replace(/\D/g, "");

    if (!cnpj) {
      return NextResponse.json(
        { error: "CNPJ obrigatório" },
        { status: 400 }
      );
    }

    const token = process.env.API_TOKEN;
    const urlRadar = process.env.URL_RADAR;

    if (!token || !urlRadar) {
      return NextResponse.json(
        { error: "API RADAR não configurada" },
        { status: 500 }
      );
    }

    const params = new URLSearchParams();
    params.append("cnpj", cnpj);
    params.append("token", token);
    params.append("timeout", "300");

    const resp = await fetch(urlRadar, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Erro RADAR HTTP ${resp.status}` },
        { status: resp.status }
      );
    }

    const json = await resp.json();

    const raw = json?.data;
    const dados =
      Array.isArray(raw) ? raw[0] : raw?.[0] || raw || null;

      console.log("DADOS CRUS DA API RADAR:", JSON.stringify(dados, null, 2));

      return NextResponse.json({
        contribuinte:
          dados?.contribuinte ||
          dados?.nome_contribuinte ||
          dados?.razao_social ||
          dados?.nome ||
          
      
      "",
        situacao:
          dados?.situacao ||
          dados?.situacao_habilitacao ||
          dados?.descricao_situacao ||
          dados?.status ||
          "NÃO LOCALIZADO",
        dataSituacao:
          dados?.data_situacao ||
          dados?.situacao_data ||
          dados?.data_evento ||
          dados?.data ||
          "",
        submodalidade:
          dados?.submodalidade ||
          dados?.submodalidade_texto ||
          dados?.modalidade ||
          "N/A",
      });
  } catch (err) {
    console.error("RADAR ERROR:", err);
    return NextResponse.json(
      { error: "Erro interno RADAR" },
      { status: 500 }
    );
  }
  
}
