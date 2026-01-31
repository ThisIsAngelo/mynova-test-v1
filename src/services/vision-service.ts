import axios from "axios";
import { Goal, Idea, Milestone } from "@/generated/prisma/client";

const api = axios.create({ baseURL: "/api/vision" });

export const visionApi = {
  // GOALS
 createGoal: async (
    title: string, 
    color: string, 
    type: "SHORT" | "LONG" = "SHORT", 
    parentGoalId?: string
  ) => {
    const res = await api.post("/goals", { title, color, type, parentGoalId });
    return res.data;
  },
  
  updateGoal: async (id: string, title: string, color?: string) => {
      const res = await api.patch(`/goals/${id}`, { title, color });
      return res.data;
  },
  deleteGoal: async (id: string) => {
    await api.delete(`/goals?id=${id}`);
  },

  // MILESTONES
  createMilestone: async (goalId: string, title: string) => {
    const res = await api.post("/milestones", { goalId, title });
    return res.data as Milestone;
  },
  updateMilestone: async (id: string, data: { title?: string; isCompleted?: boolean }) => {
      const res = await api.patch("/milestones", { id, ...data });
      return res.data;
  },
  // Wrapper lama biar gak rusak code yang ada
  toggleMilestone: async (id: string, isCompleted: boolean) => {
      const res = await api.patch("/milestones", { id, isCompleted });
      return res.data;
  },
  deleteMilestone: async (id: string, goalId: string) => {
    await api.delete(`/milestones?id=${id}&goalId=${goalId}`);
  },

  // IDEAS
  createIdea: async (content: string) => {
    const res = await api.post("/ideas", { content });
    return res.data as Idea;
  },
  updateIdea: async (id: string, content: string) => {
      const res = await api.patch(`/ideas/${id}`, { content });
      return res.data;
  },
  deleteIdea: async (id: string) => {
    await api.delete(`/ideas?id=${id}`);
  },
};