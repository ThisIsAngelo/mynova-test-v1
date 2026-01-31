/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { toast } from "sonner";
import { IoSparkles, IoTrendingUp } from "react-icons/io5";
import React from "react";
import { useCurrencyStore } from "./use-currency";
import { CoinsIcon } from "lucide-react";
// [NEW] Import ACHIEVEMENTS_DATA untuk mengambil referensi Icon
import { AchievementDef, ACHIEVEMENTS_DATA } from "@/lib/achievements-list";

export interface GamificationResult {
  xpGained: number;
  newLevel: number;
  isLevelUp: boolean;
  currentExp: number;
  coinReward?: number;
  coinsEarned?: number;
  achievements?: AchievementDef[];
}

interface ApiResponseWithGamification {
  gamification?: GamificationResult;
  [key: string]: any; 
}

interface GamificationStore {
  processGamification: (apiResponse: ApiResponseWithGamification) => void;
}

export const useGamificationStore = create<GamificationStore>((set) => ({
  processGamification: (data) => {
    if (!data || !data.gamification) return;

    const { xpGained, isLevelUp, newLevel, coinReward, coinsEarned } = data.gamification;

    if (isLevelUp || ((coinsEarned || 0) > 0)) {
      useCurrencyStore.getState().fetchCoins();
    }

    // 1. Toast XP
    if (xpGained > 0) {
      toast.success("Experience Gained!", {
        description: `+${xpGained} XP`,
        icon: React.createElement(IoSparkles, { className: "text-amber-500 text-lg" }),
        duration: 3000,
        className: "border-amber-500/20 bg-amber-500/5",
      });
    }

    // 2. Toast Level Up
    if (isLevelUp) {
      setTimeout(() => {
        const hasReward = (coinReward || 0) > 0;
        const rewardText = hasReward
          ? `You reached Level ${newLevel} and earned ${coinReward} Nova Coins!`
          : `Congratulations! You reached Level ${newLevel}.`;

        toast("LEVEL UP!", {
          description: rewardText,
          icon: React.createElement(hasReward ? CoinsIcon : IoTrendingUp, {
            className: hasReward ? "text-emerald-500 text-lg" : "text-indigo-500 text-lg"
          }),
          duration: 6000,
          className: "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/50 shadow-lg",
        });
      }, 800);
    }

    // 3. Toast Reward Coin (Non Level Up)
    if (!isLevelUp && coinsEarned && coinsEarned > 0) {
      toast("Reward", {
        description: `+${coinsEarned} Nova Coins`,
        icon: React.createElement(CoinsIcon, { className: "text-emerald-500" }),
        duration: 2000,
      });
    }

    // [FIXED] 4. Toast Achievement
    if (data.gamification?.achievements?.length) {
      data.gamification.achievements.forEach((ach) => {
        
        // Ambil data asli (termasuk Icon) dari local constant
        // karena function Icon hilang saat lewat API (JSON)
        const achievementMaster = ACHIEVEMENTS_DATA[ach.id];

        if (!achievementMaster) return;

        setTimeout(() => {
          toast.success(achievementMaster.title, {
            description: achievementMaster.description,
            // Gunakan Icon dari achievementMaster
            icon: React.createElement(achievementMaster.icon, { className: "text-amber-500 text-lg" }),
            duration: 5000,
            className: "border-amber-500/50 bg-amber-500/10"
          });
        }, 1500); 
      });
    }
  },
}));