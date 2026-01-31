import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { calculateClaimLogic } from "@/lib/daily-reward";
import { modifyCoins } from "@/lib/currency";

export async function POST() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const logic = calculateClaimLogic(user.lastClaimedAt, user.streakCount);

    if (!logic.canClaim) {
      return NextResponse.json({ message: "Already claimed today" }, { status: 400 });
    }

    // Hitung total koin
    const totalCoins = logic.rewardsToClaim.reduce((acc, curr) => acc + curr.amount, 0);

    // Update DB Transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update User Streak
      await tx.user.update({
        where: { id: user.id },
        data: {
          streakCount: logic.streakNow,
          lastClaimedAt: new Date(),
        }
      });

      // 2. Tambah Koin (Pake helper currency yg udah kita buat)
      if (totalCoins > 0) {
          // Kita bypass modifyCoins wrapper disini untuk pakai transaction yang sama kalau mau strict
          // Tapi untuk simplifikasi kita update manual atau panggil API terpisah
          // Disini kita update manual biar atomik
          await tx.user.update({
              where: { id: user.id },
              data: { coins: { increment: totalCoins } }
          });
          
          await tx.coinTransaction.create({
              data: {
                  userId: user.id,
                  amount: totalCoins,
                  description: `Daily Reward (Days: ${logic.rewardsToClaim.map(r => r.day).join(', ')})`
              }
          });
      }
    });

    return NextResponse.json({ 
        success: true, 
        rewards: logic.rewardsToClaim,
        newStreak: logic.streakNow,
        totalCoins 
    });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
    // Endpoint untuk cek status saat load page (untuk UI popup)
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });
    
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) return new NextResponse("User not found", { status: 404 });
    
        const logic = calculateClaimLogic(user.lastClaimedAt, user.streakCount);
        
        return NextResponse.json({
            currentStreak: user.streakCount,
            lastClaimedAt: user.lastClaimedAt,
            ...logic // Kirim prediksi claim (rewardsToClaim, dll)
        });
    } catch (error) {
        return new NextResponse("Error", { status: 500 });
    }
}