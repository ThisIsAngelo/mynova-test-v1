import { z } from "zod";

// Helper untuk validasi tanggal
const dateSchema = z.string().pipe(z.coerce.date());

// Helper untuk nullable date (Fix error sebelumnya)
const nullableDateSchema = z.string()
  .nullable()
  .optional()
  .transform((val) => (val ? new Date(val) : null));

export const backupSchema = z.object({
  meta: z.object({
    version: z.number(),
    exportedAt: z.string(),
    userId: z.string(),
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
      id: z.string(),
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
    ideas: z.array(z.object({
      id: z.string(),
      content: z.string(),
      createdAt: dateSchema,
    })),
    tips: z.array(z.object({
      id: z.string(),
      content: z.string(),
      source: z.string().nullable().optional(),
      createdAt: dateSchema,
    })),
    wishlists: z.array(z.object({
      id: z.string(),
      title: z.string(),
      url: z.string(),
      description: z.string().nullable().optional(),
      createdAt: dateSchema,
    })),

    coinHistory: z.array(z.object({
      amount: z.number(),
      description: z.string(),
      createdAt: dateSchema,
    })),
  }),
});

export type BackupData = z.infer<typeof backupSchema>;