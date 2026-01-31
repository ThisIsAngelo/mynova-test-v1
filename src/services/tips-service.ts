import axios from "axios";
import { Tip } from "@/generated/prisma/client";

const api = axios.create({ baseURL: "/api" });

export const tipsApi = {
  getTips: async () => {
    const res = await api.get("/tips");
    return res.data as Tip[];
  },
  createTip: async (content: string, source: string) => {
    const res = await api.post("/tips", { content, source });
    return res.data as Tip;
  },
  
  updateTip: async (id: string, content: string, source: string) => {
    const res = await api.patch(`/tips/${id}`, { content, source });
    return res.data as Tip;
  },
  deleteTip: async (id: string) => {
    await api.delete(`/tips?id=${id}`);
  },
};