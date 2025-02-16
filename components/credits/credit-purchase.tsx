"use client";

import { useState } from "react";
import { UserSubscriptionPlan } from "@/types";
import { ShoppingCart } from "lucide-react";

import {
  calculateCreditPrice,
  calculateCreditsFromAmount,
  creditConfig,
  formatCreditPrice,
} from "@/config/credits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Icons } from "@/components/shared/icons";

interface CreditPurchaseProps {
  userId: string;
  subscriptionPlan: UserSubscriptionPlan;
}

export function CreditPurchase({
  userId,
  subscriptionPlan,
}: CreditPurchaseProps) {
  const [amount, setAmount] = useState<number>(
    creditConfig.MIN_PURCHASE_AMOUNT,
  );
  const [isLoading, setIsLoading] = useState(false);

  const finalPrice = calculateCreditPrice(subscriptionPlan.isPaid);
  const credits = calculateCreditsFromAmount(amount, subscriptionPlan.isPaid);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          amount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to purchase credits");
      }

      const data = await response.json();
      window.location.href = data.url; // Redirect to Stripe checkout
    } catch (error) {
      console.error("Error purchasing credits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Purchase Credits</CardTitle>
        <ShoppingCart className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Amount (€)</span>
            <span>{amount}€</span>
          </div>
          <Slider
            value={[amount]}
            onValueChange={([value]) => setAmount(value)}
            min={creditConfig.MIN_PURCHASE_AMOUNT}
            max={creditConfig.MAX_PURCHASE_AMOUNT}
            step={1}
            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          />
        </div>

        <div className="space-y-2 rounded-md bg-muted p-2">
          <div className="flex justify-between text-sm">
            <span>Credits</span>
            <span>{credits}</span>
          </div>
          {subscriptionPlan.isPaid && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Pro discount</span>
              <span>-{creditConfig.PRO_DISCOUNT * 100}%</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-medium">
            <span>Price per credit</span>
            <span>{formatCreditPrice(finalPrice)}</span>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handlePurchase}
          disabled={isLoading}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 size-4 animate-spin" />
          ) : null}
          Purchase Credits
        </Button>
      </CardContent>
    </Card>
  );
}
