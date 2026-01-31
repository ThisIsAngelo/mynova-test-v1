/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { grantExp, XP_RATES } from "@/lib/gamification";
import { modifyCoins, COIN_RATES } from "@/lib/currency";
import { checkGoalAchievements } from "@/lib/achievements";

// Helper: Hitung Progress Parent (Biarkan code ini tetap ada jika sudah kamu pasang sebelumnya)
async function updateParentProgress(parentId: string) {
  const subGoals = await prisma.goal.findMany({ where: { parentGoalId: parentId } });
  if (subGoals.length === 0) return;
  const total = subGoals.reduce((acc, curr) => acc + curr.progress, 0);
  const avg = Math.round(total / subGoals.length);
  await prisma.goal.update({ where: { id: parentId }, data: { progress: avg } });
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  req: Request,
  { params }: RouteContext
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const { id } = await params;

    const goal = await prisma.goal.findUnique({
      where: { id, userId: user.id },
      include: { milestones: true }
    });

    if (!goal) return new NextResponse("Goal not found", { status: 404 });

    // Validasi Progress
    const totalMilestones = goal.milestones.length;
    const completedMilestones = goal.milestones.filter(m => m.isCompleted).length;

    if (totalMilestones === 0 || completedMilestones < totalMilestones) {
      return new NextResponse("Goal not ready to complete", { status: 400 });
    }

    // Simpan data update
    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        progress: 100,
        hasRewardedExp: goal.hasRewardedExp ? undefined : true
      }
    });

    let gamificationResult: any = null;

    // --- REWARD LOGIC ---
    if (!goal.hasRewardedExp) {
      // 1. Kasih EXP (Cek Level Up)
      const xpResult = await grantExp(user.id, XP_RATES.GOAL_COMPLETION);

      // 2. [NEW] Kasih Koin Reward (Bonus menyelesaikan Goal)
      await modifyCoins(user.id, COIN_RATES.GOAL_COMPLETED, `Goal Reached: ${goal.title}`);

      // 3. [NEW] Gabungkan result agar Frontend Store bisa menampilkan Toast
      // Total Koin = (Koin dari Level Up jika ada) + (Koin fix dari Goal)
      gamificationResult = {
        ...xpResult,
        coinsEarned: (xpResult?.coinReward || 0) + COIN_RATES.GOAL_COMPLETED
      };
    }

    // Trigger Update Parent (Hierarchy Logic)
    if (updatedGoal.parentGoalId) {
      await updateParentProgress(updatedGoal.parentGoalId);
    }

    const newAchievements = await checkGoalAchievements(user.id, "COMPLETE");

    // [CRITICAL FIX] Merge Achievement ke dalam Gamification Result
    if (newAchievements.length > 0) {
      gamificationResult = {
        ...(gamificationResult || {}),
        achievements: newAchievements
      };
    }

    return NextResponse.json({
      success: true,
      gamification: gamificationResult 
    });

  } catch (error) {
    console.error("[GOAL_COMPLETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}