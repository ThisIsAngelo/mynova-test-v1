"use client";

import { useState } from "react";
import { Idea } from "@/generated/prisma/client";
import { IoClose, IoPencil, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoBulbOutline } from "react-icons/io5";
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
import { cn } from "@/lib/utils";

interface IdeaCardProps {
    idea: Idea;
    onDelete: (id: string) => void;
    onUpdate: (id: string, content: string) => void;
}

export const IdeaCard = ({ idea, onDelete, onUpdate }: IdeaCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(idea.content);

    const handleSave = () => {
        if (editContent.trim()) onUpdate(idea.id, editContent);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditContent(idea.content);
        setIsEditing(false);
    }

    return (
        <div className="group relative flex min-h-[160px] flex-col rounded-3xl border-2 border-dashed border-border bg-muted/10 p-6 transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-lg">
            
            <div className="flex-1">
                {isEditing ? (
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-full min-h-[100px] bg-background border border-input rounded-xl p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono leading-relaxed"
                        autoFocus
                    />
                ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground group-hover:text-foreground font-mono transition-colors">
                        {idea.content}
                    </p>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 h-8">
                <span className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <IoBulbOutline className="text-base" /> IDEA
                </span>

                <div className={cn(
                    "flex items-center gap-1 transition-opacity",
                    isEditing ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                )}>
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="text-emerald-500 hover:bg-emerald-500/10 p-1.5 rounded-md cursor-pointer"><IoCheckmarkCircleOutline size={18} /></button>
                            <button onClick={handleCancel} className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md cursor-pointer"><IoCloseCircleOutline size={18} /></button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-md cursor-pointer transition-colors">
                                <IoPencil size={14} />
                            </button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-md cursor-pointer transition-colors">
                                        <IoClose size={14} />
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Discard Idea?</AlertDialogTitle>
                                        <AlertDialogDescription>Permanently remove this note?</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(idea.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer">Discard</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};