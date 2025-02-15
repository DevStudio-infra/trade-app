import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

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
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>
      {mailType === "login"
        ? `Sign in to your ${siteName} account`
        : `Welcome to ${siteName} - Activate your account`}
    </Preview>
    <Tailwind>
      <Body className="bg-white font-sans">
        <Container className="mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <Icons.logo className="m-auto block size-12" />
          </div>
          <Text className="mb-4 text-center text-xl font-semibold">
            {mailType === "login"
              ? "Welcome back!"
              : "Welcome to Trade Tracker!"}
          </Text>
          <Text className="mb-4 text-base text-gray-600">Hi {firstName},</Text>
          <Text className="mb-8 text-base text-gray-600">
            {mailType === "login"
              ? "Use the button below to sign in to your account."
              : "Thanks for signing up! Please verify your email address to get started."}
          </Text>
          <Section className="mb-8 text-center">
            <Button
              className="inline-block rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white no-underline hover:bg-blue-700"
              href={actionUrl}
            >
              {mailType === "login"
                ? "Sign in to your account"
                : "Verify your email"}
            </Button>
          </Section>
          <Text className="mb-4 text-sm text-gray-500">
            This link expires in 24 hours and can only be used once.
          </Text>
          {mailType === "login" && (
            <Text className="text-sm text-gray-500">
              If you did not request this email, you can safely ignore it.
            </Text>
          )}
          <Hr className="my-6 border-t-2 border-gray-100" />
          <Text className="text-center text-xs text-gray-500">
            Powered by {siteName}
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
