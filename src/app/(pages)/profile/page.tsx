"use client";

import { BackupSettings } from "@/components/backup-settings";
import Container from "@/components/container";
import { AvatarFrame } from "@/components/ui/avatar-frame";
import { calculateExpForNextLevel, MAX_LEVEL } from "@/lib/game-mechanics";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
    IoCheckmark,
    IoDiscOutline, IoInfinite,
    IoListOutline,
    IoSparkles,
    IoStar,
    IoTimeOutline,
    IoTrophyOutline
} from "react-icons/io5";
import { toast } from "sonner";

interface UserProfile {
    id: string;
    name: string;
    imageUrl: string;
    activeAvatar: string;
    activeFrame: string;
    level: number;
    experience: number;
    stats: {
        achievements: number;
        todos: number;
        goals: number;
        pomodoro: number;
    };
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    setEditName(data.name || "Dreamer");
                }
            } catch (error) {
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        if (!editName.trim()) return toast.error("Name cannot be empty");
        setSaving(true);
        try {
            const res = await fetch("/api/profile", { method: "PATCH", body: JSON.stringify({ name: editName }) });
            if (res.ok) {
                setUser((prev) => prev ? { ...prev, name: editName } : null);
                setIsEditing(false);
                toast.success("Identity updated");
            }
        } catch (error) { toast.error("Update failed"); } finally { setSaving(false); }
    };

    if (loading) return (<div className="min-h-screen flex items-center justify-center bg-background"><AiOutlineLoading3Quarters className="animate-spin text-2xl text-muted-foreground/50" /></div>);
    if (!user) return null;

    const currentLevel = user.level || 1;
    const currentExp = user.experience || 0;
    const maxExp = calculateExpForNextLevel(currentLevel);
    const expPercentage = currentLevel >= MAX_LEVEL ? 100 : Math.min((currentExp / maxExp) * 100, 100);
    const stats = user.stats || { achievements: 0, todos: 0, goals: 0, pomodoro: 0 };

    // [LOGIC PENTING] Prioritaskan Avatar Shop, fallback ke Foto Asli (imageUrl), fallback ke default
    const displayImage = user.activeAvatar ? user.activeAvatar : user.imageUrl || "/assets/images/avatars/default.jpg";
    const activeFrame = user.activeFrame || "none";

    return (
        <main className="min-h-screen bg-background text-foreground pt-28 pb-20 md:pt-28 md:pb-24 relative selection:bg-amber-500/30 font-sans overflow-x-hidden">

            {/* ... BACKGROUND (Tetap Sama) ... */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[100vw] h-[60vh] bg-gradient-to-b from-primary/5 via-transparent to-transparent blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            </div>

            <Container className="relative z-10 pt-8 pb-24 max-w-5xl">


                <div className="flex flex-col items-center text-center mb-24 relative">

                    {/* --- AVATAR & FRAME SECTION --- */}
                    <div className="relative mb-10 group cursor-pointer animate-in zoom-in-50 duration-700 delay-100">

                        {/* 1. Background Glow Effect */}
                        {/* <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700" /> */}

                        {(!user.activeFrame || user.activeFrame === 'none') && (
                            <>
                                <div className="absolute inset-[-30px] border border-dashed border-primary/20 dark:border-white/10 rounded-full animate-[spin_60s_linear_infinite]" />
                                <div className="absolute inset-[-15px] border border-primary/30 dark:border-white/20 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
                            </>
                        )}

                        {/* 2. Animated Rings (Hanya muncul kalau TIDAK ADA frame) */}
                        <AvatarFrame
                            src={displayImage}
                            alt={user.name}
                            frameAsset={activeFrame}
                            sizeClass="w-48 h-48 md:w-56 md:h-56"
                            className="shadow-2xl"
                        />

                        {/* Level Pill */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-900 text-foreground px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] border border-neutral-200 dark:border-neutral-800 z-20 flex items-center gap-2 whitespace-nowrap hover:scale-105 transition-transform">
                            <IoSparkles className="text-amber-500" />
                            Level {currentLevel}
                        </div>
                    </div>


                    <div className="w-full max-w-2xl animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200">
                        {isEditing ? (
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="bg-transparent border-b-2 border-primary text-4xl md:text-6xl font-heading font-black text-center w-full max-w-md outline-none py-2"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                />
                                <button onClick={handleSave} disabled={saving} className="p-4 rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform shadow-lg">
                                    {saving ? <AiOutlineLoading3Quarters className="animate-spin" /> : <IoCheckmark size={24} />}
                                </button>
                            </div>
                        ) : (
                            <div className="group/name flex flex-col items-center cursor-pointer" onClick={() => setIsEditing(true)}>
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black tracking-tighter text-foreground mb-2 group-hover/name:text-primary/80 transition-colors duration-500">
                                    {user.name}
                                </h1>
                                <div className="flex items-center gap-2 text-sm font-bold tracking-[0.4em] text-muted-foreground uppercase opacity-60 group-hover/name:opacity-100 transition-opacity">
                                    <span className="w-8 h-[1px] bg-foreground/30"></span>
                                    Edit Profile
                                    <span className="w-8 h-[1px] bg-foreground/30"></span>
                                </div>
                            </div>
                        )}

                        <div className="mt-12 flex flex-col items-center gap-3">
                            <div className="w-full max-w-md h-1.5 bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-foreground rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${expPercentage}%` }}
                                />
                            </div>
                            <p className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest">
                                {currentLevel >= MAX_LEVEL ? "Max Level Reached" : `${Math.floor(maxExp - currentExp)} XP to Level ${currentLevel + 1}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- 2. THE DECK (Stats Cards) --- */}
                {/* ... (Bagian Grid Stats kamu tetap sama, tidak perlu diubah) ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 auto-rows-[240px]">
                    <Link href="/achievements" className="lg:col-span-8 group relative overflow-hidden rounded-[2.5rem] bg-amber-50 dark:bg-[#110e05] border border-amber-200/50 dark:border-amber-900/30 p-10 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(245,158,11,0.2)] dark:hover:shadow-amber-500/10 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-8 delay-300">
                        <div className="absolute inset-0 opacity-[0.3] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
                        <div className="relative z-10 flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest border border-amber-500/20 px-3 py-1 rounded-full w-fit bg-amber-500/10 backdrop-blur-md">Legacy</span>
                                <h3 className="text-3xl font-heading font-bold text-amber-950 dark:text-amber-50 mt-2">Achievements</h3>
                            </div>
                            <IoStar className="text-5xl text-amber-500/20 group-hover:text-amber-500 group-hover:rotate-12 transition-all duration-500" />
                        </div>
                        <div className="relative z-10 flex items-baseline gap-2">
                            <span className="text-8xl font-heading font-black text-amber-900 dark:text-amber-100 tracking-tighter leading-none group-hover:scale-105 transition-transform duration-500 origin-left">{stats.achievements}</span>
                            <span className="text-sm font-bold text-amber-700/60 dark:text-amber-300/50 uppercase tracking-widest pb-3">Unlocked</span>
                        </div>
                    </Link>
                    {/* ... (Sisanya card Pomodoro, Goals, Tasks copy dari file lama) ... */}
                    <div className="lg:col-span-4 group relative overflow-hidden rounded-[2.5rem] bg-card/50 backdrop-blur-xl border border-neutral-200 dark:border-white/10 p-8 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-8 delay-400">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                                <IoTimeOutline size={24} />
                            </div>
                            <IoInfinite className="text-neutral-200 dark:text-white/5 text-4xl group-hover:text-rose-200 dark:group-hover:text-rose-500/20 transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-6xl font-heading font-black text-foreground tracking-tighter tabular-nums mb-1">{stats.pomodoro}</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Focus Sessions</p>
                        </div>
                    </div>
                    {/* ... Goals & Tasks ... */}
                    <div className="md:col-span-6 group relative overflow-hidden rounded-[2.5rem] bg-card/50 backdrop-blur-xl border border-neutral-200 dark:border-white/10 p-8 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-8 delay-500">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                <IoTrophyOutline size={24} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-6xl font-heading font-black text-foreground tracking-tighter tabular-nums mb-1">{stats.goals}</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Goals Crushed</p>
                        </div>
                    </div>
                    <div className="md:col-span-6 group relative overflow-hidden rounded-[2.5rem] bg-card/50 backdrop-blur-xl border border-neutral-200 dark:border-white/10 p-8 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-8 delay-600">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                <IoListOutline size={24} />
                            </div>
                            <IoDiscOutline className="text-neutral-200 dark:text-white/5 text-4xl group-hover:text-blue-200 dark:group-hover:text-blue-500/20 transition-colors animate-spin-slow" />
                        </div>
                        <div>
                            <h3 className="text-6xl font-heading font-black text-foreground tracking-tighter tabular-nums mb-1">{stats.todos}</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tasks Completed</p>
                        </div>
                    </div>
                </div>


                <div className="py-12 w-full flex justify-center items-center z-50">
                    <BackupSettings />
                </div>

            </Container>
        </main>
    );
}