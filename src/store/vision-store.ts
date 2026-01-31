import { create } from 'zustand';
import { Goal } from '@/generated/prisma/client';

interface VisionState {
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  updateGoalProgress: (id: string, progress: number) => void;
}

export const useVisionStore = create<VisionState>((set) => ({
  goals: [],
  
  // Fungsi untuk mengisi data awal dari Server
  setGoals: (goals) => set({ goals }),

  // Fungsi untuk update progress tanpa refresh server
  updateGoalProgress: (id, progress) => 
    set((state) => ({
      goals: state.goals.map((g) => 
        g.id === id ? { ...g, progress } : g
      ),
    })),
}));