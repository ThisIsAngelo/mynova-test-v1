import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// POST Idea
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const { content } = await req.json();

  const idea = await prisma.idea.create({
    data: { content, userId: user.id },
  });

  return NextResponse.json(idea);
}

// DELETE Idea
export async function DELETE(req: Request) {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if(!id || !user) return new NextResponse("Bad Request", { status: 400 });

    await prisma.idea.delete({
        where: { id, userId: user.id }
    });

    return NextResponse.json({ success: true });
}