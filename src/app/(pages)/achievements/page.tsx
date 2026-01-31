/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Container from "@/components/container";
import { 
    IoArrowBack, IoLockClosed, IoCheckmarkCircle, IoStar, 
    IoTrophyOutline 
} from "react-icons/io5";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ACHIEVEMENTS_DATA, AchievementDef } from "@/lib/achievements-list"; // Import Master Data
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// Tipe Data untuk State
interface UserProgress {
    currentXp: number;
    level: number;
    nextLevelXp: number;
    unlockedMap: Record<string, string>; // ID -> Date String
}

export default function AchievementsPage() {
    const [progressData, setProgressData] = useState<UserProgress | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Real Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/achievements");
                if (res.ok) {
                    const data = await res.json();
                    setProgressData(data);
                }
            } catch (error) {
                console.error("Failed to fetch achievements");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 2. Kalkulasi Display Data
    // Gabungkan Master Data (Static) dengan User Data (Dynamic)
    const achievementsList = Object.values(ACHIEVEMENTS_DATA).map((master) => {
        const unlockedAtRaw = progressData?.unlockedMap?.[master.id];
        const isUnlocked = !!unlockedAtRaw;
        
        // Format Date cantik (misal: "2 Oct 2025")
        let formattedDate = "";
        if (unlockedAtRaw) {
            formattedDate = new Intl.DateTimeFormat('en-GB', { 
                day: 'numeric', month: 'short', year: 'numeric' 
            }).format(new Date(unlockedAtRaw));
        }

        return {
            ...master,
            isUnlocked,
            formattedDate
        };
    });

    // Kalkulasi Persentase Level
    // Note: Logika visual bar bisa disesuaikan.
    // Jika XP level 5 butuh 2000, dan user punya 1500.
    // Apakah bar mulai dari 0 atau dari XP level sebelumnya? 
    // Untuk V1, kita buat simple: (current / next) * 100
    const currentXp = progressData?.currentXp || 0;
    const nextLevelXp = progressData?.nextLevelXp || 1000;
    const progressPercent = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
                <AiOutlineLoading3Quarters className="animate-spin text-3xl" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground relative pt-28 pb-20 md:pt-28 md:pb-24 selection:bg-amber-500/30 font-sans overflow-x-hidden">
            
            {/* --- 1. CINEMATIC BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-gradient-to-b from-amber-500/10 via-transparent to-transparent blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 blur-[150px]" />
            </div>

            <Container className="relative z-10 max-w-6xl">
                
                {/* --- NAVIGATION --- */}
                <div className="flex justify-between items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Link href="/profile" className="group flex items-center gap-3 px-6 py-3 rounded-full bg-background/50 border border-neutral-200/60 dark:border-white/10 backdrop-blur-xl hover:bg-background hover:scale-105 transition-all duration-500 hover:shadow-lg dark:hover:shadow-white/5">
                        <IoArrowBack className="text-muted-foreground group-hover:-translate-x-1 group-hover:text-foreground transition-all" />
                        <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground group-hover:text-foreground uppercase">Profile</span>
                    </Link>
                    
                    <div className="flex items-center gap-3 px-5 py-2 rounded-full border border-neutral-200/50 dark:border-white/5 bg-background/30 backdrop-blur-sm">
                        <IoTrophyOutline className="text-amber-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest">Hall of Fame</span>
                    </div>
                </div>

                {/* --- HERO SECTION (LEVEL & XP) --- */}
                <div className="flex flex-col items-center text-center mb-20 animate-in slide-in-from-bottom-8 fade-in duration-1000">
                    <div className="mb-4 inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest shadow-sm">
                        Level {progressData?.level || 1}
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black tracking-tighter text-foreground mb-6">
                        Legacy
                    </h1>
                    
                    {/* XP Meter Monument */}
                    <div className="w-full max-w-xl relative group">
                        <div className="absolute inset-0 bg-amber-500/20 blur-[40px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                        
                        <div className="relative bg-card/50 backdrop-blur-2xl border border-neutral-200 dark:border-white/10 p-6 rounded-[2rem] shadow-2xl">
                            <div className="flex justify-between items-end mb-4 px-2">
                                <div className="text-left">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Total Experience</p>
                                    <p className="text-4xl font-heading font-black text-amber-500 tabular-nums leading-none">
                                        {currentXp} <span className="text-lg text-muted-foreground font-medium">/ {nextLevelXp}</span>
                                    </p>
                                </div>
                                <IoStar className="text-4xl text-amber-500/20 group-hover:text-amber-500 transition-colors duration-500 rotate-12" />
                            </div>
                            
                            <div className="h-3 w-full bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full relative transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_2s_infinite] skew-x-12" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- GRID ACHIEVEMENTS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievementsList.map((item, index) => (
                        <AchievementCard key={item.id} item={item} index={index} />
                    ))}
                </div>

            </Container>
        </main>
    );
}

// Komponen Card dipisah biar rapi
const AchievementCard = ({ item, index }: { item: AchievementDef & { isUnlocked: boolean; formattedDate: string }, index: number }) => {
    const isUnlocked = item.isUnlocked;
    const Icon = item.icon; // Icon component

    return (
        <div 
            className={cn(
                "relative overflow-hidden rounded-[2.5rem] p-8 min-h-[240px] flex flex-col justify-between transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards group",
                isUnlocked 
                    ? "bg-amber-50/50 dark:bg-[#110e05] border border-amber-200/50 dark:border-amber-900/30 hover:shadow-[0_20px_50px_-12px_rgba(245,158,11,0.2)] dark:hover:shadow-amber-500/10 hover:-translate-y-1" 
                    : "bg-neutral-100/50 dark:bg-white/5 border border-neutral-200 dark:border-white/5 opacity-80 hover:opacity-100 backdrop-blur-sm grayscale-[0.8] hover:grayscale-0"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Texture for Unlocked */}
            {isUnlocked && (
                <>
                    <div className="absolute inset-0 opacity-[0.4] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent blur-2xl rounded-full pointer-events-none" />
                </>
            )}

            <div className="relative z-10 flex justify-between items-start">
                {/* Icon Box */}
                <div className={cn(
                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                    isUnlocked 
                        ? "bg-gradient-to-br from-amber-100 to-white dark:from-amber-900/40 dark:to-amber-900/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20" 
                        : "bg-neutral-200 dark:bg-white/10 text-neutral-400 border border-neutral-300 dark:border-white/5"
                )}>
                    {isUnlocked ? <Icon /> : <IoLockClosed className="opacity-50" />}
                </div>

                {/* XP Badge */}
                <div className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-black font-mono tracking-wider border",
                    isUnlocked 
                        ? "bg-white/50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 backdrop-blur-sm" 
                        : "bg-neutral-200/50 dark:bg-white/5 text-neutral-500 border-neutral-300 dark:border-white/5"
                )}>
                    +{item.xp} XP
                </div>
            </div>

            <div className="mt-8 relative z-10">
                <h3 className={cn(
                    "text-2xl font-heading font-bold mb-2 transition-colors leading-tight",
                    isUnlocked ? "text-amber-950 dark:text-amber-50" : "text-muted-foreground"
                )}>
                    {item.title}
                </h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
                    {item.description}
                </p>
                
                {/* Status Footer */}
                <div className="mt-6 pt-4 border-t border-neutral-200/50 dark:border-white/5 flex items-center gap-2">
                    {isUnlocked ? (
                        <>
                            <IoCheckmarkCircle className="text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-600/70 dark:text-amber-400/60 uppercase tracking-widest">
                                Unlocked {item.formattedDate}
                            </span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                Locked
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}