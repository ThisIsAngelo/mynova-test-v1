import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { backupSchema } from "@/lib/validators/backup";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    // 1. Parse & Validate JSON
    const body = await req.json();
    const result = backupSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse("Invalid backup file format", { status: 400 });
    }

    const { data } = result.data;

    // 2. SAFETY TRANSACTION (Wipe & Replace)
    await prisma.$transaction(async (tx) => {
      // A. HAPUS SEMUA DATA LAMA (Urutan penting karena Foreign Keys)
      // Hapus milestones dulu karena nempel di goal
      await tx.milestone.deleteMany({ where: { goal: { userId: user.id } } }); 
      await tx.goal.deleteMany({ where: { userId: user.id } });
      
      await tx.todo.deleteMany({ where: { userId: user.id } });
      await tx.note.deleteMany({ where: { userId: user.id } });
      await tx.idea.deleteMany({ where: { userId: user.id } });
      await tx.tip.deleteMany({ where: { userId: user.id } });
      await tx.wishlist.deleteMany({ where: { userId: user.id } });
      
      // Hapus history & achievement & inventory
      await tx.coinTransaction.deleteMany({ where: { userId: user.id } });
      await tx.userAchievement.deleteMany({ where: { userId: user.id } });
      await tx.userInventory.deleteMany({ where: { userId: user.id } });

      // B. UPDATE STATS USER
      await tx.user.update({
        where: { id: user.id },
        data: {
          level: data.user.level,
          experience: data.user.experience,
          coins: data.user.coins,
          streakCount: data.user.streakCount,
          activeAvatar: data.user.activeAvatar,
          activeFrame: data.user.activeFrame,
        },
      });

      // C. RESTORE DATA BARU
      // Gunakan createMany untuk performa, kita force ID dari backup
      
      if (data.todos.length > 0) {
        await tx.todo.createMany({
          data: data.todos.map((t) => ({
            ...t,
            userId: user.id, // Pastikan userId mengarah ke user sekarang
          })),
        });
      }

      if (data.notes.length > 0) {
        await tx.note.createMany({
          data: data.notes.map((n) => ({ ...n, userId: user.id })),
        });
      }

      // Restore Relasional Sederhana
      if (data.inventory.length > 0) {
        await tx.userInventory.createMany({
          data: data.inventory.map((i) => ({ ...i, userId: user.id })),
          skipDuplicates: true, // Jaga-jaga
        });
      }

      if (data.achievements.length > 0) {
        await tx.userAchievement.createMany({
          data: data.achievements.map((a) => ({ ...a, userId: user.id })),
          skipDuplicates: true,
        });
      }
      
      if (data.coinHistory.length > 0) {
        await tx.coinTransaction.createMany({
            data: data.coinHistory.map(c => ({...c, userId: user.id}))
        })
      }

      // D. RESTORE GOALS (KOMPLEKS KARENA HIERARKI & MILESTONES)
      // Karena goal punya parentGoalId dan Milestone, kita loop satu-satu lebih aman
      // atau pisahkan parentGoalId.
      
      // Strategi: Insert Goals tanpa parentId dulu, baru Milestone, baru update parentId?
      // Atau karena createMany di Postgres membolehkan defer constraint? 
      // Untuk amannya di Prisma: Kita insert dulu Goal TANPA parentId
      for (const goal of data.goals) {
          await tx.goal.create({
              data: {
                  id: goal.id, // Force ID
                  userId: user.id,
                  title: goal.title,
                  color: goal.color,
                  progress: goal.progress,
                  status: goal.status,
                  type: goal.type,
                  createdAt: goal.createdAt,
                  completedAt: goal.completedAt,
                  // parentGoalId: goal.parentGoalId, <--- SKIP DULU BIAR GAK ERROR "Parent not found"
                  milestones: {
                      create: goal.milestones.map(m => ({
                          id: m.id,
                          title: m.title,
                          isCompleted: m.isCompleted
                      }))
                  }
              }
          })
      }

      // Step kedua: Link Parent Goals
      const goalsWithParents = data.goals.filter(g => g.parentGoalId);
      for (const goal of goalsWithParents) {
          // Cek apakah parent goal-nya juga ikut di-restore?
          const parentExists = data.goals.find(g => g.id === goal.parentGoalId);
          if (parentExists) {
              await tx.goal.update({
                  where: { id: goal.id },
                  data: { parentGoalId: goal.parentGoalId }
              })
          }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BACKUP_IMPORT]", error);
    return new NextResponse("Failed to import backup", { status: 500 });
  }
}