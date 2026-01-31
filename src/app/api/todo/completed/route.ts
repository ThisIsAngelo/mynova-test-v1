import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function DELETE() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Hapus semua todo yang 'isCompleted: true' milik user ini
    const result = await prisma.todo.deleteMany({
      where: {
        userId: user.id,
        isCompleted: true,
      },
    });

    return NextResponse.json({ 
      message: "Completed tasks deleted", 
      count: result.count 
    });
    
  } catch (error) {
    console.error("[DELETE_COMPLETED_TODOS]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}