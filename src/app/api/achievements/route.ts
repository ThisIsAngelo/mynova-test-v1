import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { calculateExpForNextLevel } from "@/lib/game-mechanics"; // Pastikan path ini benar

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        achievements: true, // Ambil data achievement yang sudah unlock
      },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    // Hitung Target XP untuk Level Selanjutnya
    const nextLevelXp = calculateExpForNextLevel(user.level);

    // Kita ubah array achievements menjadi Map/Object biar frontend gampang carinya
    // Format: { "FIRST_TODO": "2023-10-01T...", "TODO_10": "..." }
    const unlockedMap: Record<string, Date> = {};
    
    user.achievements.forEach((ach) => {
      unlockedMap[ach.achievementId] = ach.unlockedAt;
    });

    return NextResponse.json({
      currentXp: user.experience,
      level: user.level,
      nextLevelXp, // Ini target XP (bukan sisa, tapi total yang dibutuhkan untuk level itu)
      unlockedMap, // Peta achievement yang sudah terbuka
    });

  } catch (error) {
    console.error("[ACHIEVEMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}