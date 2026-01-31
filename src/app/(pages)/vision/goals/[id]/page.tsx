/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { visionApi } from "@/services/vision-service";
import { Goal, Milestone } from "@/generated/prisma/client";
import { IoArrowBack, IoAdd, IoCheckmarkCircle, IoEllipseOutline, IoTrashOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoPencil, IoListOutline, IoFlagOutline, IoRocketOutline } from "react-icons/io5";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { useGamificationStore } from "@/store/use-gamification";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useVisionStore } from "@/store/vision-store";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Container from "@/components/container";
import gsap from "gsap";
import Link from "next/link";
import { GoalCard } from "../../_components/goal-card";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PageProps {
    params: Promise<{ id: string }>;
}

// Extend Type Goal untuk include data relasi
type GoalWithRelations = Goal & {
    milestones: Milestone[];
    parentGoal?: { id: string; title: string; color: string } | null;
    subGoals?: Goal[];
};

export default function GoalDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();

    const [goal, setGoal] = useState<GoalWithRelations | null>(null);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [newMilestone, setNewMilestone] = useState("");
    const [loading, setLoading] = useState(true);

    const [isCreatingMilestone, setIsCreatingMilestone] = useState(false);
    const { updateGoalProgress } = useVisionStore();

    const [editingMsId, setEditingMsId] = useState<string | null>(null);
    const [editMsText, setEditMsText] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    const { processGamification } = useGamificationStore();
    const [isCompleting, setIsCompleting] = useState(false);

    // Fetch Detail Goal
    useEffect(() => {
        async function loadData() {
            const res = await fetch(`/api/vision/goals/${id}/details`);
            if (res.ok) {
                const data = await res.json();
                setGoal(data);
                setMilestones(data.milestones || []);
            }
            setLoading(false);
        }
        loadData();
    }, [id]);

    const applyProgressUpdate = (msList: Milestone[]) => {
        if (!goal) return;
        const total = msList.length;
        const done = msList.filter(m => m.isCompleted).length;
        const newPercent = total === 0 ? 0 : Math.round((done / total) * 100);

        setGoal({ ...goal, progress: newPercent });
        updateGoalProgress(goal.id, newPercent);
    };

    // Animasi Masuk
    useEffect(() => {
        if (!loading && goal && containerRef.current && !hasAnimated.current) {
            const ctx = gsap.context(() => {
                gsap.fromTo(".anim-item",
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power3.out" }
                );
            }, containerRef);
            hasAnimated.current = true;
            return () => ctx.revert();
        }
    }, [loading, goal]);

    // --- MILESTONE HANDLERS (SAMA) ---
    const handleAddMilestone = async () => {
        if (!newMilestone.trim() || !goal) return;
        setIsCreatingMilestone(true);
        try {
            const realMilestone = await visionApi.createMilestone(goal.id, newMilestone);
            const newMsList = [...milestones, realMilestone];
            setMilestones(newMsList);
            setNewMilestone("");
            applyProgressUpdate(newMsList);
            toast.success("Milestone Added!");
        } catch (e) {
            toast.error("Failed to add milestone");
        } finally {
            setIsCreatingMilestone(false);
        }
    };

    const handleToggle = async (milestone: Milestone) => {
        const previousMilestones = [...milestones];
        const previousGoalProgress = goal?.progress || 0;
        const newStatus = !milestone.isCompleted;
        const newMsList = milestones.map(m => m.id === milestone.id ? { ...m, isCompleted: newStatus } : m);

        setMilestones(newMsList);
        applyProgressUpdate(newMsList);

        try {
            await visionApi.toggleMilestone(milestone.id, newStatus);
        } catch (error) {
            setMilestones(previousMilestones);
            if (goal) {
                setGoal({ ...goal, progress: previousGoalProgress });
                updateGoalProgress(goal.id, previousGoalProgress);
            }
            toast.error("Sync failed");
        }
    };

    const handleDelete = async (mId: string) => {
        const previousMilestones = [...milestones];
        const previousGoalProgress = goal?.progress || 0;
        const newMsList = milestones.filter(m => m.id !== mId);
        setMilestones(newMsList);
        applyProgressUpdate(newMsList);

        try {
            if (goal) await visionApi.deleteMilestone(mId, goal.id);
            toast.success("Milestone Deleted");
        } catch (error) {
            setMilestones(previousMilestones);
            if (goal) {
                setGoal({ ...goal, progress: previousGoalProgress });
                updateGoalProgress(goal.id, previousGoalProgress);
            }
            toast.error("Failed to Delete Milestone");
        }
    };

    const handleSaveEditMs = async (id: string) => {
        if (!editMsText.trim()) return;
        const oldMilestones = [...milestones];
        const updatedList = milestones.map(m => m.id === id ? { ...m, title: editMsText } : m);
        setMilestones(updatedList);
        setEditingMsId(null);
        try {
            await visionApi.updateMilestone(id, { title: editMsText });
            toast.success("Updated");
        } catch (e) {
            setMilestones(oldMilestones);
            toast.error("Error updating");
        }
    };

    const handleCompleteGoal = async () => {
        if (!goal) return;
        setIsCompleting(true);
        try {
            const res = await fetch(`/api/vision/goals/${goal.id}/complete`, { method: "POST" });
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            processGamification(data);
            setGoal({ ...goal, status: "COMPLETED", completedAt: new Date() });
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsCompleting(false);
        }
    };

    if (loading) return (/* ... Loading UI SAMA ... */ 
       <div className="min-h-screen flex items-center justify-center bg-background">
           <div className="flex flex-col items-center gap-4 text-muted-foreground">
               <div className="relative">
                   <div className="h-12 w-12 rounded-full border-4 border-muted/30"></div>
                   <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
               </div>
               <span className="text-xs font-mono font-medium tracking-widest uppercase animate-pulse">Loading Blueprint...</span>
           </div>
       </div>
    );

    if (!goal) return (/* ... Not Found UI SAMA ... */ 
       <div className="min-h-screen flex items-center justify-center bg-background pt-36">
           <div className="text-center space-y-2">
               <p className="text-xl font-bold text-muted-foreground">Goal not found.</p>
               <button onClick={() => router.back()} className="text-sm text-primary hover:underline">Back to Board</button>
           </div>
       </div>
    );

    const isGoalReadyToComplete = goal.progress === 100 && goal.status !== "COMPLETED";
    const isGoalCompleted = goal.status === "COMPLETED";
    // [NEW] Cek Tipe
    const isLongTerm = (goal as any).type === "LONG";

    return (
        <main className="min-h-screen bg-background text-foreground pt-28 pb-20 md:pt-32 md:pb-24 px-4 sm:px-6" ref={containerRef}>
            <Container className="max-w-3xl">

                <div className="w-full flex justify-between">
                    <button
                        onClick={() => router.back()}
                        className="anim-item flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors cursor-pointer group w-fit"
                    >
                        <IoArrowBack className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Board
                    </button>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                        {isGoalReadyToComplete && !isLongTerm && (
                            <div className="flex flex-col items-end animate-in fade-in slide-in-from-right-4 duration-500">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button className="cursor-pointer bg-transparent border border-emerald-600 hover:bg-emerald-600 text-black hover:text-white dark:text-white px-4 py-1 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-95 flex items-center gap-2">
                                            {isCompleting ? <AiOutlineLoading3Quarters className="animate-spin" /> : <IoCheckmarkCircle className="hidden xs:block" />}
                                            Complete Goal
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Complete this Goal?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will mark the goal as finished and grant you XP & Gold reward.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="cursor-pointer">Not yet</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleCompleteGoal} className="bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer">
                                                Yes, Complete it!
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- HERO SECTION (Goal Card) --- */}
                <div
                    className="anim-item relative overflow-hidden rounded-[2rem] border bg-card p-8 mb-10 transition-all shadow-sm"
                    style={{
                        borderColor: `${goal.color}40`,
                        background: `linear-gradient(to bottom right, ${goal.color}08, var(--card))`
                    }}
                >
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ backgroundColor: goal.color }} />

                    <div className="relative z-10 flex flex-col gap-6">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                {/* [NEW] Breadcrumb untuk Parent Goal */}
                                {goal.parentGoal && (
                                    <Link href={`/vision/goals/${goal.parentGoal.id}`} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 hover:text-primary transition-colors">
                                        <IoFlagOutline /> {goal.parentGoal.title}
                                    </Link>
                                )}
                                
                                <div className="flex gap-2 mb-3">
                                    {isGoalCompleted ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-500 backdrop-blur-sm shadow-sm">
                                            <IoCheckmarkDoneCircle size={14} /> Mission Accomplished
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-background/50 border border-border/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground backdrop-blur-sm shadow-sm">
                                            {isLongTerm ? <IoFlagOutline /> : <IoRocketOutline />} {isLongTerm ? "Long-term Vision" : "Short-term Goal"}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground leading-tight tracking-tight break-words">
                                    {goal.title}
                                </h1>
                            </div>

                            <span className="text-5xl font-mono font-bold tracking-tighter drop-shadow-sm" style={{ color: goal.color }}>
                                {goal.progress}%
                            </span>
                        </div>

                        {/* Progress Bar (Jika Long Term, ini optional/manual slider nanti, utk V1 kita hide atau show 0%) */}
                        <div className="w-full bg-muted/50 h-3 rounded-full overflow-hidden border border-border/10">
                            <div
                                className="h-full transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] relative"
                                style={{
                                    width: `${goal.progress}%`,
                                    backgroundColor: isGoalCompleted ? '#10b981' : goal.color
                                }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CONTENT SECTION: BRANCHING LOGIC --- */}
                {isLongTerm ? (
                    // [CASE 1] LONG TERM GOAL -> Show Sub Goals
                    <div className="anim-item space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                <IoRocketOutline className="text-muted-foreground" />
                                Child Goals
                            </h3>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                {goal.subGoals?.length || 0} Missions
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {goal.subGoals && goal.subGoals.length > 0 ? (
                                goal.subGoals.map(subGoal => (
                                    <GoalCard 
                                        key={subGoal.id} 
                                        goal={subGoal} 
                                        // Disable delete/update from here for simplicity in V1 or pass handlers
                                        onDelete={() => {}} 
                                        onUpdate={() => {}} 
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center border-2 border-dashed border-border/40 rounded-2xl bg-muted/5">
                                    <p className="text-muted-foreground text-sm font-medium">No child goals yet.</p>
                                    <p className="text-xs text-muted-foreground/50 mt-1">Create a &quot;Short-term&quot; goal and link it here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // [CASE 2] SHORT TERM GOAL -> Show Milestones (Existing UI)
                    <div className="anim-item space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                <IoListOutline className="text-muted-foreground" />
                                Roadmap
                            </h3>
                            <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border">
                                {milestones.filter(m => m.isCompleted).length}/{milestones.length} Done
                            </span>
                        </div>

                        <div className="flex mb-8 bg-card border border-border p-2 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
                            <input
                                value={newMilestone}
                                disabled={isCreatingMilestone}
                                onChange={e => setNewMilestone(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && !isCreatingMilestone && handleAddMilestone()}
                                placeholder="What's the next step?"
                                className="flex-1 bg-transparent px-2 xs:px-3 py-2.5 outline-none text-foreground placeholder:text-muted-foreground/60 disabled:opacity-50 text-base"
                            />
                            <button
                                onClick={handleAddMilestone}
                                disabled={isCreatingMilestone}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 p-3 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[48px] shadow-sm active:scale-95"
                            >
                                {isCreatingMilestone ? <AiOutlineLoading3Quarters className="animate-spin" size={20} /> : <IoAdd size={24} />}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {milestones.map((ms) => (
                                <div key={ms.id} className={cn("group flex items-start gap-3 p-4 sm:p-5 rounded-2xl border transition-all duration-200", ms.isCompleted ? "bg-muted/10 border-transparent opacity-60 hover:opacity-100" : "bg-card border-border hover:border-primary/20 hover:shadow-sm")}>
                                    {editingMsId === ms.id ? (
                                        <div className="flex-1 flex gap-2 items-center animate-in fade-in zoom-in-95 w-full">
                                            <input value={editMsText} onChange={(e) => setEditMsText(e.target.value)} className="flex-1 bg-background border border-input rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" autoFocus onKeyDown={(e) => e.key === "Enter" && handleSaveEditMs(ms.id)} />
                                            <div className="flex gap-1 shrink-0">
                                                <button onClick={() => handleSaveEditMs(ms.id)} className="text-emerald-500 hover:bg-emerald-500/10 p-2 rounded-lg cursor-pointer transition-colors"><IoCheckmarkCircleOutline size={22} /></button>
                                                <button onClick={() => setEditingMsId(null)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg cursor-pointer transition-colors"><IoCloseCircleOutline size={22} /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div onClick={() => handleToggle(ms)} className="mt-0.5 cursor-pointer shrink-0 text-2xl transition-transform active:scale-90">
                                                {ms.isCompleted ? <IoCheckmarkCircle className="text-emerald-500 drop-shadow-sm" /> : <IoEllipseOutline className="text-muted-foreground/40 group-hover:text-primary transition-colors" />}
                                            </div>
                                            <div onClick={() => handleToggle(ms)} className="flex-1 min-w-0 cursor-pointer pt-1">
                                                <span className={cn("block text-base leading-relaxed break-words whitespace-pre-wrap font-medium transition-all", ms.isCompleted ? "line-through text-muted-foreground decoration-border/50" : "text-foreground")}>{ms.title}</span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                                                <button onClick={() => { setEditingMsId(ms.id); setEditMsText(ms.title); }} className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-lg cursor-pointer transition-colors" title="Edit"><IoPencil size={16} /></button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg cursor-pointer transition-colors" title="Delete"><IoTrashOutline size={16} /></button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Milestone?</AlertDialogTitle>
                                                            <AlertDialogDescription>Remove &quot;{ms.title}&quot;?</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(ms.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer">Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            {milestones.length === 0 && (
                                <div className="text-center py-16 border-2 border-dashed border-border/40 rounded-2xl bg-muted/5">
                                    <p className="text-muted-foreground text-sm font-medium">No steps defined yet.</p>
                                    <p className="text-xs text-muted-foreground/50 mt-1">Break down your big goal into small wins.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Container>
        </main>
    );
}