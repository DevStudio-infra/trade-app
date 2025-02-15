import { NextResponse } from "next/server";
import { auth } from "@/auth";

import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update user's terms acceptance
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        hasAcceptedToS: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TERMS_ACCEPTANCE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
