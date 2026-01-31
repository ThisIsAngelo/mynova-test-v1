/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useLayoutEffect, useRef, useEffect } from "react";
import { Goal, Idea } from "@/generated/prisma/client";
import { GoalCard } from "./goal-card";
import { IdeaCard } from "./idea-card";
import { visionApi } from "@/services/vision-service";
import { toast } from "sonner";
import { IoAdd, IoBulbOutline, IoRocketOutline, IoClose, IoGridOutline, IoFlagOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import gsap from "gsap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVisionStore } from "@/store/vision-store";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Pastikan install shadcn select

interface VisionBoardProps {
    initialGoals: Goal[];
    initialIdeas: Idea[];
}

export const VisionBoard = ({ initialGoals, initialIdeas }: VisionBoardProps) => {
    const { goals, setGoals } = useVisionStore();
    const [ideas, setIdeas] = useState(initialIdeas);
    
    // UI States
    const [isInputMode, setIsInputMode] = useState<"GOAL" | "IDEA" | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [inputText, setInputText] = useState("");
    const [selectedColor, setSelectedColor] = useState("#22c55e");
    
    // [NEW] Goal Logic States
    const [goalType, setGoalType] = useState<"SHORT" | "LONG">("SHORT");
    const [parentGoalId, setParentGoalId] = useState<string | undefined>(undefined);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (goals.length === 0) setGoals(initialGoals);
    }, [initialGoals, setGoals, goals.length]);

    // Filter Long-term goals untuk dijadikan opsi Parent
    const longTermGoals = goals.filter((g: any) => g.type === "LONG");

    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".vision-item",
                { y: 20, opacity: 0, scale: 0.98 },
                { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.2)" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleCreate = async () => {
        if (!inputText.trim()) return;
        setIsCreating(true);
        try {
            if (isInputMode === "GOAL") {
                const newGoal = await visionApi.createGoal(
                    inputText, 
                    selectedColor, 
                    goalType, 
                    (goalType === "SHORT" && parentGoalId) ? parentGoalId : undefined
                );
                setGoals([newGoal, ...goals]);
                toast.success("New Goal Set!");
            } else {
                const newIdea = await visionApi.createIdea(inputText);
                setIdeas([newIdea, ...ideas]);
                toast.success("Idea Captured!");
            }

            // Reset Form
            setInputText("");
            setIsInputMode(null);
            setGoalType("SHORT");
            setParentGoalId(undefined);
        } catch (error) {
            toast.error("Failed to create");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string, type: "GOAL" | "IDEA") => {
        const prevGoals = [...goals];
        const prevIdeas = [...ideas];
        console.log(type)

        if (type === "GOAL") {
            setGoals(goals.filter(g => g.id !== id));
            try { await visionApi.deleteGoal(id); toast.success("Goal Deleted"); }
            catch { setGoals(prevGoals); toast.error("Failed Delete Goal"); }
        } else {
            setIdeas(prev => prev.filter(i => i.id !== id));
            try { await visionApi.deleteIdea(id); toast.success("Idea Deleted"); }
            catch { setIdeas(prevIdeas); toast.error("Failed Delete Idea"); }
        }
    };
    
    const handleUpdateGoalTitle = async (id: string, title: string) => {
       const oldGoals = [...goals];
       setGoals(goals.map(g => g.id === id ? { ...g, title } : g));
       try {
           await visionApi.updateGoal(id, title);
           toast.success("Goal Updated");
       } catch (e) {
           setGoals(oldGoals);
           toast.error("Failed Update Goal");
       }
   };

   const handleUpdateIdeaContent = async (id: string, content: string) => {
       const oldIdeas = [...ideas];
       setIdeas(ideas.map(i => i.id === id ? { ...i, content } : i));
       try {
           await visionApi.updateIdea(id, content);
           toast.success("Idea Updated");
       } catch (e) {
           setIdeas(oldIdeas);
           toast.error("Failed Update Idea");
       }
   };

    const colors = ["#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#eab308", "#f97316"];

    return (
        <div className="w-full space-y-8" ref={containerRef}>
            
            {/* --- INPUT SECTION --- */}
            <div className="vision-item flex justify-center sm:justify-start">
                {isInputMode ? (
                    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-card border border-border p-4 rounded-3xl shadow-xl flex flex-col gap-4">
                            
                            {isInputMode === "GOAL" && (
                                <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-border/50">
                                    <div className="flex bg-muted/50 p-1 rounded-lg">
                                        <button
                                            onClick={() => setGoalType("SHORT")}
                                            className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-all", goalType === "SHORT" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
                                        >
                                            Short-term
                                        </button>
                                        <button
                                            onClick={() => setGoalType("LONG")}
                                            className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-all", goalType === "LONG" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
                                        >
                                            Long-term
                                        </button>
                                    </div>

                                    {/* Parent Selector (Only if Short-term) */}
                                    {goalType === "SHORT" && (
                                        <Select value={parentGoalId} onValueChange={setParentGoalId}>
                                            <SelectTrigger className="h-8 w-[180px] text-xs bg-muted/30 border-0">
                                                <SelectValue placeholder="Select Parent Goal (Optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Parent (Standalone)</SelectItem>
                                                {longTermGoals.map((g: any) => (
                                                    <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 items-center">
                                <div className="flex-1 flex gap-3 items-center bg-muted/30 rounded-xl px-4 border border-border/50">
                                    {isInputMode === "GOAL" 
                                        ? (goalType === "LONG" ? <IoFlagOutline className="text-primary text-xl" /> : <IoRocketOutline className="text-primary text-xl" />)
                                        : <IoBulbOutline className="text-primary text-xl" />
                                    }
                                    <input
                                        autoFocus
                                        disabled={isCreating}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder={
                                            isInputMode === "GOAL" 
                                                ? (goalType === "LONG" ? "What is your grand vision?" : "What is the next milestone?")
                                                : "Capture your brilliant idea..."
                                        }
                                        className="flex-1 bg-transparent py-4 text-lg outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
                                        onKeyDown={(e) => e.key === "Enter" && !isCreating && handleCreate()}
                                    />
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-2">
                                    {/* Color Picker (Goal Only) */}
                                    {isInputMode === "GOAL" && (
                                        <div className="hidden sm:flex gap-1 items-center bg-muted/50 p-1.5 rounded-xl border border-border/50">
                                            {colors.map(c => (
                                                <button
                                                    key={c}
                                                    disabled={isCreating}
                                                    onClick={() => setSelectedColor(c)}
                                                    className={cn(
                                                        "w-5 h-5 rounded-full transition-all cursor-pointer border border-transparent shrink-0",
                                                        selectedColor === c && "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110"
                                                    )}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleCreate}
                                        disabled={isCreating}
                                        className="bg-primary text-primary-foreground p-4 rounded-xl hover:opacity-90 disabled:opacity-70 cursor-pointer flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                    >
                                        {isCreating ? <AiOutlineLoading3Quarters className="animate-spin" size={24} /> : <IoAdd size={24} />}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Cancel Button (Small) */}
                            <div className="flex justify-end">
                                <button onClick={() => setIsInputMode(null)} className="text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Default Buttons
                    <div className="flex flex-col sm:flex-row justify-center sm:justify-start w-full gap-3 sm:gap-4 animate-in fade-in zoom-in-95 duration-300">
                        <button
                            onClick={() => { setIsInputMode("GOAL"); setGoalType("SHORT"); }}
                            className="group flex items-center justify-center sm:justify-start gap-3 px-6 py-4 rounded-2xl bg-card border border-border text-foreground hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer w-full sm:w-auto"
                        >
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <IoRocketOutline size={20} />
                            </div>
                            <span className="font-medium">Set Goal</span>
                        </button>
                        
                        <button
                            onClick={() => setIsInputMode("IDEA")}
                            className="group flex items-center justify-center sm:justify-start gap-3 px-6 py-4 rounded-2xl bg-card border border-border text-foreground hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer w-full sm:w-auto"
                        >
                            <div className="p-2 rounded-lg bg-secondary text-foreground group-hover:scale-110 transition-transform">
                                <IoBulbOutline size={20} />
                            </div>
                            <span className="font-medium">Capture Idea</span>
                        </button>
                    </div>
                )}
            </div>

            {/* --- TABS SECTION (SAMA SEPERTI KODEMU) --- */}
            {/* Bagian ini tidak perlu diubah logicnya, hanya pastikan props goals/ideas terpassing dengan benar */}
            <Tabs defaultValue="overview" className="w-full">
                <div className="vision-item mb-6 sm:mb-8 sticky top-[80px] z-30 sm:static">
                    <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex bg-card/80 backdrop-blur-md sm:bg-muted/50 border border-border p-1 h-auto rounded-xl shadow-sm sm:shadow-none">
                        <TabsTrigger value="overview" className="flex-col sm:flex-row gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-background sm:data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer transition-all text-xs sm:text-sm font-medium">
                            <IoGridOutline className="text-base sm:text-lg" /> 
                            <span>Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="goals" className="flex-col sm:flex-row gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-background sm:data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer transition-all text-xs sm:text-sm font-medium">
                            <IoRocketOutline className="text-base sm:text-lg" /> 
                            <span>Goals <span className="ml-0.5 sm:ml-1.5 opacity-50 text-[10px] align-top">{goals.length}</span></span>
                        </TabsTrigger>
                        <TabsTrigger value="ideas" className="flex-col sm:flex-row gap-1 sm:gap-2 px-2 sm:px-5 py-2 sm:py-2.5 rounded-lg data-[state=active]:bg-background sm:data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer transition-all text-xs sm:text-sm font-medium">
                            <IoBulbOutline className="text-base sm:text-lg" /> 
                            <span>Ideas <span className="ml-0.5 sm:ml-1.5 opacity-50 text-[10px] align-top">{ideas.length}</span></span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-min">
                        {goals.map((goal) => (
                            <div key={goal.id} className="vision-item">
                                <GoalCard
                                    goal={goal}
                                    onDelete={(id) => handleDelete(id, "GOAL")}
                                    onUpdate={handleUpdateGoalTitle}
                                />
                            </div>
                        ))}
                        {ideas.map((idea) => (
                            <div key={idea.id} className="vision-item">
                                <IdeaCard
                                    idea={idea}
                                    onDelete={(id) => handleDelete(id, "IDEA")}
                                    onUpdate={handleUpdateIdeaContent}
                                />
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* Tab Goals & Ideas SAMA PERSIS dengan kodemu sebelumnya */}
                <TabsContent value="goals" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                       {goals.length > 0 ? (
                           goals.map((goal) => (
                               <div key={goal.id} className="vision-item">
                                   <GoalCard
                                       goal={goal}
                                       onDelete={(id) => handleDelete(id, "GOAL")}
                                       onUpdate={handleUpdateGoalTitle}
                                   />
                               </div>
                           ))
                       ) : (
                           <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-3xl bg-muted/5">
                               <p>No goals set yet. Aim high.</p>
                           </div>
                       )}
                   </div>
               </TabsContent>

               <TabsContent value="ideas" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                       {ideas.length > 0 ? (
                           ideas.map((idea) => (
                               <div key={idea.id} className="vision-item">
                                   <IdeaCard
                                       idea={idea}
                                       onDelete={(id) => handleDelete(id, "IDEA")}
                                       onUpdate={handleUpdateIdeaContent}
                                   />
                               </div>
                           ))
                       ) : (
                           <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-3xl bg-muted/5">
                               <p>No ideas captured yet.</p>
                           </div>
                       )}
                   </div>
               </TabsContent>
            </Tabs>
        </div>
    );
};