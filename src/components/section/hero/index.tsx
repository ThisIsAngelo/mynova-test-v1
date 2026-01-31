/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import Link from "next/link"
import gsap from "gsap"
import { useLayoutEffect, useRef, useState, useEffect } from "react"
import { Goal, Tip, Wishlist } from "@/generated/prisma/client"
import { getYouTubeId } from "@/lib/youtube"
import { IoArrowForward, IoPlay, IoSparkles, IoTrendingUp, IoCalendarClearOutline, IoHeart, IoTimeOutline, IoGiftOutline } from "react-icons/io5"
import { IoMdQuote } from "react-icons/io"
import Container from "@/components/container"
import { cn } from "@/lib/utils"
import { DailyRewardModal } from "@/components/modal/daily-reward-modal"

interface HeroProps {
    userParams: { name: string | null };
    wishlist?: Wishlist;
    tip?: Tip;
    goal?: Goal;
}

const getGreeting = (name: string) => {
    const hour = new Date().getHours();
    const greetings = {
        morning: [`Rise and shine, ${name}.`, `Let's make magic, ${name}.`],
        afternoon: [`Keep the flow, ${name}.`, `Stay locked in, ${name}.`],
        evening: [`Wind down, ${name}.`, `Reflect & recharge, ${name}.`]
    };
    const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const options = greetings[period];
    return options[Math.floor(Math.random() * options.length)];
}

const Hero = ({ userParams, wishlist, tip, goal }: HeroProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const youtubeId = wishlist ? getYouTubeId(wishlist.url) : null

    const [time, setTime] = useState<string>("")
    const [date, setDate] = useState<string>("")
    const [greeting, setGreeting] = useState<string>("")

    const [showRewardModal, setShowRewardModal] = useState(false);

    useEffect(() => {
        setGreeting(getGreeting(userParams.name || "Creator"));
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
            setDate(now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }));
        }
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [userParams.name]);

    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

            tl.fromTo(".hero-anim-item",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, delay: 0.2 }
            );

            tl.fromTo(".hero-card",
                { scale: 0.96, y: 40, opacity: 0, filter: "blur(10px)" },
                { scale: 1, y: 0, opacity: 1, filter: "blur(0px)", duration: 1.5, stagger: 0.15 },
                "-=1.0"
            );
        }, containerRef)
        return () => ctx.revert();
    }, [])


    // Auto Open Modal Logic (Check sekali saat load)
    useEffect(() => {
        const checkReward = async () => {
            try {
                const res = await fetch("/api/daily-reward/claim"); // GET method
                const data = await res.json();
                // Jika bisa claim, munculkan popup otomatis
                if (data.canClaim) {
                    // Kasih delay dikit biar nggak kaget pas load page
                    setTimeout(() => setShowRewardModal(true), 1500);
                }
            } catch (e) { console.error(e); }
        };
        checkReward();
    }, []);

    // --- STYLE HELPERS ---
    const cardBaseClass = "relative group rounded-3xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-foreground/50";
    const iconBoxClass = "p-2 rounded-xl bg-primary/10 text-primary flex items-center justify-center";

    return (
        <section
            ref={containerRef}
            className='min-h-dvh w-full bg-background text-foreground relative overflow-hidden flex flex-col'
        >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

            <DailyRewardModal isOpen={showRewardModal} onClose={() => setShowRewardModal(false)} />

            {/* Adjusted padding for mobile/desktop to fit navbar */}
            <div className="flex-1 flex items-center pt-28 pb-12 md:pt-40 md:pb-24">
                <Container>
                    <div className="w-full flex flex-col gap-8 md:gap-12 justify-center">

                        {/* === 1. HEADER SECTION === */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-8 gap-6 md:gap-8">
                            <div className="space-y-4 max-w-4xl w-full">
                                {/* Status Pill */}
                               <div className="flex items-center gap-4">
                                 <div className="hero-anim-item inline-flex items-center gap-2.5 px-3 py-1 rounded-full border border-border bg-secondary/30 text-[10px] font-mono text-muted-foreground uppercase tracking-widest w-fit">
                                     <span className="relative flex h-2 w-2">
                                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                         <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                     </span>
                                     All Systems Go
                                 </div>
                                
                                 <button
                                     onClick={() => setShowRewardModal(true)}
                                     className="hero-anim-item inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-widest hover:bg-amber-500/20 transition-colors cursor-pointer"
                                 >
                                     <IoGiftOutline className="text-sm" />
                                     Daily Reward
                                 </button>
                               </div>

                                {/* Greeting - Responsive Text Size */}
                                <h1 className="hero-anim-item text-4xl sm:text-5xl md:text-7xl font-heading font-bold tracking-tight leading-[1.1] md:leading-[1.05]">
                                    <span className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                                        {greeting}
                                    </span>
                                </h1>
                            </div>

                            {/* Time & Date - Hidden on very small screens if needed, or styled smaller */}
                            <div className="hero-anim-item flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto text-right border-t md:border-t-0 border-border pt-4 md:pt-0">
                                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest mb-0 md:mb-1">
                                    <IoCalendarClearOutline />
                                    {date}
                                </div>
                                <div className="text-3xl md:text-6xl font-mono font-medium tracking-tighter text-foreground/90">
                                    {time}
                                </div>
                            </div>
                        </div>

                        {/* === 2. BENTO GRID === */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">

                            {/* --- A. WISHLIST CARD --- */}
                            {/* FIX MOBILE: min-h-[350px] agar gambar tetap punya tempat di mobile */}
                            <div className={cn(cardBaseClass, "hero-card lg:col-span-2 min-h-[350px] lg:min-h-0")}>
                                {wishlist ? (
                                    <Link href="/wishlist" className="block w-full h-full relative">

                                        {/* Media Layer - Absolute Inset */}
                                        <div className="absolute inset-0 bg-muted">
                                            {youtubeId ? (
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&modestbranding=1&showinfo=0&rel=0`}
                                                    title={wishlist.title}
                                                    className="w-full h-full object-cover pointer-events-none opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s]"
                                                    allow="autoplay; encrypted-media"
                                                />
                                            ) : (
                                                <img
                                                    src={wishlist.url}
                                                    alt={wishlist.title}
                                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s]"
                                                />
                                            )}
                                        </div>

                                        {/* Glass Panel Info - Responsive Positioning */}
                                        <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 z-20">
                                            <div className="bg-background/85 dark:bg-card/75 backdrop-blur-xl border border-border/50 p-4 md:p-5 rounded-2xl shadow-lg flex items-center justify-between gap-4 transition-transform duration-500 group-hover:-translate-y-1">
                                                <div className="space-y-1 min-w-0">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                        <div className={cn(iconBoxClass, "w-6 h-6 p-1 bg-transparent")}>
                                                            <IoHeart className="text-red-500 animate-pulse w-full h-full" />
                                                        </div>
                                                        Current Obsession
                                                    </div>
                                                    <h2 className="text-lg md:text-xl font-bold text-foreground truncate pl-1">
                                                        {wishlist.title}
                                                    </h2>
                                                </div>

                                                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 shadow-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                    <IoArrowForward className="-rotate-45 group-hover:rotate-0 transition-transform duration-300 text-sm md:text-base" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Play Indicator */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-background/20 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                                                <IoPlay className="text-white text-xl md:text-2xl ml-1" />
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-muted/10">
                                        <div className={cn(iconBoxClass, "w-12 h-12 mb-4 bg-muted text-muted-foreground")}>
                                            <IoSparkles size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground">Dream Board Empty</h3>
                                        <Link href="/wishlist" className="mt-2 text-sm text-primary font-medium hover:underline underline-offset-4">Start visualizing +</Link>
                                    </div>
                                )}
                            </div>

                            {/* --- B. SIDEBAR --- */}
                            <div className="lg:col-span-1 flex flex-col gap-6 h-full">

                                {/* B1. GOAL WIDGET */}
                                <div className={cn(cardBaseClass, "hero-card flex-1 min-h-[180px] p-5 md:p-6 flex flex-col justify-between")}>
                                    {goal ? (
                                        <Link href={`/vision/goals/${goal.id}`} className="block h-full w-full relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={iconBoxClass}>
                                                        <IoTrendingUp />
                                                    </div>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</span>
                                                </div>
                                                <IoArrowForward className="-rotate-45 group-hover:rotate-0 transition-transform duration-300 text-muted-foreground group-hover:text-primary" />
                                            </div>

                                            <div className="mt-auto space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <h3 className="text-lg font-bold text-card-foreground line-clamp-1">{goal.title}</h3>
                                                    <span className="text-3xl font-mono font-bold text-foreground">
                                                        {goal.progress}%
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full transition-all duration-1000 ease-out relative"
                                                        style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-center">
                                            <p className="text-muted-foreground text-sm font-medium">No Priority Set</p>
                                            <Link href="/vision" className="mt-1 text-primary text-sm hover:underline">Pick a goal +</Link>
                                        </div>
                                    )}
                                </div>

                                {/* B2. TIPS WIDGET */}
                                <div className={cn(cardBaseClass, "hero-card flex-[1.4] min-h-[220px] bg-gradient-to-br from-card to-muted/30 p-5 md:p-6 flex flex-col")}>

                                    <IoMdQuote className="absolute -bottom-4 -right-4 text-7xl md:text-8xl text-foreground/5 rotate-12 pointer-events-none group-hover:text-primary/10 transition-colors duration-500" />

                                    <div className="flex items-center gap-3 mb-4 relative z-10">
                                        <div className={iconBoxClass}>
                                            <IoSparkles />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Spark of the Day</span>
                                    </div>

                                    {tip ? (
                                        <div className="flex-1 overflow-hidden relative z-10">
                                            <div className="h-full overflow-y-auto pr-2 theme-scrollbar">
                                                <p className="font-serif text-lg md:text-xl text-foreground/90 leading-relaxed italic">
                                                    &ldquo;{tip.content}&rdquo;
                                                </p>
                                                {tip.source && (
                                                    <div className="mt-4 md:mt-6 flex items-center gap-3">
                                                        <div className="h-[1px] w-6 bg-border"></div>
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono font-bold">
                                                            {tip.source}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="h-8"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center relative z-10">
                                            <Link href="/tips" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                                                <IoSparkles /> Add some wisdom
                                            </Link>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                    </div>
                </Container>
            </div>
        </section>
    )
}

export default Hero