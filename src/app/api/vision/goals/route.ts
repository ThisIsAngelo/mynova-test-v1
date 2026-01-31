import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// [NEW] Helper Copas
async function updateParentProgress(parentId: string) {
  const subGoals = await prisma.goal.findMany({ where: { parentGoalId: parentId } });
  if (subGoals.length === 0) {
      await prisma.goal.update({ where: { id: parentId }, data: { progress: 0 } });
      return;
  }
  const total = subGoals.reduce((acc, curr) => acc + curr.progress, 0);
  const avg = Math.round(total / subGoals.length);
  await prisma.goal.update({ where: { id: parentId }, data: { progress: avg } });
}

// GET (Sama seperti sebelumnya)
export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { milestones: true, subGoals: true } },
      parentGoal: { select: { title: true, color: true } }
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}

// POST Goal Baru
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const { title, color, type, parentGoalId } = await req.json();

  const goal = await prisma.goal.create({
    data: {
      title,
      color: color || "#22c55e",
      userId: user.id,
      type: type || "SHORT", 
      parentGoalId: parentGoalId || null, 
      progress: 0 // Default 0
    },
  });

  // [NEW] Jika goal ini punya parent, update parentnya (karena rata-rata akan turun)
  if (goal.parentGoalId) {
      await updateParentProgress(goal.parentGoalId);
  }

  return NextResponse.json(goal);
}

// DELETE Goal
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if(!id || !user) return new NextResponse("Bad Request", { status: 400 });

  // [UPDATED] Ambil dulu goal-nya sebelum dihapus buat cek parentId
  const goalToDelete = await prisma.goal.findUnique({
      where: { id, userId: user.id }
  });

  if (!goalToDelete) return new NextResponse("Not Found", { status: 404 });

  await prisma.goal.delete({
      where: { id, userId: user.id }
  });

  // [NEW] Update parent progress (karena pembagi rata-rata berkurang)
  if (goalToDelete.parentGoalId) {
      await updateParentProgress(goalToDelete.parentGoalId);
  }

  return NextResponse.json({ success: true });
}

// PATCH (Update Title/Color) - Tidak perlu ubah logic progress disini
export async function PATCH(req: Request) {
    // ... (Sama seperti sebelumnya) ...
    // Kecuali kalau user bisa pindah parentGoalId via edit, tapi untuk V1 anggap statis dulu.
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return new NextResponse("User not found", { status: 404 });
    const { id, title, color } = await req.json();
    const updated = await prisma.goal.update({
        where: { id, userId: user.id },
        data: { title, color },
    });
    return NextResponse.json(updated);
}