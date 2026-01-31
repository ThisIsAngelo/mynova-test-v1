"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useDebouncedCallback } from "use-debounce";

export const NoteSearch = () => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Logic: Tunggu user selesai ngetik 300ms, baru update URL
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }, 300);

  return (
    <div className="relative w-full md:w-[300px]">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {isPending ? (
          <AiOutlineLoading3Quarters className="animate-spin" />
        ) : (
          <IoSearchOutline />
        )}
      </div>
      <input
        placeholder="Search title..."
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("q")?.toString()}
        className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all placeholder:text-muted-foreground/50"
      />
    </div>
  );
};