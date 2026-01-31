"use client";

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
import { Todo } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import gsap from "gsap";
import { useLayoutEffect, useRef, useState } from "react";
import { IoCheckmark, IoPencil, IoTrashOutline } from "react-icons/io5";
import { MdDragIndicator } from "react-icons/md";

interface TodoItemProps {
    todo: Todo;
    onUpdate: (todo: Todo) => void;
    onDelete: (id: string) => void;
}

export const TodoItem = ({ todo, onUpdate, onDelete }: TodoItemProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(todo.title);
    const [editDesc, setEditDesc] = useState(todo.description || "");
    const contentRef = useRef<HTMLDivElement>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: todo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.6 : 1,
    };

    useLayoutEffect(() => {
        if (!contentRef.current) return;
        gsap.to(contentRef.current, { 
            opacity: todo.isCompleted ? 0.5 : 1,
            duration: 0.3 
        });
    }, [todo.isCompleted]);

    const handleToggle = () => { onUpdate({ ...todo, isCompleted: !todo.isCompleted }); };

    const handleDelete = () => {
        const elementToAnimate = document.getElementById(`todo-card-${todo.id}`);
        if (elementToAnimate) {
             gsap.to(elementToAnimate, {
                x: 50, opacity: 0, height: 0, marginBottom: 0, padding: 0, duration: 0.4, ease: "power2.in",
                onComplete: () => { onDelete(todo.id); },
            });
        } else {
             onDelete(todo.id);
        }
    };

    const handleSaveEdit = () => {
        if (!editTitle.trim()) return;
        onUpdate({ ...todo, title: editTitle, description: editDesc || null });
        setIsEditing(false);
    };

    return (
        <li ref={setNodeRef} style={style} className="relative group/item">
            <div 
                id={`todo-card-${todo.id}`}
                onClick={() => !isEditing && handleToggle()}
                className={cn(
                    "flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-300", // Ubah ke Flex-Col
                    isEditing ? "cursor-default" : "cursor-pointer",
                    todo.isCompleted 
                        ? "bg-muted/30 border-transparent shadow-none" 
                        : "bg-card border-border shadow-sm hover:shadow-lg hover:border-primary/30"
                )}
            >
                {/* --- TOP ROW (Checkbox & Controls) --- */}
                <div className="flex items-center justify-between w-full border-b border-border/30 pb-3 mb-1">
                    
                    {/* LEFT: Checkbox Visual */}
                    <div className="pointer-events-none">
                        <div className={cn(
                            "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                            todo.isCompleted 
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20" 
                                : "bg-background border-muted-foreground/30 text-transparent"
                        )}>
                            <IoCheckmark className="text-base font-bold" />
                        </div>
                    </div>

                    {/* RIGHT: Controls (Actions + Drag) */}
                    <div className="flex items-center gap-2">
                        
                        {/* Action Buttons (Edit/Delete) - Muncul saat Hover/Edit */}
                        {!isEditing && (
                            <div className="flex items-center gap-1 lg:opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setIsEditing(true); 
                                    }}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                    title="Edit"
                                >
                                    <IoPencil className="h-4 w-4" />
                                </button>
                                
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button 
                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                            onClick={(e) => e.stopPropagation()}
                                            title="Delete"
                                        >
                                            <IoTrashOutline className="h-4 w-4" />
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                                            <AlertDialogDescription>Permanently delete &quot;{todo.title}&quot;?</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}

                        {/* Drag Handle */}
                        <div 
                            {...attributes} 
                            {...listeners} 
                            onClick={(e) => e.stopPropagation()}
                            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground transition-colors touch-none p-1"
                        >
                            <MdDragIndicator className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* --- BOTTOM ROW (Content Text) --- */}
                <div ref={contentRef} className="w-full">
                    {isEditing ? (
                        <div 
                            className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200 cursor-default"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            <input 
                                value={editTitle} 
                                onChange={(e) => setEditTitle(e.target.value)} 
                                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-lg font-medium focus:ring-2 focus:ring-primary/20 outline-none" 
                                autoFocus 
                            />
                            
                            <textarea 
                                value={editDesc} 
                                onChange={(e) => setEditDesc(e.target.value)} 
                                rows={3} 
                                className="w-full resize-none bg-background border border-input rounded-lg px-3 py-2 text-sm text-muted-foreground focus:ring-2 focus:ring-primary/20 outline-none" 
                            />
                            <div className="flex gap-2 justify-end pt-2">
                                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-medium rounded-md hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                                <button onClick={handleSaveEdit} className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer">Save</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 select-none pl-1">
                            <label className={cn(
                                "block text-lg font-semibold leading-tight transition-all cursor-pointer",
                                todo.isCompleted ? "text-muted-foreground line-through decoration-border" : "text-foreground"
                            )}>
                                {todo.title}
                            </label>
                            
                            {todo.description && (
                                <p className={cn(
                                    "text-sm text-muted-foreground/90 leading-relaxed cursor-pointer whitespace-pre-wrap break-words", 
                                    todo.isCompleted && "text-muted-foreground/50 line-through decoration-border/50"
                                )}>
                                    {todo.description}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
};