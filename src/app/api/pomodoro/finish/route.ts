import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { grantExp, XP_RATES } from "@/lib/gamification";
import { prisma } from "@/lib/db";
import { modifyCoins, COIN_RATES } from "@/lib/currency";
import { checkFocusAchievements } from "@/lib/achievements";

export async function POST() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    // 1. Grant EXP Pomodoro (Existing)
    const xpResult = await grantExp(user.id, XP_RATES.POMODORO_SESSION);

    // Berikan koin sesuai rate POMODORO_SESSION (biasanya 10 atau 15 coins)
    await modifyCoins(
        user.id, 
        COIN_RATES.POMODORO_SESSION, 
        "Deep Focus Session"
    );

    const newAchievements = await checkFocusAchievements(user.id);

    // [UPDATED] Gabungkan result
    const finalGamificationResult = {
        ...xpResult,
        coinsEarned: (xpResult?.coinReward || 0) + COIN_RATES.POMODORO_SESSION,
        achievements: newAchievements // Kirim array achievement baru
    };

    return NextResponse.json({
        success: true,
        gamification: finalGamificationResult
    });

  } catch (error) {
    console.error("[POMODORO_FINISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}