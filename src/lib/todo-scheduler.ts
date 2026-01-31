import { prisma } from "@/lib/db";
// import { TodoType } from "@prisma/client";
import { startOfDay, startOfWeek, startOfMonth, isBefore } from "date-fns";

export async function generateRecurringTodos(userId: string) {
  // 1. Ambil semua Template Recurring milik user
  // Template adalah Todo yang type-nya BUKAN NORMAL
  const templates = await prisma.todo.findMany({
    where: {
      userId,
      type: { not: "NORMAL" }, 
    },
  });

  const now = new Date();
  const createdInstances = [];

  // 2. Loop setiap template, cek apakah perlu generate anak baru
  for (const template of templates) {
    let shouldGenerate = false;
    const lastRun = template.lastGeneratedAt;

    // --- LOGIC PENGECEKAN WAKTU ---
    if (!lastRun) {
      // Kalau belum pernah jalan sama sekali, generate sekarang
      shouldGenerate = true;
    } else {
      // Cek berdasarkan tipe
      switch (template.type) {
        case "DAILY":
          // Jika last run sebelum hari ini jam 00:00 -> Generate
          if (isBefore(lastRun, startOfDay(now))) shouldGenerate = true;
          break;
        case "WEEKLY":
          // Jika last run sebelum hari Senin minggu ini -> Generate
          if (isBefore(lastRun, startOfWeek(now, { weekStartsOn: 1 }))) shouldGenerate = true;
          break;
        case "MONTHLY":
          // Jika last run sebelum tanggal 1 bulan ini -> Generate
          if (isBefore(lastRun, startOfMonth(now))) shouldGenerate = true;
          break;
      }
    }

    // --- EKSEKUSI GENERATE ---
    if (shouldGenerate) {
      // 1. Buat Instance Baru (Tipe NORMAL, tapi punya sourceId)
      // Instance ini yang akan muncul di list hari ini
      await prisma.todo.create({
        data: {
          title: template.title,
          description: template.description,
          userId: template.userId,
          type: "NORMAL", // Anak hasil generate selalu NORMAL agar bisa dicentang
          sourceId: template.id, // Referensi ke bapaknya
          order: 0, // Taruh paling atas (opsional)
        },
      });

      // 2. Update Template (Tandai sudah generate hari ini)
      await prisma.todo.update({
        where: { id: template.id },
        data: { lastGeneratedAt: now },
      });

      createdInstances.push(template.title);
    }
  }

  if (createdInstances.length > 0) {
    console.log(`[SCHEDULER] Generated ${createdInstances.length} recurring tasks.`);
  }
}