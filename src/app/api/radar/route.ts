import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "Radar API Online",
    message: "Utilize as Server Actions para operações de banco de dados." 
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: "Acesso via HTTP POST não configurado. Use as funções importadas de radarActions." 
  }, { status: 405 });
}
