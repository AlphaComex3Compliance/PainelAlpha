import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPrivateRoute = nextUrl.pathname.startsWith("/PainelAlpha");

      if (isPrivateRoute) {
        if (isLoggedIn) return true;
        return false; 
      }
      return true;
    },
  },
} satisfies NextAuthConfig;