import { Todo } from "@/generated/prisma/client";
import axios from "axios";
import { GamificationResult } from "@/store/use-gamification"; 

const api = axios.create({
  baseURL: "/api/todo",
  headers: {
    "Content-Type": "application/json",
  },
});

type UpdateTodoResponse = Todo & {
    gamification?: GamificationResult;
};

export const todoApi = {
  // CREATE
  create: async (title: string, description?: string, type: string = "NORMAL"): Promise<Todo> => {
    const response = await api.post("/", { title, description, type });
    return response.data;
  },

  // UPDATE
  update: async (id: string, data: Partial<Todo>): Promise<UpdateTodoResponse> => {
    const response = await api.patch(`/${id}`, data);
    return response.data;
  },

  // DELETE
  delete: async (id: string): Promise<boolean> => {
    await api.delete(`/${id}`);
    return true;
  },

  // REORDER
  reorder: async (ids: string[]): Promise<void> => {
    await api.patch("/reorder", { ids });
  },

  // DELETE COMPLTED
  deleteCompleted: async (): Promise<void> => {
    await api.delete("/completed");
  },
};