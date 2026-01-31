/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { grantExp, XP_RATES } from "@/lib/gamification";
import { COIN_RATES, modifyCoins } from "@/lib/currency";
import { checkTodoAchievements } from "@/lib/achievements";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH: Update Todo & Grant EXP
export async function PATCH(
  req: Request,
  { params }: RouteContext
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const body = await req.json();
    const { title, description, isCompleted } = body;
    const { id } = await params;

    // 1. Ambil Todo existing untuk pengecekan status sebelumnya
    const existingTodo = await prisma.todo.findUnique({
      where: { id, userId: user.id },
    });

    if (!existingTodo) return new NextResponse("Todo not found", { status: 404 });

    const shouldGrantReward =
      isCompleted === true &&
      existingTodo.hasRewardedExp === false;

    const updateData: any = {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description }),
      ...(isCompleted !== undefined && { isCompleted }),
    };

    if (shouldGrantReward) {
      updateData.hasRewardedExp = true;
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: existingTodo.id },
      data: updateData,
    });

    let achievements: any = [];

    // [NEW] Check Achievements jika status berubah jadi Completed
    if (isCompleted === true) { // Pastikan variabel ini sesuai logic kodemu
      achievements = await checkTodoAchievements(user.id);
    }

    // --- 2. EKSEKUSI REWARD (XP & COINS) ---
    let gamificationResult: any = null;

    if (shouldGrantReward) {
      // A. Kasih EXP (Cek Level Up & Bonus Level Up Coin)
      const xpResult = await grantExp(user.id, XP_RATES.TODO_COMPLETION);

      // B. Kasih Koin Receh (Activity Reward)
      // Ini 5 koin standar setiap menyelesaikan tugas
      await modifyCoins(user.id, COIN_RATES.TODO_COMPLETED, "Task Completed");

      // C. Gabungkan info untuk frontend
      // Kita tambahkan properti 'coinsEarned' agar frontend tau total koin yang didapat
      // Total = (Koin Level Up jika ada) + (Koin Todo ini)
      gamificationResult = {
        ...xpResult,
        coinsEarned: (xpResult?.coinReward || 0) + COIN_RATES.TODO_COMPLETED
      };
    }

    if (achievements.length > 0) {
      gamificationResult = {
        ...(gamificationResult || {}), // Ambil data XP/Coin jika ada, atau object kosong
        achievements: achievements     // Masukkan achievements kesini
      };
    }

    return NextResponse.json({
      ...updatedTodo,
      gamification: gamificationResult,
    });

  } catch (error) {
    // @ts-expect-error handling prisma error code
    if (error.code === "P2025") {
      return new NextResponse("Todo not found or unauthorized", { status: 404 });
    }
    console.error("[API_TODO_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: RouteContext
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const { id } = await params;

    await prisma.todo.delete({
      where: {
        id: id,
        userId: user.id,
      },
    });

    return new NextResponse("Deleted successfully", { status: 200 });
  } catch (error) {
    // @ts-expect-error handling prisma error code
    if (error.code === "P2025") {
      return new NextResponse("Todo not found or unauthorized", { status: 404 });
    }
    console.error("[API_TODO_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}