import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// GET USER PROFILE & STATS
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // 1. Ambil data user basic
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // 2. Auto-Sync Clerk jika user belum ada di DB
    if (!user) {
      const clerkUser = await currentUser();
      if (!clerkUser) return new NextResponse("User not found in Clerk", { status: 404 });

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: clerkUser.firstName || "Dreamer",
          imageUrl: clerkUser.imageUrl,
        },
      });
    }

    // 3. [NEW] Hitung Statistik secara Paralel (Cepat)
    const [
      achievementsCount,
      completedTodosCount,
      completedGoalsCount,
      pomodoroCount
    ] = await prisma.$transaction([
      // Count Achievements
      prisma.userAchievement.count({ 
        where: { userId: user.id } 
      }),
      // Count Completed Todos
      prisma.coinTransaction.count({ 
        where: { userId: user.id, description: { contains: "Task Completed"} } 
      }),
      // Count Completed Goals
      prisma.goal.count({ 
        where: { userId: user.id, status: "ACTIVE" } 
      }),
      // Count Pomodoro Sessions (Based on Coin History Logic)
      prisma.coinTransaction.count({ 
        where: { userId: user.id, description: { contains: "Deep Focus" } } 
      })
    ]);

    // 4. Return Data Gabungan
    return NextResponse.json({
      ...user,
      stats: {
        achievements: achievementsCount,
        todos: completedTodosCount,
        goals: completedGoalsCount,
        pomodoro: pomodoroCount
      }
    });

  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name } = body;

    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: { name },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PROFILE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}