import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email as string },
        });

        if (!admin || !admin.active) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          admin.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        } as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
