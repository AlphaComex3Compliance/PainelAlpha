import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const dados = await req.json();

    console.log("Dados recebidos para a ficha:", dados);

    return NextResponse.json({ success: true, message: "Ficha processada!" });
}