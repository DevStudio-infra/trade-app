import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    // Handle credit purchase
    if (session.metadata?.userId && session.metadata?.amount) {
      const userId = session.metadata.userId;
      const amount = parseInt(session.metadata.amount);

      try {
        // Get or create user's credit record
        const credit = await prisma.aICredit.upsert({
          where: {
            userId: userId,
          },
          create: {
            userId: userId,
            balance: amount,
          },
          update: {
            balance: {
              increment: amount,
            },
          },
        });

        // Create transaction record
        await prisma.aICreditTransaction.create({
          data: {
            creditId: credit.id,
            amount: amount,
            type: "PURCHASE",
            status: "COMPLETED",
            metadata: {
              stripeSessionId: session.id,
              amount: session.amount_total,
            },
          },
        });
      } catch (error) {
        console.error("Error processing credit purchase:", error);
        return new NextResponse("Error processing credit purchase", {
          status: 500,
        });
      }
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    // Update the user stripe into in our database.
    // Since this is the initial subscription, we need to update
    // the subscription id and customer id.
    await prisma.user.update({
      where: {
        id: session?.metadata?.userId,
      },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
      },
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    const session = event.data.object as Stripe.Invoice;

    // If the billing reason is not subscription_create, it means the customer has updated their subscription.
    // If it is subscription_create, we don't need to update the subscription id and it will handle by the checkout.session.completed event.
    if (session.billing_reason != "subscription_create") {
      // Retrieve the subscription details from Stripe.
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );

      // Update the price id and set the new period end.
      await prisma.user.update({
        where: {
          stripeSubscriptionId: subscription.id,
        },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
        },
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}
