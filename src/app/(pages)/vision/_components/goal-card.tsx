/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useState } from "react";
import { Goal } from "@/generated/prisma/client";
import { IoTrashOutline, IoPencil, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoFlagOutline, IoRocketOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
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

interface GoalCardProps {
    goal: Goal;
    onDelete: (id: string) => void;
    onUpdate: (id: string, title: string) => void;
}

export const GoalCard = ({ goal, onDelete, onUpdate }: GoalCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(goal.title);

    // Casting type karena prisma client di frontend kadang belum sync type enum baru
    const goalType = (goal as any).type || "SHORT"; 

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (editTitle.trim()) onUpdate(goal.id, editTitle);
        setIsEditing(false);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditTitle(goal.title);
        setIsEditing(false);
    };

    return (
        <div className="group relative h-full">
            <Link href={`/vision/goals/${goal.id}`} className="block h-full">
                <div
                    className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
                    style={{ "--goal-color": goal.color } as any}
                >
                    {/* Background glow halus */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--goal-color)] opacity-[0.03] dark:opacity-[0.08] blur-[60px] rounded-full pointer-events-none" />
                    <div className="absolute inset-0 border-2 border-transparent rounded-3xl transition-colors duration-300 group-hover:border-[var(--goal-color)] opacity-20 pointer-events-none" />

                    <div className="relative z-10 flex flex-col gap-3">
                        {/* [NEW] Badge Type */}
                        <div className="flex justify-between items-start">
                            <span className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                                goalType === "LONG" 
                                    ? "bg-purple-500/10 text-purple-500 border-purple-500/20" 
                                    : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            )}>
                                {goalType === "LONG" ? <IoFlagOutline /> : <IoRocketOutline />}
                                {goalType === "LONG" ? "Long-term" : "Short-term"}
                            </span>
                        </div>

                        {isEditing ? (
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onClick={(e) => e.preventDefault()}
                                className="w-full bg-transparent border-b border-[var(--goal-color)] text-lg font-bold tracking-tight text-foreground outline-none px-0 py-0.5 z-30"
                                autoFocus
                            />
                        ) : (
                            <h3 className="text-xl font-heading font-bold tracking-tight text-card-foreground leading-tight break-words pr-8">
                                {goal.title}
                            </h3>
                        )}
                    </div>

                    <div className="relative z-10 mt-8 space-y-3">
                        {/* Kalau Long-term, mungkin progress bar beda style atau tetap sama. Sementara sama dulu */}
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Progress</span>
                            <span className="text-2xl font-mono font-bold" style={{ color: goal.color }}>
                                {goal.progress}%
                            </span>
                        </div>
                        
                        <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {/* ACTION BUTTONS (SAMA PERSIS) */}
            <div className={cn(
                "absolute top-5 right-5 z-20 flex gap-1 transition-all duration-200",
                isEditing ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            )}>
               {/* Logic tombol Edit/Delete SAMA PERSIS */}
               {isEditing ? (
                   <>
                       <button onClick={handleSave} className="text-emerald-500 hover:bg-emerald-500/10 p-1.5 cursor-pointer rounded-full backdrop-blur-md bg-card/80 border border-border"><IoCheckmarkCircleOutline size={18} /></button>
                       <button onClick={handleCancel} className="text-destructive hover:bg-destructive/10 p-1.5 cursor-pointer rounded-full backdrop-blur-md bg-card/80 border border-border"><IoCloseCircleOutline size={18} /></button>
                   </>
               ) : (
                   <>
                       <button
                           onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                           className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-lg cursor-pointer transition-colors backdrop-blur-sm"
                       >
                           <IoPencil size={16} />
                       </button>

                       <AlertDialog>
                           <AlertDialogTrigger asChild>
                               <button
                                   className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg cursor-pointer transition-colors backdrop-blur-sm"
                                   onClick={(e) => e.stopPropagation()}
                               >
                                   <IoTrashOutline size={16} />
                               </button>
                           </AlertDialogTrigger>
                           <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                               <AlertDialogHeader>
                                   <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
                                   <AlertDialogDescription>
                                       &quot;{goal.title}&quot; and all its progress will be lost.
                                   </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                   <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                   <AlertDialogAction
                                       onClick={() => onDelete(goal.id)}
                                       className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                                   >
                                       Delete
                                   </AlertDialogAction>
                               </AlertDialogFooter>
                           </AlertDialogContent>
                       </AlertDialog>
                   </>
               )}
            </div>
        </div>
    );
};