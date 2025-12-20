/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_AUTH_LOGIN } from "@/lib/apiEndpoint";

interface LoginResponse {
  user: {
    id: string;
    username: string;
    email?: string;
    staff_name?: string;
    role_name?: string;
    staff_pict?: string;
  };
  token: string;
  message?: string;
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const res = await fetch(API_AUTH_LOGIN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          const data: LoginResponse = await res.json();
          if (!res.ok) return null;

          // 🔑 MAPPING SEKALI DI SINI
          return {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            staffName: data.user.staff_name,
            roleName: data.user.role_name,
            staffPict: data.user.staff_pict,
            token: data.token,
          };
        } catch (error) {
          console.error("Network or Fetch Error during login:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).token;
        token.id = (user as any).id;
        token.username = (user as any).username;
        token.email = (user as any).email;
        token.staffName = (user as any).staffName;
        token.roleName = (user as any).roleName;
        token.staffPict = (user as any).staffPict;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.staffName = token.staffName as string;
        session.user.roleName = token.roleName as string;
        session.user.staffPict = token.staffPict as string;
        session.user.token = token.accessToken as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
