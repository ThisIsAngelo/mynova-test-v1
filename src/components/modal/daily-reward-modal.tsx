"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IoCheckmark, IoLockClosed, IoGift, IoWarning, IoFlame } from "react-icons/io5";
import { toast } from "sonner";
import { useCurrencyStore } from "@/store/use-currency";
import confetti from "canvas-confetti";
import gsap from "gsap";

interface DailyRewardData {
    canClaim: boolean;
    streakNow: number;
    currentStreak: number;
    rewardsToClaim: { day: number; amount: number }[];
    missedDays: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const DailyRewardModal = ({ isOpen, onClose }: Props) => {
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [data, setData] = useState<DailyRewardData | null>(null);
    const { fetchCoins } = useCurrencyStore();
    
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Status saat Modal Dibuka
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetch("/api/daily-reward/claim", { method: "GET" })
                .then(res => res.json())
                .then(data => setData(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    // 2. Animasi Masuk (GSAP) - Dibuat Lebih Smooth & Jelas
    useLayoutEffect(() => {
        if (!loading && data && isOpen && containerRef.current) {
            const ctx = gsap.context(() => {
                // Reset state awal (biar ga flash)
                gsap.set(".anim-pop-in", { scale: 0.5, opacity: 0 });
                gsap.set(".anim-slide-up", { y: 20, opacity: 0 });

                const tl = gsap.timeline({ defaults: { ease: "back.out(1.4)" } });

                // A. Header Slide Down
                tl.fromTo(".modal-header", 
                    { y: -20, opacity: 0 }, 
                    { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
                );

                // B. Grid Items Pop In (Cascade Rapi)
                tl.to(".anim-pop-in", {
                    scale: 1,
                    opacity: 1,
                    duration: 0.4,
                    stagger: {
                        amount: 0.6, // Total durasi sebaran
                        grid: "auto",
                        from: "start"
                    }
                }, "-=0.2");

                // C. Button Action
                tl.to(".anim-slide-up", {
                    y: 0,
                    opacity: 1,
                    duration: 0.5
                }, "-=0.4");

            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading, data, isOpen]);

    const handleClaim = async () => {
        if (!data?.canClaim) return;
        setClaiming(true);
        try {
            const res = await fetch("/api/daily-reward/claim", { method: "POST" });
            const result = await res.json();
            
            if (result.success) {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    zIndex: 9999, // Di atas modal
                    colors: ['#F59E0B', '#FCD34D', '#FFFFFF'] // Warna emas & putih
                });
                
                toast.success(`Claimed +${result.totalCoins} Nova Coins!`);
                fetchCoins(); 
                onClose();
            }
        } catch (error) {
            toast.error("Failed to claim reward");
        } finally {
            setClaiming(false);
        }
    };

    if (!data && loading) return null;

    const renderDay = (day: number) => {
        if (!data) return null;

        const isPast = day <= data.currentStreak && day < (data.rewardsToClaim[0]?.day || 99);
        const isToClaim = data.rewardsToClaim.some(r => r.day === day);
        const isBurned = day > data.currentStreak && day < (data.rewardsToClaim[0]?.day || 0);
        const isLocked = day > (data.canClaim ? data.streakNow : data.currentStreak);
        
        const isMilestone = day % 7 === 0;
        const amount = day <= 7 ? 5 : day <= 14 ? 8 : 10;

        return (
            <div 
                key={day}
                className={cn(
                    "anim-pop-in relative flex flex-col items-center justify-center p-1 rounded-xl border aspect-[4/5] transition-all duration-300 overflow-hidden select-none",
                    // --- STYLE STATES ---
                    isToClaim 
                        ? "bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400 shadow-lg shadow-amber-500/20 scale-105 z-10" // Active (Claimable)
                        : isPast 
                            ? "bg-emerald-500/10 border-emerald-500/20 opacity-70" // Done
                            : isBurned
                                ? "bg-destructive/10 border-destructive/20 opacity-50 grayscale" // Missed
                                : "bg-card/40 border-white/5", // Locked
                    isMilestone && !isLocked && !isBurned && !isPast && !isToClaim && "border-primary/40 bg-primary/5 shadow-[0_0_15px_-5px_rgba(var(--primary),0.3)]"
                )}
            >
                {/* Visual Feedback Text/Icon */}
                <span className={cn(
                    "text-[8px] sm:text-[9px] font-black uppercase tracking-wider mb-auto mt-1",
                    isToClaim ? "text-white/90" : "text-muted-foreground/60"
                )}>Day {day}</span>
                
                <div className="flex-1 flex items-center justify-center relative">
                    {isPast ? (
                        <IoCheckmark className="text-emerald-500 text-lg sm:text-xl" />
                    ) : isToClaim ? (
                        <div className="animate-bounce-slow drop-shadow-md">
                            <IoGift className="text-white text-2xl sm:text-3xl" />
                        </div>
                    ) : isBurned ? (
                        <IoWarning className="text-destructive/50 text-lg" />
                    ) : (
                        <div className={cn(isMilestone ? "text-primary/60" : "text-muted-foreground/20")}>
                            {isLocked ? <IoLockClosed className="text-lg" /> : <IoGift className="text-xl" />}
                        </div>
                    )}
                </div>

                {/* Amount Pill */}
                <div className={cn(
                    "mt-auto mb-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tabular-nums min-w-[30px] text-center",
                    isToClaim ? "bg-white/20 text-white" : "text-muted-foreground/50 bg-black/10 dark:bg-white/5"
                )}>
                    {isBurned ? "X" : `+${amount}`}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* FIX MOBILE: w-[95vw] agar ada margin kiri kanan di HP, rounded-3xl biar estetik */}
            <DialogContent className="w-[95vw] max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none max-h-[90vh] flex flex-col items-center justify-center rounded-3xl outline-none">
                
                {/* Glass Container */}
                <div ref={containerRef} className="w-full bg-background/90 dark:bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                    
                    {/* Header: Simplified & Cleaner */}
                    <div className="modal-header relative p-6 border-b border-white/5 z-10 bg-gradient-to-b from-white/5 to-transparent text-center">
                        <DialogTitle className="text-2xl sm:text-3xl font-heading font-black tracking-tighter flex items-center justify-center gap-2">
                            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Daily Reward</span>
                            <IoFlame className="text-orange-500 animate-pulse" />
                        </DialogTitle>
                        
                        <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-1">
                            {data?.missedDays 
                                ? <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full">Recovering missed days!</span>
                                : "Consistency pays off. Collect coins daily."}
                        </p>
                    </div>

                    {/* Grid Area */}
                    {/* FIX MOBILE: grid-cols-5 di HP, 10 di Desktop agar kotak tidak terlalu gepeng */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar relative z-10">
                        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 sm:gap-4">
                            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => renderDay(day))}
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="anim-slide-up p-4 sm:p-6 border-t border-white/5 bg-background/40 flex flex-col sm:flex-row justify-end gap-3 z-10">
                        <Button variant="ghost" onClick={onClose} className="hover:bg-white/5 order-2 sm:order-1">Close</Button>
                        <Button 
                            onClick={handleClaim} 
                            disabled={!data?.canClaim || claiming}
                            size="lg"
                            className={cn(
                                "font-bold tracking-wide transition-all duration-300 order-1 sm:order-2 w-full sm:w-auto",
                                data?.canClaim 
                                    ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-[1.02] shadow-lg shadow-orange-500/20 text-white border-0 animate-pulse-slow" 
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            {claiming ? "Claiming..." : data?.canClaim ? "Claim Rewards" : "Come Back Tomorrow"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};