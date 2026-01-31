"use client";

import { cn } from "@/lib/utils";
import { useCurrencyStore } from "@/store/use-currency";
import { CoinsIcon } from "lucide-react";
import { useEffect } from "react";

export const NovaCoinBadge = ({ className }: { className?: string }) => {
  const { coins, fetchCoins, isLoading } = useCurrencyStore();

  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-400 font-mono text-xs font-bold tracking-wider shadow-sm",
      className
    )}>
      <div className="p-1 bg-amber-500 rounded-full text-white">
        <CoinsIcon size={12} />
      </div>
      <span>
        {isLoading ? "..." : coins.toLocaleString()} NC
      </span>
    </div>
  );
};