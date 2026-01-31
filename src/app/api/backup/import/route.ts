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
      console.error("Validation Error:", result.error); // Debugging
      return new NextResponse("Invalid backup file format", { status: 400 });
    }

    const { data } = result.data;

    // 2. SAFETY TRANSACTION (Wipe & Replace)
    await prisma.$transaction(async (tx) => {
      // A. HAPUS SEMUA DATA LAMA (Wipe Clean)
      // Hapus milestones dulu karena nempel di goal
      await tx.milestone.deleteMany({ where: { goal: { userId: user.id } } }); 
      await tx.goal.deleteMany({ where: { userId: user.id } });
      
      await tx.todo.deleteMany({ where: { userId: user.id } });
      await tx.note.deleteMany({ where: { userId: user.id } });
      
      // [Hapus data lama untuk model baru]
      await tx.idea.deleteMany({ where: { userId: user.id } });
      await tx.tip.deleteMany({ where: { userId: user.id } });
      await tx.wishlist.deleteMany({ where: { userId: user.id } });
      
      // Hapus history & achievement & inventory
      await tx.coinTransaction.deleteMany({ where: { userId: user.id } });
      await tx.userAchievement.deleteMany({ where: { userId: user.id } });
      await tx.userInventory.deleteMany({ where: { userId: user.id } });

      // B. UPDATE STATS USER (Restore Level & XP)
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
      
      // 1. Todos
      if (data.todos.length > 0) {
        await tx.todo.createMany({
          data: data.todos.map((t) => ({ ...t, userId: user.id })),
        });
      }

      // 2. Notes
      if (data.notes.length > 0) {
        await tx.note.createMany({
          data: data.notes.map((n) => ({ ...n, userId: user.id })),
        });
      }

      // 3. [NEW] Ideas
      if (data.ideas && data.ideas.length > 0) {
        await tx.idea.createMany({
          data: data.ideas.map((i) => ({ 
            id: i.id,
            content: i.content,
            createdAt: i.createdAt,
            userId: user.id 
          })),
        });
      }

      // 4. [NEW] Tips
      if (data.tips && data.tips.length > 0) {
        await tx.tip.createMany({
          data: data.tips.map((t) => ({
            id: t.id,
            content: t.content,
            source: t.source,
            createdAt: t.createdAt,
            userId: user.id
          })),
        });
      }

      // 5. [NEW] Wishlists
      if (data.wishlists && data.wishlists.length > 0) {
        await tx.wishlist.createMany({
          data: data.wishlists.map((w) => ({
            id: w.id,
            title: w.title,
            url: w.url,
            description: w.description,
            createdAt: w.createdAt,
            userId: user.id
          })),
        });
      }

      // 6. Inventory & Achievements
      if (data.inventory.length > 0) {
        await tx.userInventory.createMany({
          data: data.inventory.map((i) => ({ ...i, userId: user.id })),
          skipDuplicates: true, 
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

      // 7. Goals (Complex Restore)
      // Insert Goals TANPA parentId dulu (biar gak error foreign key)
      for (const goal of data.goals) {
          await tx.goal.create({
              data: {
                  id: goal.id, 
                  userId: user.id,
                  title: goal.title,
                  color: goal.color,
                  progress: goal.progress,
                  status: goal.status,
                  type: goal.type,
                  createdAt: goal.createdAt,
                  completedAt: goal.completedAt,
                  // parentGoalId di-skip dulu
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

      // Link Parent Goals (Update setelah semua goal terbuat)
      const goalsWithParents = data.goals.filter(g => g.parentGoalId);
      for (const goal of goalsWithParents) {
          // Pastikan parent ada di backup ini
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