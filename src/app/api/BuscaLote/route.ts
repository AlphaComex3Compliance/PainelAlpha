import db from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { cnpjs } = await req.json();

    if (!cnpjs || !Array.isArray(cnpjs)) {
      return NextResponse.json({ error: "Lista de CNPJs inválida" }, { status: 400 });
    }

    const registros = await db.consultas_radar.findMany({
      where: {
        cnpj: { in: cnpjs }
      }
    });

    return NextResponse.json(registros);
  } catch (error) {
    console.error("Erro na API BuscarLoteBanco:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
