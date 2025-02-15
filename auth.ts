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
      console.log("[AUTH] Sign in attempt:", {
        email: user.email,
        provider: account?.provider,
        hasName: !!user.name,
        hasImage: !!user.image,
      });

      if (!user.email) {
        console.log("[AUTH] Sign in failed: No email provided");
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

        console.log("[AUTH] User upserted successfully:", {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
        });

        return true;
      } catch (error) {
        console.error("[AUTH] Error during sign in:", error);
        return false;
      }
    },

    async session({ token, session }) {
      console.log("[AUTH] Session callback - Token:", {
        sub: token.sub,
        email: token.email,
        name: token.name,
      });

      if (token.sub) {
        session.user.id = token.sub;
        console.log("[AUTH] Setting user ID in session:", token.sub);
      }

      if (token.email) {
        session.user.email = token.email;
      }

      if (token.role) {
        session.user.role = token.role;
      }

      session.user.name = token.name;
      session.user.image = token.picture;

      console.log("[AUTH] Final session user:", {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      });

      return session;
    },

    async jwt({ token, user, account, trigger }) {
      console.log("[AUTH] JWT callback - Initial token:", {
        sub: token.sub,
        email: token.email,
        trigger,
        hasUser: !!user,
      });

      if (user) {
        // Always set these values when we have a user object
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        console.log("[AUTH] JWT callback - Updated token with user data:", {
          sub: token.sub,
          email: token.email,
        });
      }

      if (!token.sub) {
        console.log("[AUTH] JWT callback - No user ID in token");
        return token;
      }

      try {
        const dbUser = await getUserById(token.sub);
        console.log("[AUTH] JWT callback - DB User found:", {
          id: dbUser?.id,
          email: dbUser?.email,
        });

        if (!dbUser) {
          console.log(
            "[AUTH] JWT callback - No DB user found for ID:",
            token.sub,
          );
          return token;
        }

        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.image;
        token.role = dbUser.role;

        console.log("[AUTH] JWT callback - Final token:", {
          sub: token.sub,
          email: token.email,
          name: token.name,
        });

        return token;
      } catch (error) {
        console.error("[AUTH] JWT callback - Error:", error);
        return token;
      }
    },
  },
  ...authConfig,
  // debug: process.env.NODE_ENV !== "production"
});
