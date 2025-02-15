import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { constructMetadata } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardHeader } from "@/components/dashboard/header";
import { BillingInfo } from "@/components/pricing/billing-info";
import { Icons } from "@/components/shared/icons";

export const metadata = constructMetadata({
  title: "Billing – Trade Tracker",
  description: "Manage billing and your subscription plan.",
});

export default async function BillingPage() {
  console.log("[BILLING] Page render started");

  const user = await getCurrentUser();
  console.log("[BILLING] User check:", {
    exists: !!user,
    id: user?.id,
    email: user?.email,
  });

  if (!user || !user.id) {
    console.log("[BILLING] No user found, redirecting to login");
    redirect("/login");
  }

  try {
    console.log("[BILLING] Fetching subscription plan for user:", user.id);
    const userSubscriptionPlan = await getUserSubscriptionPlan(user.id);
    console.log("[BILLING] Subscription plan loaded:", {
      isPaid: userSubscriptionPlan.isPaid,
      planType: userSubscriptionPlan.title,
    });

    return (
      <>
        <DashboardHeader
          heading="Billing"
          text="Manage billing and your subscription plan."
        />
        <div className="grid gap-8">
          <Alert className="!pl-14">
            <Icons.warning />
            <AlertTitle>This is a demo app.</AlertTitle>
            <AlertDescription className="text-balance">
              Trade Tracker app is using a Stripe test environment. You can find
              a list of test card numbers on the{" "}
              <a
                href="https://stripe.com/docs/testing#cards"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-8"
              >
                Stripe docs
              </a>
              .
            </AlertDescription>
          </Alert>
          <BillingInfo userSubscriptionPlan={userSubscriptionPlan} />
        </div>
      </>
    );
  } catch (error) {
    console.error("[BILLING] Error loading billing page:", error);
    throw error;
  }
}
