"use server";

import  db  from "@/lib/prisma";

export async function BuscarTodosUsuarios() {
    try {
        const usuarios = await db.usuarios.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                role: true,
                imagemUrl: true, 
                status: true,
            },
            orderBy: { nome: 'asc' }
        });

        return { success: true, data: usuarios };
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        return { success: false, data: [] };
    }
}