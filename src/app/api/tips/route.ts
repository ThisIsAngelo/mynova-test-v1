import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// GET TIPS
export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const tips = await prisma.tip.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tips);
}

// POST TIP
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const { content, source } = await req.json();

  const tip = await prisma.tip.create({
    data: { 
        content, 
        source: source || "Unknown Source", // Default kalau kosong
        userId: user.id 
    },
  });

  return NextResponse.json(tip);
}

// DELETE TIP
export async function DELETE(req: Request) {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if(!id || !user) return new NextResponse("Bad Request", { status: 400 });

    await prisma.tip.delete({ where: { id, userId: user.id } });

    return NextResponse.json({ success: true });
}