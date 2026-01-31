import { create } from 'zustand';

interface CurrencyState {
  coins: number;
  isLoading: boolean;
  
  // Actions
  fetchCoins: () => Promise<void>;
  optimisticUpdate: (amount: number) => void; // Biar UI nambah duluan sebelum server
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  coins: 0,
  isLoading: false,

  fetchCoins: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/currency/balance");
      const data = await res.json();
      set({ coins: data.coins });
    } catch (error) {
      console.error("Failed to fetch coins");
    } finally {
      set({ isLoading: false });
    }
  },

  optimisticUpdate: (amount: number) => {
    set((state) => ({ coins: state.coins + amount }));
  }
}));