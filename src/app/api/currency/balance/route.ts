import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { coins: true },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    return NextResponse.json({ coins: user.coins });
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}