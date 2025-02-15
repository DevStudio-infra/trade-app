import { MagicLinkEmail } from "@/emails/magic-link-email";
import { EmailConfig } from "next-auth/providers/email";
import { Resend } from "resend";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

import { getUserByEmail } from "./user";

export const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationRequest: EmailConfig["sendVerificationRequest"] =
  async ({ identifier, url, provider }) => {
    console.log("[EMAIL] Starting verification request for:", identifier);

    const user = await getUserByEmail(identifier);
    console.log("[EMAIL] User lookup result:", {
      found: !!user,
      hasName: !!user?.name,
      emailVerified: user?.emailVerified,
    });

    if (!user || !user.name) {
      console.log("[EMAIL] Aborting: User not found or no name");
      return;
    }

    const userVerified = user?.emailVerified ? true : false;
    const authSubject = userVerified
      ? `Sign-in link for ${siteConfig.name}`
      : "Activate your account";

    // Allow list for development testing
    const allowedTestEmails = [
      "tainaradelimaa@gmail.com",
      // Add other test emails here
    ];

    const emailRecipient =
      process.env.NODE_ENV === "development" &&
      !allowedTestEmails.includes(identifier)
        ? "delivered@resend.dev"
        : identifier;

    console.log("[EMAIL] Preparing to send email:", {
      from: provider.from,
      to: emailRecipient,
      subject: authSubject,
    });

    try {
      const { data, error } = await resend.emails.send({
        from: provider.from,
        to: emailRecipient,
        subject: authSubject,
        react: MagicLinkEmail({
          firstName: user?.name as string,
          actionUrl: url,
          mailType: userVerified ? "login" : "register",
          siteName: siteConfig.name,
        }),
        // Set this to prevent Gmail from threading emails.
        // More info: https://resend.com/changelog/custom-email-headers
        headers: {
          "X-Entity-Ref-ID": new Date().getTime() + "",
        },
      });

      if (error || !data) {
        console.error("[EMAIL] Resend API error:", error);
        throw new Error(error?.message);
      }

      console.log("[EMAIL] Successfully sent email:", data);
    } catch (error) {
      console.error("[EMAIL] Failed to send verification email:", error);
      throw new Error("Failed to send verification email.");
    }
  };
