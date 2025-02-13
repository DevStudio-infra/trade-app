import { NextResponse } from "next/server";

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

    if (!amount || amount < 1) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    const subscriptionPlan = await getUserSubscriptionPlan(user.id);
    const isPro = subscriptionPlan.isPaid;
    const discount = isPro ? 0.2 : 0; // 20% discount for Pro users

    // Base price per credit is $0.50
    const basePrice = 0.5;
    const finalPrice = basePrice * amount * (1 - discount);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "AI Analysis Credits",
              description: `Purchase ${amount} AI analysis credits${isPro ? " (20% Pro discount applied)" : ""}`,
            },
            unit_amount: Math.round(finalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: absoluteUrl("/dashboard/credits?success=true"),
      cancel_url: absoluteUrl("/dashboard/credits?success=false"),
      metadata: {
        userId: user.id,
        amount: amount.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[CREDITS_PURCHASE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
