import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// PATCH: Update Goal Title/Color
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const { title, color } = await req.json(); // Bisa update title atau color

    // Cek user owner
    const goal = await prisma.goal.findUnique({ where: { id } });
    if (!goal || goal.userId !== (await prisma.user.findUnique({ where: { clerkId: userId } }))?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: { title, color },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}