import db from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { ids } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json([]);
  }

  const registros = await db.consultas_radar.findMany({
    where: {
      id: { in: ids },
    },
    orderBy: { data_consulta: "desc" },
  });

  return NextResponse.json(registros);
}
