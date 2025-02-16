import { NextResponse } from "next/server";

import {
  calculateCreditPrice,
  calculateCreditsFromAmount,
  creditConfig,
} from "@/config/credits";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { absoluteUrl } from "@/lib/utils";

export async function POST(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (user.id !== params.userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { amount } = await req.json();

    if (!amount || amount < creditConfig.MIN_PURCHASE_AMOUNT) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    const subscriptionPlan = await getUserSubscriptionPlan(user.id);
    const isPro = subscriptionPlan.isPaid;
    const finalPrice = calculateCreditPrice(isPro);
    const credits = calculateCreditsFromAmount(amount, isPro);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "AI Analysis Credits",
              description: `Purchase ${credits} AI analysis credits${
                isPro
                  ? ` (${creditConfig.PRO_DISCOUNT * 100}% Pro discount applied)`
                  : ""
              }`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: absoluteUrl("/dashboard/credits?success=true"),
      cancel_url: absoluteUrl("/dashboard/credits?success=false"),
      metadata: {
        userId: user.id,
        credits: credits.toString(),
        amount: amount.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[CREDITS_PURCHASE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
