import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(wishlist);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const { title, url, description } = await req.json();

  const item = await prisma.wishlist.create({
    data: { 
        title, 
        url, 
        description,
        userId: user.id 
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if(!id || !user) return new NextResponse("Bad Request", { status: 400 });

    await prisma.wishlist.delete({ where: { id, userId: user.id } });

    return NextResponse.json({ success: true });
}