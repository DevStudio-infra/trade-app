import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

import { prisma } from "@/lib/db";
import { getUserById } from "@/lib/user";

// More info: https://authjs.dev/getting-started/typescript#module-augmentation
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }

      try {
        const username = user.email.split("@")[0];
        const updatedUser = await prisma.user.upsert({
          where: { email: user.email },
          create: {
            email: user.email,
            name: user.name || username,
            image:
              user.image ||
              `https://ui-avatars.com/api/?name=${username}&background=random`,
          },
          update: {
            name: user.name || username,
            image:
              user.image ||
              `https://ui-avatars.com/api/?name=${username}&background=random`,
          },
        });

        return true;
      } catch (error) {
        return false;
      }
    },

    async session({ token, session }) {
      if (token.sub) {
        session.user.id = token.sub;
      }

      if (token.email) {
        session.user.email = token.email;
      }

      if (token.role) {
        session.user.role = token.role;
      }

      session.user.name = token.name;
      session.user.image = token.picture;

      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      if (!token.sub) {
        return token;
      }

      try {
        const dbUser = await getUserById(token.sub);

        if (!dbUser) {
          return token;
        }

        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.image;
        token.role = dbUser.role;

        return token;
      } catch (error) {
        return token;
      }
    },
  },
  ...authConfig,
  // debug: process.env.NODE_ENV !== "production"
});
