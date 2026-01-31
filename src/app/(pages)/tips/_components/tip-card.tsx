"use client";

import { useState } from "react";
import { Tip } from "@/generated/prisma/client";
import { IoPencil, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoShareSocial, IoTrashOutline } from "react-icons/io5";
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

interface TipCardProps {
  tip: Tip;
  onUpdate: (id: string, content: string, source: string) => void;
  onDelete: (id: string) => void;
}

export const TipCard = ({ tip, onUpdate, onDelete }: TipCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(tip.content);
  const [editSource, setEditSource] = useState(tip.source || "");

  const handleSave = () => {
    if (!editContent.trim()) return;
    onUpdate(tip.id, editContent, editSource);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(tip.content);
    setEditSource(tip.source || "");
    setIsEditing(false);
  };

  return (
    <div className={cn(
        "group relative flex flex-col justify-between h-full overflow-hidden rounded-2xl border transition-all duration-300",
        isEditing 
            ? "bg-card border-primary/50 shadow-md ring-1 ring-primary/20"
            : "bg-card border-border hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
    )}>
      
      {/* Icon Kutip Dekoratif */}
      {!isEditing && (
        <div className="absolute -right-1 -top-4 text-[5rem] font-serif text-muted-foreground/5 select-none pointer-events-none leading-none">
            &rdquo;
        </div>
      )}

      {/* --- CONTENT AREA --- */}
      <div className="relative z-10 p-5 flex-1">
        {isEditing ? (
            <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-muted/30 rounded-lg p-3 text-sm leading-relaxed text-foreground font-medium outline-none border border-input focus:border-primary focus:bg-background transition-all resize-none min-h-[120px]"
                autoFocus
                placeholder="Content..."
            />
        ) : (
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90 font-medium">
                {tip.content}
            </p>
        )}
      </div>

      {/* --- FOOTER AREA --- */}
      <div className="relative z-10 px-5 pb-4 pt-2 flex items-center justify-between gap-3 mt-auto border-t border-border/40 pt-3">
        
        {/* Source Badge */}
        <div className="flex-1 min-w-0">
            {isEditing ? (
                <div className="flex items-center gap-2 bg-muted/30 rounded-md px-2 py-1.5 border border-input focus-within:border-primary transition-colors">
                    <IoShareSocial className="text-muted-foreground shrink-0 text-xs" />
                    <input 
                        value={editSource}
                        onChange={(e) => setEditSource(e.target.value)}
                        className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/50"
                        placeholder="Source..."
                    />
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-muted-foreground max-w-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                    <span className="truncate text-xs font-mono font-medium uppercase tracking-wide opacity-80">
                        {tip.source || "Unknown"}
                    </span>
                </div>
            )}
        </div>

        {/* --- ACTION BUTTONS --- */}
        <div className={cn(
            "flex items-center gap-1 transition-all duration-200",
            // Mobile: Selalu visible | Desktop: Visible on hover
            isEditing ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        )}>
            {isEditing ? (
                <>
                    <button onClick={handleSave} className="text-emerald-500 hover:bg-emerald-500/10 p-2 rounded-lg cursor-pointer transition-colors" title="Save">
                        <IoCheckmarkCircleOutline size={20} />
                    </button>
                    <button onClick={handleCancel} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg cursor-pointer transition-colors" title="Cancel">
                        <IoCloseCircleOutline size={20} />
                    </button>
                </>
            ) : (
                <>
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-lg cursor-pointer transition-colors" 
                        title="Edit"
                    >
                        <IoPencil size={16} />
                    </button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg cursor-pointer transition-colors" title="Delete">
                                <IoTrashOutline size={16} />
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Tip?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will be permanently removed from your collection.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">Keep it</AlertDialogCancel>
                                <AlertDialogAction 
                                    onClick={() => onDelete(tip.id)}
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
    </div>
  );
};