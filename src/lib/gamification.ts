import { prisma } from "@/lib/db";
import { calculateCoinReward, calculateExpForNextLevel, MAX_LEVEL } from "./game-mechanics";
import { modifyCoins } from "./currency";

export { XP_RATES } from "./game-mechanics";

// Memberikan EXP ke user dan mengecek Level Up dengan Curve System.
export async function grantExp(userId: string, amount: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, experience: true, level: true },
  });

  if (!user) return null;

  // Jika sudah Max Level, tidak nambah XP lagi (atau bisa nambah XP tapi ga naik level)
  if (user.level >= MAX_LEVEL) {
    return {
      xpGained: 0,
      newLevel: user.level,
      isLevelUp: false,
      currentExp: user.experience,
    };
  }


  let currentExp = user.experience + amount;
  let currentLevel = user.level;
  let isLevelUp = false;

  let totalCoinReward = 0;

  // Ambil target XP untuk level saat ini
  let expToNextLevel = calculateExpForNextLevel(currentLevel);

  // LOGIC LEVEL UP (While Loop untuk handle multi-level up sekaligus)
  // Fix Bug 101: Menggunakan >= artinya pas 100 pun dia naik.
  while (currentExp >= expToNextLevel && currentLevel < MAX_LEVEL) {
    currentExp -= expToNextLevel; // Reset XP (Sisa XP dibawa ke level baru)
    currentLevel++;
    isLevelUp = true;

    totalCoinReward += calculateCoinReward(currentLevel);

    // Hitung target baru untuk level selanjutnya
    expToNextLevel = calculateExpForNextLevel(currentLevel);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      experience: currentExp,
      level: currentLevel,
    },
  });

  // [NEW] LOGIC NOVA COIN REWARD
  // Jika naik level (isLevelUp true), kasih hadiah koin!
  if (isLevelUp && totalCoinReward > 0) {
    await modifyCoins(
      userId,
      totalCoinReward,
      `Level Up Bonus (Reached Lvl ${currentLevel})`
    );
  }

  // Optional: Kalau mau setiap dapet EXP juga dapet Coin receh (misal 10% dari XP)
  // const grindCoins = Math.floor(amount * 0.1);
  // if (grindCoins > 0) await modifyCoins(userId, grindCoins, "Activity Reward");

  return {
    xpGained: amount,
    newLevel: currentLevel,
    isLevelUp: isLevelUp,
    currentExp: currentExp,
    coinReward: totalCoinReward
  };
}