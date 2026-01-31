import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Cek user di DB
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) return new NextResponse("User not found", { status: 404 });

    // Ambil list ID yang sudah diurutkan dari body
    const { ids } = await req.json();
    
    if (!Array.isArray(ids)) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    // Lakukan Update Transaction (Semua atau tidak sama sekali)
    // Update field 'order' sesuai index array
    await prisma.$transaction(
      ids.map((id: string, index: number) =>
        prisma.todo.update({
          where: { 
            id,
            userId: user.id // Security: Pastikan cuma bisa update punya sendiri
          },
          data: { order: index },
        })
      )
    );

    return new NextResponse("Reorder success", { status: 200 });
  } catch (error) {
    console.error("[API_TODO_REORDER]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}