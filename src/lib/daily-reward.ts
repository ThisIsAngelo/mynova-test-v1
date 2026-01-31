import { differenceInCalendarDays } from "date-fns";

export const MAX_STREAK = 30;
export const MAX_BACKFILL = 3;

export const REWARD_TIERS = [
  { days: [1, 7], amount: 10 },
  { days: [8, 14], amount: 20 },
  { days: [15, 30], amount: 40 },
];

export const getRewardAmount = (day: number) => {
  const tier = REWARD_TIERS.find(t => day >= t.days[0] && day <= t.days[1]);
  return tier ? tier.amount : 5;
};

export const calculateClaimLogic = (lastClaimedAt: Date | null, currentStreak: number) => {
  const today = new Date();
  
  // 1. User Baru / Belum pernah klaim
  if (!lastClaimedAt) {
    return {
      canClaim: true,
      streakNow: 1, // Hari ke-1
      rewardsToClaim: [{ day: 1, amount: getRewardAmount(1) }],
      missedDays: 0,
      isReset: false
    };
  }

  const daysDiff = differenceInCalendarDays(today, lastClaimedAt);

  // 2. Sudah klaim hari ini
  if (daysDiff === 0) {
    return { canClaim: false, streakNow: currentStreak, rewardsToClaim: [], missedDays: 0 };
  }

  // 3. Hitung Posisi Hari Baru
  // Sesuai request: Streak lanjut terus berdasarkan kalender, tapi reward dibatasi
  let nextStreak = currentStreak + daysDiff;
  
  // Reset jika lewat 30 hari
  let isReset = false;
  if (nextStreak > MAX_STREAK) {
      nextStreak = 1; 
      isReset = true;
      // Logic reset sederhana: Mulai lagi dari day 1
  }

  // 4. Hitung Backfill (Max 3 hari ke belakang + Hari ini)
  // Logic: Kita ambil range dari (NextStreak) mundur ke belakang sampai max backfill
  // Tapi tidak boleh lebih kecil dari (CurrentStreak + 1)
  
  const maxClaimableRange = Math.min(daysDiff, MAX_BACKFILL + 1); // +1 itu hari ini
  const rewardsToClaim = [];

  for (let i = 0; i < maxClaimableRange; i++) {
      const dayToClaim = nextStreak - i;
      // Safety check: Jangan klaim hari yang sudah lewat (currentStreak) kecuali reset
      if (!isReset && dayToClaim <= currentStreak) continue;
      
      rewardsToClaim.unshift({ // Unshift biar urut dari kecil ke besar
          day: dayToClaim,
          amount: getRewardAmount(dayToClaim)
      });
  }

  return {
    canClaim: true,
    streakNow: nextStreak,
    rewardsToClaim,
    missedDays: Math.max(0, daysDiff - 1 - MAX_BACKFILL), // Hari yang hangus
    isReset
  };
};