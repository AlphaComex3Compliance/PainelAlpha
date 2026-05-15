import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { documentos } = await req.json();
    for (const doc of documentos) {
      await db.documentos.update({
        where: { id: doc.id },
        data: { ordem_manual: doc.ordem, titulo: doc.titulo },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
