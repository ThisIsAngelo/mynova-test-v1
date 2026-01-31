/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { buyShopItem } from "@/lib/shop";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const { itemId } = await req.json();

    await buyShopItem(user.id, itemId);

    return NextResponse.json({ success: true, message: "Item purchased!" });

  } catch (error: any) {
    return new NextResponse(error.message || "Transaction failed", { status: 400 });
  }
}