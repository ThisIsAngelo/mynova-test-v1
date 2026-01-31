/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function updateParentProgress(parentId: string) {
  // 1. Ambil semua anak (sub-goals) dari parent ini
  const subGoals = await prisma.goal.findMany({ 
    where: { parentGoalId: parentId } 
  });
  
  if (subGoals.length === 0) {
      // Jika tidak ada anak, set 0 (atau biarkan, tapi 0 lebih masuk akal)
      await prisma.goal.update({ where: { id: parentId }, data: { progress: 0 } });
      return;
  }

  // 2. Hitung Rata-rata
  const totalProgress = subGoals.reduce((acc, curr) => acc + curr.progress, 0);
  const averageProgress = Math.round(totalProgress / subGoals.length);

  // 3. Update Parent
  await prisma.goal.update({
    where: { id: parentId },
    data: { progress: averageProgress }
  });
}

// [UPDATED] Helper: Hitung Progress Goal & Trigger Parent Update
async function updateGoalProgress(goalId: string) {
  const milestones = await prisma.milestone.findMany({ where: { goalId } });
  
  const total = milestones.length;
  const completed = milestones.filter(m => m.isCompleted).length;
  
  const newProgress = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Update Goal ini (Short-term)
  const updatedGoal = await prisma.goal.update({
    where: { id: goalId },
    data: { progress: newProgress }
  });

  // [NEW] Jika dia punya bapak (Parent), update bapaknya juga!
  if (updatedGoal.parentGoalId) {
      await updateParentProgress(updatedGoal.parentGoalId);
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { title, goalId } = await req.json();

  const milestone = await prisma.milestone.create({
    data: { title, goalId }
  });

  // Ini akan trigger updateGoal -> trigger updateParent
  await updateGoalProgress(goalId);

  revalidatePath("/vision");
  return NextResponse.json(milestone);
}


export async function PATCH(req: Request) {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
  
    const { id, isCompleted, title } = await req.json();
  
    const dataToUpdate: any = {};
    if (isCompleted !== undefined) dataToUpdate.isCompleted = isCompleted;
    if (title !== undefined) dataToUpdate.title = title;
  
    const milestone = await prisma.milestone.update({
      where: { id },
      data: dataToUpdate
    });
  
    // Hanya update progress jika status berubah
    if (isCompleted !== undefined) {
        await updateGoalProgress(milestone.goalId);
    }
  
    return NextResponse.json(milestone);
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const goalId = searchParams.get("goalId");

  if(!id || !goalId) return new NextResponse("Bad Request", { status: 400 });

  await prisma.milestone.delete({ where: { id } });

  // Trigger Chain Reaction
  await updateGoalProgress(goalId);

  revalidatePath("/vision");
  return NextResponse.json({ success: true });
}