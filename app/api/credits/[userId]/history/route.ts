import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    console.log("[CREDITS_HISTORY] Request started for user:", params.userId);
    const user = await getCurrentUser();

    if (!user) {
      console.log("[CREDITS_HISTORY] No authenticated user found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (user.id !== params.userId) {
      console.log("[CREDITS_HISTORY] User ID mismatch:", {
        sessionUserId: user.id,
        requestedUserId: params.userId,
      });
      return new NextResponse("Forbidden", { status: 403 });
    }

    // First get the user's credit record
    const creditRecord = await prisma.aICredit.findUnique({
      where: {
        userId: params.userId,
      },
    });

    if (!creditRecord) {
      console.log("[CREDITS_HISTORY] No credit record found for user");
      return NextResponse.json({ transactions: [] });
    }

    // Then get all transactions for this credit record
    const transactions = await prisma.aICreditTransaction.findMany({
      where: {
        creditId: creditRecord.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        createdAt: true,
      },
    });

    console.log("[CREDITS_HISTORY] Found transactions:", {
      count: transactions.length,
      userId: params.userId,
      creditId: creditRecord.id,
    });

    return NextResponse.json({
      transactions: transactions.map((tx) => ({
        ...tx,
        createdAt: tx.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[CREDITS_HISTORY] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
