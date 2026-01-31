"use client";

import { useState, useLayoutEffect, useRef } from "react";
import { Tip } from "@/generated/prisma/client";
import { TipCard } from "./tip-card";
import { tipsApi } from "@/services/tips-service";
import { toast } from "sonner";
import { IoAdd, IoLibraryOutline, IoShareSocial } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface TipsBoardProps {
  initialTips: Tip[];
}

export const TipsBoard = ({ initialTips }: TipsBoardProps) => {
  const [tips, setTips] = useState(initialTips);
  
  // Input State
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animasi Entry
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".tip-item",
        { y: 30, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.2)" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // --- HANDLERS ---
  const handleCreate = async () => {
    if (!content.trim()) return;
    setIsCreating(true);
    try {
        const newTip = await tipsApi.createTip(content, source || "Anonymous");
        setTips([newTip, ...tips]);
        toast.success("Knowledge captured!");
        setContent("");
        setSource("");
        setIsFocused(false);
    } catch (error) {
        toast.error("Failed to save");
    } finally {
        setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string, content: string, source: string) => {
      const prevTips = [...tips];
      setTips(prev => prev.map(t => t.id === id ? { ...t, content, source } : t));
      try {
          await tipsApi.updateTip(id, content, source);
          toast.success("Wisdom polished!");
      } catch (error) {
          setTips(prevTips);
          toast.error("Update failed");
      }
  };

  const handleDelete = async (id: string) => {
    const prevTips = [...tips];
    setTips(prev => prev.filter(t => t.id !== id));
    try {
        await tipsApi.deleteTip(id);
        toast.success("Deleted");
    } catch (error) {
        setTips(prevTips);
        toast.error("Delete failed");
    }
  };

  return (
    <div className="w-full space-y-10" ref={containerRef}>
        
        {/* --- INPUT SECTION --- */}
        <div className="tip-item mx-auto max-w-2xl">
            <div 
                className={cn(
                    "relative overflow-hidden rounded-2xl bg-card border transition-all duration-300 shadow-sm",
                    isFocused 
                        ? "border-primary/50 ring-2 ring-primary/10 shadow-lg scale-[1.01]" 
                        : "border-border hover:border-primary/30"
                )}
            >
                {/* Text Area */}
                <div className="p-1">
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        placeholder="What did you learn today?"
                        disabled={isCreating}
                        rows={isFocused || content ? 3 : 1}
                        className="w-full bg-transparent px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 resize-none outline-none disabled:opacity-50 transition-all min-h-[50px]"
                        onKeyDown={(e) => {
                            // Kirim hanya jika tekan Enter (tanpa Shift) di Desktop
                            // Di mobile biarkan enter buat baris baru
                            if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 640) {
                                e.preventDefault();
                                if(!isCreating) handleCreate();
                            }
                        }}
                    />
                </div>
                
                {/* Footer Input (Source & Button) */}
                <div className={cn(
                    "transition-all duration-300 ease-in-out overflow-hidden px-4",
                    isFocused || content ? "max-h-[200px] py-4 opacity-100" : "max-h-0 py-0 opacity-0"
                )}>
                    {/* LAYOUT FIX: Flex Col di Mobile, Row di Desktop */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        
                        {/* Source Input */}
                        <div className="flex-1 bg-muted/40 rounded-xl px-3 py-2.5 flex items-center border border-transparent focus-within:border-primary/30 focus-within:bg-background transition-all">
                            <IoShareSocial className="text-muted-foreground shrink-0 text-sm mr-2" />
                            <input 
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder="Source (e.g. Book, TikTok)"
                                disabled={isCreating}
                                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50 w-full"
                                onKeyDown={(e) => e.key === "Enter" && !isCreating && handleCreate()}
                            />
                        </div>

                        {/* Save Button */}
                        <button 
                            onClick={handleCreate} 
                            disabled={isCreating || !content.trim()}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm active:scale-95 w-full sm:w-auto whitespace-nowrap"
                        >
                            {isCreating ? <AiOutlineLoading3Quarters className="animate-spin" /> : <><IoAdd size={18} /> <span className="font-bold text-sm">Save Note</span></>}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* --- GRID LIST --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start pb-10">
            {tips.map((tip) => (
                <div key={tip.id} className="tip-item h-full">
                    <TipCard 
                        tip={tip} 
                        onDelete={handleDelete} 
                        onUpdate={handleUpdate} 
                    />
                </div>
            ))}
            
            {tips.length === 0 && (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-border/50 rounded-3xl bg-muted/5 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 shadow-sm border border-border">
                        <IoLibraryOutline className="text-muted-foreground text-2xl" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Knowledge Base Empty</h3>
                    <p className="text-muted-foreground text-sm mt-1">Start collecting your wisdom snippets.</p>
                </div>
            )}
        </div>

    </div>
  );
};