import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        inventory: true,
        achievements: true,
        todos: true,
        notes: true,
        ideas: true,
        tips: true,
        wishlists: true,
        coinHistory: true,
        goals: {
          include: {
            milestones: true, // Include milestone di dalam goal
          },
        },
      },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    // Struktur Data Backup
    const backupPayload = {
      meta: {
        version: 1,
        exportedAt: new Date().toISOString(),
        userId: user.id, // ID internal DB
      },
      data: {
        user: {
          level: user.level,
          experience: user.experience,
          coins: user.coins,
          streakCount: user.streakCount,
          activeAvatar: user.activeAvatar,
          activeFrame: user.activeFrame,
        },
        inventory: user.inventory,
        achievements: user.achievements,
        todos: user.todos,
        goals: user.goals,
        notes: user.notes,
        ideas: user.ideas,
        tips: user.tips,
        wishlists: user.wishlists,
        coinHistory: user.coinHistory,
      },
    };

    // Return JSON
    return NextResponse.json(backupPayload);
  } catch (error) {
    console.error("[BACKUP_EXPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}