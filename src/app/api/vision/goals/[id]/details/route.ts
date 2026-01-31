import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;

  const goal = await prisma.goal.findUnique({
    where: { id },
    include: {
      user: true,
      
      // [NEW] Include Milestones (Untuk Short-term)
      milestones: {
        orderBy: { createdAt: 'asc' }
      },

      // [NEW] Include Sub-goals (Untuk Long-term)
      subGoals: {
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { milestones: true } } // Biar tau anak-anaknya punya berapa task
        }
      },

      // [NEW] Include Parent Info (Biar tau dia anaknya siapa)
      parentGoal: {
        select: { id: true, title: true, color: true }
      }
    } 
  });

  // Validasi Owner (Manual check seperti kodemu sebelumnya)
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!goal || !user || goal.userId !== user.id) {
      return new NextResponse("Not Found or Unauthorized", { status: 404 });
  }

  return NextResponse.json(goal);
}