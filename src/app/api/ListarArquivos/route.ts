import db from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const busca = searchParams.get("nome") || "";
  const ordem = searchParams.get("ordem") === "antigos" ? "asc" : "desc";

  const arquivos = await db.arquivos_radar.findMany({
  where: {
    nome_arquivo: {
      contains: busca,
    },
  },
  orderBy: { data_upload: ordem },
});

  return NextResponse.json(arquivos);
}
