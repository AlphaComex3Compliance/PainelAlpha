import db from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { cnpjs } = await req.json();

        await db.consultas_radar.deleteMany({
            where: {
                cnpj: { in: cnpjs },
                OR: [
                    { situacao_radar: "ERRO" },
                    { razao_social: "" },
                    { razao_social: "Erro na consulta automática" }
                ]
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erro na limpeza" }, { status: 500 });
    }
}
