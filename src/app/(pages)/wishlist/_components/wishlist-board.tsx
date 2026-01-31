"use client";

import { useState, useLayoutEffect, useRef } from "react";
import { Wishlist } from "@/generated/prisma/client";
import { WishlistCard } from "./wishlist-card";
import { wishlistApi } from "@/services/wishlist-service";
import { toast } from "sonner";
import { IoAdd, IoImageOutline, IoLogoYoutube, IoSparkles } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface WishlistBoardProps {
  initialData: Wishlist[];
}

export const WishlistBoard = ({ initialData }: WishlistBoardProps) => {
  const [items, setItems] = useState(initialData);
  
  // Input State
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".wishlist-item",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !url.trim()) {
        toast.error("Missing Info", { description: "Title and URL are required!" });
        return;
    }
    setIsCreating(true);
    try {
        const newItem = await wishlistApi.createWishlist(title, url, desc);
        setItems([newItem, ...items]);
        toast.success("Added to Dream Garage");
        setTitle(""); setUrl(""); setDesc(""); setIsFocused(false);
    } catch (error) {
        toast.error("Failed to add");
    } finally {
        setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string, newTitle: string, newUrl: string, newDesc: string) => {
      const oldItems = [...items];
      setItems(prev => prev.map(i => i.id === id ? { ...i, title: newTitle, url: newUrl, description: newDesc } : i));
      try {
          await wishlistApi.updateWishlist(id, newTitle, newUrl, newDesc);
          toast.success("Updated");
      } catch (error) {
          setItems(oldItems);
          toast.error("Update Failed");
      }
  };

  const handleDelete = async (id: string) => {
    const prevItems = [...items];
    setItems(prev => prev.filter(i => i.id !== id));
    try {
        await wishlistApi.deleteWishlist(id);
        toast.success("Deleted");
    } catch (error) {
        setItems(prevItems);
        toast.error("Failed to delete");
    }
  };

  return (
    <div className="w-full space-y-16" ref={containerRef}>
        
        {/* INPUT FORM */}
        <div className="wishlist-item mx-auto max-w-2xl">
            <div 
                className={cn(
                    "relative overflow-hidden rounded-2xl bg-card transition-all duration-300",
                    isFocused 
                        ? "border border-primary ring-4 ring-primary/5 shadow-xl" 
                        : "border border-border hover:border-primary/30 shadow-sm hover:shadow-md"
                )}
            >
                {/* Header Input */}
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted/30 border-b border-border/50">
                    <div className={cn(
                        "p-2.5 rounded-xl transition-colors shrink-0",
                        isFocused ? "bg-primary text-primary-foreground" : "bg-background border border-border text-muted-foreground"
                    )}>
                        <IoSparkles />
                    </div>
                    <input 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        className="flex-1 bg-transparent text-base sm:text-lg font-semibold outline-none placeholder:text-muted-foreground/50 disabled:opacity-50 text-foreground"
                        placeholder="What do you desire?"
                        disabled={isCreating}
                    />
                </div>

                {/* Expanded Fields */}
                <div className={cn(
                    "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden",
                    isFocused || title || url ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}>
                    <div className="p-4 space-y-4 bg-card">
                        
                        <div className="relative group">
                            <div className="absolute left-3 top-3 text-muted-foreground transition-colors group-focus-within:text-primary">
                                {url.includes("youtube") || url.includes("youtu.be") ? (
                                    <IoLogoYoutube className="text-red-500" />
                                ) : (
                                    <IoImageOutline />
                                )}
                            </div>
                            <input 
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Paste Image or YouTube URL..."
                                disabled={isCreating}
                                className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50"
                            />
                        </div>

                        <textarea 
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="Why do you want it? (Optional)"
                            disabled={isCreating}
                            rows={2}
                            className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/50 resize-none leading-relaxed"
                        />

                        <div className="flex gap-2 justify-end pt-2">
                            <button 
                                onClick={() => setIsFocused(false)} 
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                            <button 
                                onClick={handleCreate} 
                                disabled={isCreating || !title || !url}
                                className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                            >
                                {isCreating ? <AiOutlineLoading3Quarters className="animate-spin" /> : <><IoAdd size={18} /> Add Dream</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- GRID GALLERY --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-10">
            {items.map((item) => (
                <div key={item.id} className="wishlist-item h-full">
                    <WishlistCard 
                        item={item} 
                        onDelete={handleDelete} 
                        onUpdate={handleUpdate}
                    />
                </div>
            ))}
            
            {items.length === 0 && (
                <div className="col-span-full py-32 flex flex-col items-center justify-center text-center border-2 border-dashed border-border/50 rounded-3xl bg-muted/5">
                    <div className="w-16 h-16 bg-background border border-border rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <IoSparkles className="text-muted-foreground text-2xl" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Garage Empty</h3>
                    <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
                        Your future collection starts here. Add your first dream item.
                    </p>
                </div>
            )}
        </div>

    </div>
  );
};