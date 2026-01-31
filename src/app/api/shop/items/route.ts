import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { inventory: true } // Ambil inventory user
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    // Ambil semua item di toko
    const allItems = await prisma.shopItem.findMany({
      orderBy: { price: 'asc' }
    });

    // Map status kepemilikan
    const itemsWithStatus = allItems.map((item) => {
        const isOwned = user.inventory.some((inv) => inv.shopItemId === item.id);
        const isEquipped = 
            user.activeAvatar === item.asset || 
            user.activeFrame === item.asset;

        return {
            ...item,
            isOwned: isOwned || item.isDefault, // Default item dianggap owned
            isEquipped
        };
    });

    return NextResponse.json({ 
        userBalance: user.coins,
        items: itemsWithStatus 
    });

  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}