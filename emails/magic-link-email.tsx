import { Icons } from "../components/shared/icons";

type MagicLinkEmailProps = {
  actionUrl: string;
  firstName: string;
  mailType: "login" | "register";
  siteName: string;
};

export const MagicLinkEmail = ({
  firstName = "",
  actionUrl,
  mailType,
  siteName,
}: MagicLinkEmailProps) => {
  const subject = mailType === "login"
    ? `Sign in to your ${siteName} account`
    : `Welcome to ${siteName} - Activate your account`;

  const welcomeText = mailType === "login"
    ? "Welcome back!"
    : "Welcome to Trade Tracker!";

  const actionText = mailType === "login"
    ? "Use the button below to sign in to your account."
    : "Thanks for signing up! Please verify your email address to get started.";

  const buttonText = mailType === "login"
    ? "Sign in to your account"
    : "Verify your email";

  return {
    subject,
    html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${subject}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="background-color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; padding: 32px 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <!-- Logo placeholder -->
        <div style="margin: auto; width: 48px; height: 48px;"></div>
      </div>

      <h1 style="margin-bottom: 16px; text-align: center; font-size: 20px; font-weight: 600;">
        ${welcomeText}
      </h1>

      <p style="margin-bottom: 16px; color: #4B5563; font-size: 16px;">
        Hi ${firstName},
      </p>

      <p style="margin-bottom: 32px; color: #4B5563; font-size: 16px;">
        ${actionText}
      </p>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${actionUrl}"
           style="display: inline-block; background-color: #2563EB; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 16px;">
          ${buttonText}
        </a>
      </div>

      <p style="margin-bottom: 16px; color: #6B7280; font-size: 14px;">
        This link expires in 24 hours and can only be used once.
      </p>

      ${mailType === "login" ? `
      <p style="color: #6B7280; font-size: 14px;">
        If you did not request this email, you can safely ignore it.
      </p>
      ` : ''}

      <hr style="margin: 24px 0; border: 0; border-top: 2px solid #F3F4F6;">

      <p style="text-align: center; color: #6B7280; font-size: 12px;">
        Powered by ${siteName}
      </p>
    </div>
  </body>
</html>`,
    text: `${welcomeText}

Hi ${firstName},

${actionText}

Click here to ${buttonText.toLowerCase()}: ${actionUrl}

This link expires in 24 hours and can only be used once.

${mailType === "login" ? 'If you did not request this email, you can safely ignore it.\n' : ''}

Powered by ${siteName}`
  };
};
