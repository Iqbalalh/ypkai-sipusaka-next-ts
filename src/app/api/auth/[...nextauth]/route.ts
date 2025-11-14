/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_AUTH_LOGIN } from "@/lib/apiEndpoint";

interface LoginResponse {
  user: {
    id: string;
    username: string;
    [key: string]: any;
  };
  token: string;
  message?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const res = await fetch(API_AUTH_LOGIN, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
        });

        const data: LoginResponse = await res.json();

        if (!res.ok) throw new Error(data.message || "Login failed");
        return { ...data.user, token: data.token };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.accessToken = (user as any).token;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).token = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
