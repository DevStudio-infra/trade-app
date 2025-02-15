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
      hasAcceptedToS: boolean;
      hasAcceptedPrivacy: boolean;
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
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      try {
        const username = user.email.split("@")[0];
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, hasAcceptedToS: true },
        });

        if (existingUser) {
          // For existing users, just return true
          return true;
        }

        // For new users, create with terms acceptance if provided
        const updatedUser = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || username,
            image:
              user.image ||
              `https://ui-avatars.com/api/?name=${username}&background=random`,
            hasAcceptedToS: true, // Set to true for new registrations
          },
        });

        return true;
      } catch (error) {
        console.error("[AUTH_ERROR]", error);
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

      if (typeof token.hasAcceptedToS === "boolean") {
        session.user.hasAcceptedToS = token.hasAcceptedToS;
      } else {
        session.user.hasAcceptedToS = false; // Default to false if not set
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
        token.hasAcceptedToS = dbUser.hasAcceptedToS;

        return token;
      } catch (error) {
        return token;
      }
    },
  },
  ...authConfig,
  // debug: process.env.NODE_ENV !== "production"
});
