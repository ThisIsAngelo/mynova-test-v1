import axios from "axios";
import { Wishlist } from "@/generated/prisma/client";

const api = axios.create({ baseURL: "/api" });

export const wishlistApi = {
  getWishlist: async () => {
    const res = await api.get("/wishlist");
    return res.data as Wishlist[];
  },
  createWishlist: async (title: string, url: string, description?: string) => {
    const res = await api.post("/wishlist", { title, url, description });
    return res.data as Wishlist;
  },
  updateWishlist: async (id: string, title: string, url: string, description?: string) => {
    const res = await api.patch(`/wishlist/${id}`, { title, url, description });
    return res.data as Wishlist;
  },
  deleteWishlist: async (id: string) => {
    await api.delete(`/wishlist?id=${id}`);
  },
};