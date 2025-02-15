import { MagicLinkEmail } from "@/emails/magic-link-email";
import { EmailConfig } from "next-auth/providers/email";
import { Resend } from "resend";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

import { getUserByEmail } from "./user";

export const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationRequest: EmailConfig["sendVerificationRequest"] =
  async ({ identifier, url, provider }) => {
    const user = await getUserByEmail(identifier);

    if (!user || !user.name) {
      return;
    }

    const userVerified = user?.emailVerified ? true : false;

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

    try {
      const emailContent = MagicLinkEmail({
        firstName: user?.name as string,
        actionUrl: url,
        mailType: userVerified ? "login" : "register",
        siteName: siteConfig.name,
      });

      const { data, error } = await resend.emails.send({
        from: provider.from,
        to: emailRecipient,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        // Set this to prevent Gmail from threading emails.
        // More info: https://resend.com/changelog/custom-email-headers
        headers: {
          "X-Entity-Ref-ID": new Date().getTime() + "",
        },
      });

      if (error || !data) {
        throw new Error(error?.message);
      }
    } catch (error) {
      throw new Error("Failed to send verification email.");
    }
  };
