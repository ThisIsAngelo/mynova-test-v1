/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { equipShopItem } from "@/lib/shop";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const { itemId } = await req.json();

    const result = await equipShopItem(user.id, itemId);

    return NextResponse.json(result);

  } catch (error: any) {
    return new NextResponse(error.message || "Failed to equip", { status: 400 });
  }
}