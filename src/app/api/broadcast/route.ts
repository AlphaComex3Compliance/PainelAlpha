import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const aviso = await db.avisos_globais.findFirst({
      where: { ativo: true },
      orderBy: { criado_em: 'desc' }
    });

    return NextResponse.json(aviso || { nenhum: true }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro na escuta" }, { status: 500 });
  }
}
