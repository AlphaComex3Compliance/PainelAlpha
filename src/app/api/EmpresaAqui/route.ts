import { NextResponse } from "next/server";
import https from "https";

export const dynamic = 'force-dynamic';

async function consultarExterno(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { 
            rejectUnauthorized: false,
            family: 4, 
            headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(new Error("Resposta não é um JSON válido"));
                }
            });
        });
        req.on('error', (err) => reject(err));
        req.end();
    });
}

export async function getEmpresaAquiData(cnpj: string) {
    const token = process.env.EMPRESAQUI_TOKEN?.trim();
    if (!token) throw new Error("Token EmpresaAqui não configurado");

    const cleanCnpj = cnpj.replace(/\D/g, "");
    const urlEA = `https://www.empresaqui.com.br/api/${token}/${cleanCnpj}`;

    const dados = await consultarExterno(urlEA);

    if (dados?.error || dados?.status === "error") {
        throw new Error(dados.message || "Erro na API EmpresaAqui");
    }

    return dados;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const cnpj = (searchParams.get("cnpj") || "").replace(/\D/g, "");

        if (!cnpj || cnpj.length !== 14) {
            return NextResponse.json({ error: "CNPJ inválido ou ausente" }, { status: 400 });
        }

        const dados = await getEmpresaAquiData(cnpj);
        return NextResponse.json(dados);

    } catch (err: any) {
        console.error("🔥 [EA] ERRO:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}