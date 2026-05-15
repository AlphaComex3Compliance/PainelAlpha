import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch(
            "https://api.infosimples.com/api/admin/account",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    token: process.env.INFOSIMPLES_TOKEN!,
                }),
                signal: AbortSignal.timeout(8000), 
            }
        );

        const data = await response.json();

        if (data.code !== 200 || !data.data || !data.data[0]) {
            return NextResponse.json({
                saldo: 0, 
                erro: "API_OFFLINE",
                message: data.msg || "Erro na InfoSimples"
            });
        }

        const conta = data.data[0];

        return NextResponse.json({
            saldo: conta.balance ?? 0, 
            consumo: conta.current_usage,
            fatura: conta.current_bill,
            limiteAlerta: conta.balance_threshold,
            prepaid: conta.prepaid,
            name: conta.name,
        });

    } catch (error) {
        return NextResponse.json({ 
            saldo: 0, 
            consumo: 0, 
            status: "offline",
            message: "Erro de conexão" 
        });
    }
}
