import { auth } from "../../auth";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  if (session.user.role !== "Admin") {
    throw new Error("Voce nao tem permissao");
  }

  return session;
}
