/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  IoCheckboxOutline, IoCheckmarkDoneCircle, 
  IoTrophyOutline, IoFlame, IoTimeOutline, 
  IoMedalOutline, IoStar 
} from "react-icons/io5";

export type AchievementTier = "BRONZE" | "SILVER" | "GOLD";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: any; // React Icon component
  tier: AchievementTier;
  xp: number;   // Reward XP
  gold: number; // Reward Coin
}

export const ACHIEVEMENTS_DATA: Record<string, AchievementDef> = {
  // --- TODO CATEGORY ---
  "FIRST_TODO": {
    id: "FIRST_TODO",
    title: "The Beginning",
    description: "Complete your very first task.",
    icon: IoCheckboxOutline,
    tier: "BRONZE",
    xp: 50,
    gold: 10
  },
  "TODO_10": {
    id: "TODO_10",
    title: "Getting Serious",
    description: "Complete 10 tasks.",
    icon: IoCheckmarkDoneCircle,
    tier: "BRONZE",
    xp: 100,
    gold: 25
  },
  "TODO_100": {
    id: "TODO_100",
    title: "Task Master",
    description: "Complete 100 tasks.",
    icon: IoTrophyOutline,
    tier: "GOLD",
    xp: 500,
    gold: 200
  },

  // --- FOCUS / POMODORO CATEGORY ---
  "FIRST_POMODORO": {
    id: "FIRST_POMODORO",
    title: "Focus Initiate",
    description: "Complete 1 full focus session.",
    icon: IoFlame,
    tier: "BRONZE",
    xp: 50,
    gold: 15
  },
  "POMODORO_25": {
    id: "POMODORO_25",
    title: "Deep Diver",
    description: "Complete 25 focus sessions.",
    icon: IoTimeOutline,
    tier: "SILVER",
    xp: 300,
    gold: 100
  },

  // --- GOAL / VISION CATEGORY ---
  "FIRST_GOAL": {
    id: "FIRST_GOAL",
    title: "Dreamer",
    description: "Create your first Goal.",
    icon: IoStar,
    tier: "BRONZE",
    xp: 50,
    gold: 10
  },
  "FIRST_GOAL_COMPLETED": {
    id: "FIRST_GOAL_COMPLETED",
    title: "Dream Catcher",
    description: "Complete a Goal.",
    icon: IoMedalOutline,
    tier: "GOLD",
    xp: 500,
    gold: 100
  }
};