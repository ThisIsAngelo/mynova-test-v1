import { prisma } from "@/lib/db";
import { ACHIEVEMENTS_DATA } from "./achievements-list";
import { grantExp } from "./gamification";
import { modifyCoins } from "./currency";

/**
 * Fungsi Internal: Mencoba membuka achievement spesifik.
 * Mengembalikan data achievement jika baru terbuka, atau null jika sudah pernah.
 */
async function tryUnlockAchievement(userId: string, achievementId: string) {
    const achievementDef = ACHIEVEMENTS_DATA[achievementId];
    if (!achievementDef) return null;

    // 1. Cek Anti-Duplikat (Cepat)
    const existing = await prisma.userAchievement.findUnique({
        where: {
            userId_achievementId: { userId, achievementId }
        }
    });

    if (existing) return null; // Sudah punya, stop.

    // 2. Unlock & Grant Rewards (Transactional biar aman)
    try {
        // Kita gunakan transaction agar record achievement & reward masuk barengan
        const result = await prisma.$transaction(async (tx) => {
            // a. Simpan record achievement
            // create akan throw error jika ada race condition (double insert), jadi aman.
            const record = await tx.userAchievement.create({
                data: { userId, achievementId }
            });

            return record;
        });

        // b. Jika sukses create, baru kasih reward (di luar transaction gapapa, atau di dalam juga oke)
        // Kita panggil helper exp/coin yang sudah ada
        if (achievementDef.xp > 0) {
            await grantExp(userId, achievementDef.xp);
        }
        if (achievementDef.gold > 0) {
            await modifyCoins(userId, achievementDef.gold, `Achievement: ${achievementDef.title}`);
        }

        return achievementDef; // Return data untuk ditampilkan di Frontend Toast

    } catch (error) {
        // Error biasanya karena unique constraint violation (race condition), abaikan saja.
        return null;
    }
}

/**
 * CHECKER: Panggil ini setiap kali User menyelesaikan TODO
 */
export async function checkTodoAchievements(userId: string) {
    // Hitung total todo yang selesai
    const count = await prisma.coinTransaction.count({
        where: {
            userId,
            description: "Task Completed" 
        }
    });

    const unlocked = [];

    // Logic Unlocking
    if (count >= 1) {
        const res = await tryUnlockAchievement(userId, "FIRST_TODO");
        if (res) unlocked.push(res);
    }
    if (count >= 10) {
        const res = await tryUnlockAchievement(userId, "TODO_10");
        if (res) unlocked.push(res);
    }
    if (count >= 100) {
        const res = await tryUnlockAchievement(userId, "TODO_100");
        if (res) unlocked.push(res);
    }

    return unlocked; // Array achievement baru (bisa kosong)
}

/**
 * CHECKER: Panggil ini setiap kali User menyelesaikan POMODORO
 */
export async function checkFocusAchievements(userId: string) {
    // Hitung total Exp Pomodoro User / Rate per sesi untuk estimasi jumlah sesi
    // ATAU lebih baik: Buat counter di user table. 
    // Tapi untuk V1, kita bisa hitung log transaksi EXP pomodoro atau simpan statistik manual.
    // SEMENTARA: Kita pakai trick hitung dari User.experience dibagi rata-rata (kurang akurat) 
    // ATAU SOLUSI TERBAIK: Tambahkan field `pomodoroCount` di User model nanti.

    // OPSI V1: Kita query Transaction History coin yg deskripsinya "Deep Focus Session"
    // Ini agak hacky tapi bekerja tanpa ubah schema user.
    const count = await prisma.coinTransaction.count({
        where: {
            userId,
            description: { contains: "Deep Focus" }
        }
    });

    const unlocked = [];

    if (count >= 1) {
        const res = await tryUnlockAchievement(userId, "FIRST_POMODORO");
        if (res) unlocked.push(res);
    }
    if (count >= 25) {
        const res = await tryUnlockAchievement(userId, "POMODORO_25");
        if (res) unlocked.push(res);
    }

    return unlocked;
}

/**
 * CHECKER: Panggil ini setiap kali User membuat/menyelesaikan GOAL
 */
export async function checkGoalAchievements(userId: string, type: "CREATE" | "COMPLETE") {
    const unlocked = [];

    if (type === "CREATE") {
        const count = await prisma.goal.count({ where: { userId } });
        if (count >= 1) {
            const res = await tryUnlockAchievement(userId, "FIRST_GOAL");
            if (res) unlocked.push(res);
        }
    }

    if (type === "COMPLETE") {
        const count = await prisma.goal.count({ where: { userId, status: "COMPLETED" } });
        if (count >= 1) {
            const res = await tryUnlockAchievement(userId, "FIRST_GOAL_COMPLETED");
            if (res) unlocked.push(res);
        }
    }

    return unlocked;
}