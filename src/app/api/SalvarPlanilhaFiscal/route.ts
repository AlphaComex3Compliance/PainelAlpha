import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("arquivo") as Blob;

        if (!file) return NextResponse.json({ error: "Arquivo nulo" }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = (file as any).name || `export_${Date.now()}.xlsx`;

        await db.historico_planilha_fiscal.create({
            data: {
                nome: filename,
                arquivo: buffer,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
