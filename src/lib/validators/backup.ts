import { z } from "zod";

// Helper untuk validasi tanggal dari string JSON
const dateSchema = z.string().pipe(z.coerce.date());

// [FIXED] Gunakan transform manual agar tipe data aman
const nullableDateSchema = z.string()
  .nullable()
  .optional()
  .transform((val) => {
    // Jika value ada (string), ubah jadi Date. 
    // Jika null atau undefined, return null (sesuai standar Prisma).
    return val ? new Date(val) : null;
  });

// Schema untuk setiap Model (Simplified version of Prisma models)
export const backupSchema = z.object({
  meta: z.object({
    version: z.number(),
    exportedAt: z.string(),
    userId: z.string(), // Cek biar gak restore punya orang lain
  }),
  data: z.object({
    user: z.object({
      level: z.number(),
      experience: z.number(),
      coins: z.number(),
      streakCount: z.number(),
      activeAvatar: z.string(),
      activeFrame: z.string(),
    }),
    inventory: z.array(z.object({
      shopItemId: z.string(),
      unlockedAt: dateSchema,
    })),
    achievements: z.array(z.object({
      achievementId: z.string(),
      unlockedAt: dateSchema,
    })),
    todos: z.array(z.object({
      id: z.string(), // Kita keep ID biar konsisten
      title: z.string(),
      description: z.string().nullable().optional(),
      isCompleted: z.boolean(),
      type: z.enum(["NORMAL", "DAILY", "WEEKLY", "MONTHLY"]),
      createdAt: dateSchema,
      updatedAt: dateSchema,
    })),
    goals: z.array(z.object({
      id: z.string(),
      title: z.string(),
      color: z.string(),
      progress: z.number(),
      status: z.string(),
      type: z.enum(["SHORT", "LONG"]),
      parentGoalId: z.string().nullable().optional(),
      createdAt: dateSchema,
      completedAt: nullableDateSchema,
      milestones: z.array(z.object({
        id: z.string(),
        title: z.string(),
        isCompleted: z.boolean(),
      })),
    })),
    notes: z.array(z.object({
      id: z.string(),
      title: z.string(),
      content: z.string().nullable().optional(),
      createdAt: dateSchema,
      updatedAt: dateSchema,
    })),
    // ... Tambahkan model lain (Ideas, Tips, Wishlists, CoinHistory) sesuai kebutuhan
    coinHistory: z.array(z.object({
      amount: z.number(),
      description: z.string(),
      createdAt: dateSchema,
    })),
  }),
});

export type BackupData = z.infer<typeof backupSchema>;