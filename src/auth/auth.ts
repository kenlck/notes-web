import { db } from "@/lib/prisma";
import { compareSync } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials;

        const u = await db.user.findUnique({
          where: {
            email: (email as string) ?? "",
          },
        });

        if (!u || !password) {
          // User not found
          throw new Error("Invalid credentials.");
        }

        // compareSync
        const isValidPassword = compareSync((password as string) ?? "", u.password ?? "");
        // logic to verify if the user exists
        // user = await getUserFromDb(credentials.email, pwHash)

        if (!isValidPassword) {
          // No user found, so this is their first attempt to login
          // Optionally, this is also the place you could do a user registration
          throw new Error("Invalid credentials.");
        }

        // return user object with their profile data
        return u;
      },
    }),
  ],
});
