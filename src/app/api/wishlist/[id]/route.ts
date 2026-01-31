import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const { id } = await params;
    const { title, url, description } = await req.json();

    // Pastikan user pemilik wishlist
    const existing = await prisma.wishlist.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedItem = await prisma.wishlist.update({
      where: { id },
      data: { title, url, description },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}