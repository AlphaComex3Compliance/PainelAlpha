"use server"
import db from "@/lib/prisma";

export async function getUsers() {
  try {
    const users = await db.usuarios.findMany();
    
    return users || []; 
  } catch (error) {
    console.error("Erro no Banco de Dados:", error);
    return []; 
  }
}