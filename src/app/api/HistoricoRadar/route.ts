import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function GET() {
  const dados = await db.consultas_radar.findMany({
    orderBy: { data_consulta: "desc" },
  });

  return NextResponse.json(dados);
}
