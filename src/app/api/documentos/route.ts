import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exibirTodos = searchParams.get("todos") === "true";

    const documentos = await db.documentos.findMany({
      where: exibirTodos ? undefined : {
        OR: [{ status: "ATIVO" }, { status: null }],
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(documentos.map(doc => ({
      ...doc,
      status: doc.status || "ATIVO",
      criado_por: doc.criado_por || "SISTEMA",
      protecao: doc.protecao || "ATIVO",
    })));
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, titulo, setor, PastaArquivos, protecao, ordem_manual } = body;

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    if (titulo !== undefined || setor !== undefined || PastaArquivos !== undefined || protecao !== undefined) {
      await db.documentos.update({
        where: { id },
        data: { titulo, setor, PastaArquivos, status, protecao, ordem_manual: ordem_manual || 0 },
      });
    } else {
      await db.documentos.update({
        where: { id },
        data: { status },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no PATCH:", error);
    return NextResponse.json({ error: "Erro ao atualizar documento" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID necessário" }, { status: 400 });
    }

    await db.documentos.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar:", error);
    return NextResponse.json({ error: "Erro ao excluir do banco" }, { status: 500 });
  }
}
