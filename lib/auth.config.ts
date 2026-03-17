import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [
    // We'll add the real Credentials provider in auth.ts to avoid Edge Runtime issues with bcrypt
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: any) {
      const isAuth = !!auth?.user;
      const isAdminPage = nextUrl.pathname.startsWith("/admin");
      
      if (isAdminPage) {
        if (isAuth) return true;
        return false; // Redirect to login
      }
      return true;
    },
    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
