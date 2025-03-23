import { db } from "@/lib/prisma";
import { compareSync } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
