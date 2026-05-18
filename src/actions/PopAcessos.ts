"use server";

import { auth } from "../../auth";
import db from "@/lib/prisma";
import type { Session } from "next-auth";

// ─── Constantes ────────────────────────────────────────────────────────────────

const ROLES_ADMIN = ["Admin", "CEO"] as const;
const SETORES_POP = [
  "Diretrizes",
  "T.I",
  "OPERACIONAL",
  "COMERCIAL",
  "RECURSOS HUMANOS",
  "FINANCEIRO",
  "JURÍDICO",
  "PARCEIRO",
  "SERVIÇOS GERAIS",
] as const;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function sessionUser(session: Session | null) {
  return session?.user as { id: string; role: string } | undefined;
}

function ehAdmin(role: string) {
  return (ROLES_ADMIN as readonly string[]).includes(role);
}

// ─── Core: setores acessíveis para um usuário ──────────────────────────────────
// Retorna ['*'] para admin/CEO (wildcard = tudo).
// Demais: próprio setor + "Diretrizes" + acessos extras concedidos.

async function getSetoresAcessiveis(userId: number): Promise<string[]> {
  const user = await db.usuarios.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) return [];

  if (ehAdmin(user.role)) return ["*"];

  const extras = await db.popAcesso.findMany({
    where: { usuarioId: userId, podeVer: true },
    select: { setor: true },
  });

  const setoresExtras = extras.map((e) => e.setor);
  const setorProprio = user.role.toUpperCase().trim();

  return ["Diretrizes", setorProprio, ...setoresExtras];
}

// ─── getAcessosDoUsuario ───────────────────────────────────────────────────────
// Chamado pela página DocsAlpha (client) via useEffect.
// Retorna tudo que o frontend precisa para renderizar permissões.

export async function getAcessosDoUsuario(): Promise<{
  success: boolean;
  setoresAcessiveis: string[];
  podeUpload: boolean;
  podeGerenciar: boolean;
  ehAdminUser: boolean;
  error?: string;
}> {
  const session = await auth();
  const user = sessionUser(session);

  if (!user?.id) {
    return { success: false, setoresAcessiveis: [], podeUpload: false, podeGerenciar: false, ehAdminUser: false, error: "Não autorizado" };
  }

  const userId = Number(user.id);
  const isAdminUser = ehAdmin(user.role);
  const setoresAcessiveis = await getSetoresAcessiveis(userId);

  if (isAdminUser) {
    return { success: true, setoresAcessiveis, podeUpload: true, podeGerenciar: true, ehAdminUser: true };
  }

  const acessos = await db.popAcesso.findMany({
    where: { usuarioId: userId },
    select: { podeUpload: true, podeGerenciar: true },
  });

  const podeUpload = acessos.some((a) => a.podeUpload);
  const podeGerenciar = acessos.some((a) => a.podeGerenciar);

  return { success: true, setoresAcessiveis, podeUpload, podeGerenciar, ehAdminUser: false };
}

// ─── getMatrizAcessos ──────────────────────────────────────────────────────────
// Admin only. Retorna todos usuários + seus acessos extras.

export type UsuarioMatriz = {
  id: number;
  nome: string;
  role: string;
  setorProprio: string;
  acessos: { setor: string; podeVer: boolean; podeUpload: boolean; podeGerenciar: boolean }[];
};

export async function getMatrizAcessos(): Promise<{ success: boolean; data?: UsuarioMatriz[]; error?: string }> {
  const session = await auth();
  const user = sessionUser(session);
  if (!user?.id || !ehAdmin(user.role)) {
    return { success: false, error: "Acesso restrito a administradores" };
  }

  const usuarios = await db.usuarios.findMany({
    where: { status: "ATIVO" },
    select: {
      id: true,
      nome: true,
      role: true,
      popAcessos: { select: { setor: true, podeVer: true, podeUpload: true, podeGerenciar: true } },
    },
    orderBy: { nome: "asc" },
  });

  const data: UsuarioMatriz[] = usuarios.map((u) => ({
    id: u.id,
    nome: u.nome,
    role: u.role,
    setorProprio: u.role.toUpperCase().trim(),
    acessos: u.popAcessos,
  }));

  return { success: true, data };
}

// ─── salvarAcessos ─────────────────────────────────────────────────────────────
// Admin only. Recebe lista completa de acessos extras para um usuário.
// Faz upsert/delete — NUNCA toca o setor próprio.

export type AcessoPayload = {
  usuarioId: number;
  setor: string;
  podeVer: boolean;
  podeUpload: boolean;
  podeGerenciar: boolean;
};

export async function salvarAcessos(
  payload: AcessoPayload[],
  usuariosAfetados?: number[]
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const user = sessionUser(session);
  if (!user?.id || !ehAdmin(user.role)) {
    return { success: false, error: "Acesso restrito a administradores" };
  }

  const adminId = Number(user.id);

  // Rate limit simples: máx 500 operações por chamada
  if (payload.length > 500) {
    return { success: false, error: "Payload excede limite de operações" };
  }

  // Merge payload userIds com usuariosAfetados (usuários sem novos acessos que precisam de deleteMany)
  const idsNoPayload = new Set(payload.map((p) => p.usuarioId));
  const todosIds = new Set([...idsNoPayload, ...(usuariosAfetados ?? [])]);
  const usuariosEnvolvidos = [...todosIds];

  // Validar que nenhum acesso tenta tocar o setor próprio do usuário alvo
  const usuariosDB = await db.usuarios.findMany({
    where: { id: { in: usuariosEnvolvidos } },
    select: { id: true, role: true },
  });
  const setorMap = new Map(usuariosDB.map((u) => [u.id, u.role.toUpperCase().trim()]));

  for (const item of payload) {
    const setorProprio = setorMap.get(item.usuarioId);
    if (setorProprio && item.setor.toUpperCase().trim() === setorProprio) {
      return { success: false, error: `Setor próprio não pode ser alterado via PopAcesso (usuário ${item.usuarioId})` };
    }
  }

  // Agrupar por usuário: deletar todos extras atuais e reinserir
  for (const usuarioId of usuariosEnvolvidos) {
    const itensDoUsuario = payload.filter((p) => p.usuarioId === usuarioId);

    await db.popAcesso.deleteMany({ where: { usuarioId } });

    if (itensDoUsuario.length > 0) {
      await db.popAcesso.createMany({
        data: itensDoUsuario.map((item) => ({
          usuarioId: item.usuarioId,
          setor: item.setor,
          podeVer: item.podeVer,
          podeUpload: item.podeUpload,
          podeGerenciar: item.podeGerenciar,
          concedidoPor: adminId,
        })),
      });
    }
  }

  return { success: true };
}

// ─── concederAcesso ────────────────────────────────────────────────────────────

export async function concederAcesso(
  usuarioId: number,
  setor: string,
  perms: { podeVer?: boolean; podeUpload?: boolean; podeGerenciar?: boolean }
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const user = sessionUser(session);
  if (!user?.id || !ehAdmin(user.role)) {
    return { success: false, error: "Acesso restrito a administradores" };
  }

  // Bloquear setor próprio
  const alvo = await db.usuarios.findUnique({ where: { id: usuarioId }, select: { role: true } });
  if (alvo && setor.toUpperCase().trim() === alvo.role.toUpperCase().trim()) {
    return { success: false, error: "Setor próprio sempre acessível — não precisa de registro" };
  }

  await db.popAcesso.upsert({
    where: { usuarioId_setor: { usuarioId, setor } },
    create: {
      usuarioId,
      setor,
      podeVer: perms.podeVer ?? true,
      podeUpload: perms.podeUpload ?? false,
      podeGerenciar: perms.podeGerenciar ?? false,
      concedidoPor: Number(user.id),
    },
    update: {
      podeVer: perms.podeVer ?? true,
      podeUpload: perms.podeUpload ?? false,
      podeGerenciar: perms.podeGerenciar ?? false,
      concedidoPor: Number(user.id),
    },
  });

  return { success: true };
}

// ─── revogarAcesso ─────────────────────────────────────────────────────────────

export async function revogarAcesso(
  usuarioId: number,
  setor: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  const user = sessionUser(session);
  if (!user?.id || !ehAdmin(user.role)) {
    return { success: false, error: "Acesso restrito a administradores" };
  }

  // Bloquear revogação do setor próprio
  const alvo = await db.usuarios.findUnique({ where: { id: usuarioId }, select: { role: true } });
  if (alvo && setor.toUpperCase().trim() === alvo.role.toUpperCase().trim()) {
    return { success: false, error: "Não é possível revogar o acesso ao setor próprio" };
  }

  await db.popAcesso.deleteMany({ where: { usuarioId, setor } });

  return { success: true };
}

