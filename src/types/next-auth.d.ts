import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nome: string;
      usuario: string;
      email: string;
      role: string;
      permissoes?: string[];
      imagemUrl?: string | null;
      atalhos?: string | null;
      esconderBloqueados: boolean;
    };
  }

  interface User {
    id: string;
    nome: string;
    usuario: string;
    email: string;
    role: string;
    permissoes?: string | string[];
    atalhos?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    nome?: string;
    usuario?: string;
    email?: string;
    role?: string;
    permissoes?: string[];
  }
}
