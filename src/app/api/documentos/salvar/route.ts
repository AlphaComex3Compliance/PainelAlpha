import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function POST(req: Request) {
  const { titulo, PastaArquivos, url, setor, tipo } = await req.json();

  try {
    await db.documentos.create({
      data: { titulo, PastaArquivos, url, setor, tipo },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao salvar documento" }, { status: 500 });
  }
}
