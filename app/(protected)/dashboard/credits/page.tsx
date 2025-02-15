import { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { constructMetadata } from "@/lib/utils";
import { CreditBalance } from "@/components/credits/credit-balance";
import { CreditHistory } from "@/components/credits/credit-history";
import { CreditPurchase } from "@/components/credits/credit-purchase";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata: Metadata = {
  title: "Credits – Trade Tracker",
  description: "Manage your AI analysis credits",
};

export default async function CreditsPage() {
  console.log("[CREDITS] Page render started");

  const user = await getCurrentUser();
  console.log("[CREDITS] User check:", {
    exists: !!user,
    id: user?.id,
    email: user?.email,
  });

  if (!user || !user.id) {
    console.log("[CREDITS] No user found, redirecting to login");
    redirect("/login");
  }

  try {
    console.log("[CREDITS] Fetching subscription plan for user:", user.id);
    const subscriptionPlan = await getUserSubscriptionPlan(user.id);
    console.log("[CREDITS] Subscription plan loaded:", {
      isPaid: subscriptionPlan.isPaid,
      planType: subscriptionPlan.title,
    });

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Credits</h1>
          <p className="text-sm text-muted-foreground">
            Manage your AI analysis credits and purchase history.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CreditBalance userId={user.id} />
          <CreditPurchase
            userId={user.id}
            subscriptionPlan={subscriptionPlan}
          />
        </div>

        <CreditHistory userId={user.id} />
      </div>
    );
  } catch (error) {
    console.error("[CREDITS] Error loading credits page:", error);
    throw error;
  }
}
