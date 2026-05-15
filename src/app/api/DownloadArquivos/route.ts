import db from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam) return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });

    const idArquivo = Number(idParam);

    const registros = await db.consultas_radar.findMany({
      where: { 
        arquivo_id: idArquivo 
      }
    });

    console.log(`Download solicitado para arquivo ${idArquivo}. Encontrados: ${registros.length}`);

    if (registros.length === 0) {
      return NextResponse.json({ error: "Nenhum dado vinculado a este arquivo." }, { status: 404 });
    }

    return NextResponse.json(registros);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
