import { NextResponse } from "next/server";
import db from "@/lib/prisma";
import { auth } from "../../../../auth";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Off" }, { status: 401 });

  try {
    await db.usuarios.update({
      where: { email: session.user.email },
      data: { ultimo_aviso: new Date().toISOString() }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no sinal de vida:", error);
    return NextResponse.json({ error: "Erro no sinal" }, { status: 500 });
  }
}
