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
  const user = await getCurrentUser();

  if (!user || !user.id) {
    redirect("/login");
  }

  try {
    const subscriptionPlan = await getUserSubscriptionPlan(user.id);

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
    throw error;
  }
}
