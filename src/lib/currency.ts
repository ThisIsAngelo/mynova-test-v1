import { prisma } from "@/lib/db";

/**
 * Mengubah jumlah koin user (Tambah atau Kurang)
 * @param userId ID User
 * @param amount Jumlah koin (Positif = Tambah, Negatif = Kurang/Belanja)
 * @param description Catatan transaksi
 */
export async function modifyCoins(userId: string, amount: number, description: string) {
  try {
    // 1. Cek User & Saldo (Jika pengurangan)
    if (amount < 0) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { coins: true } });
      if (!user || user.coins < Math.abs(amount)) {
        throw new Error("Insufficient funds"); // Saldo tidak cukup
      }
    }

    // 2. Database Transaction (Atomicity: Update Saldo + Catat History harus sukses bareng)
    const result = await prisma.$transaction(async (tx) => {
      // Update Saldo
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { coins: { increment: amount } },
        select: { coins: true },
      });

      // Catat History
      await tx.coinTransaction.create({
        data: {
          userId,
          amount,
          description,
        },
      });

      return updatedUser;
    });

    return { success: true, newBalance: result.coins };
  } catch (error) {
    console.error("[MODIFY_COINS_ERROR]", error);
    return { success: false, error };
  }
}

// Rates: Harga reward dalam Nova Coin
export const COIN_RATES = {
  TODO_COMPLETED: 5,   // Receh dari tugas harian
  GOAL_COMPLETED: 50,  // Bonus goal
  POMODORO_SESSION: 10,// Bonus fokus
};