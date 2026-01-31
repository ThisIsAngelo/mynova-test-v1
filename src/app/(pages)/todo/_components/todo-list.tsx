"use client";

import { Todo } from "@/generated/prisma/client";
import { TodoItem } from "./todo-item";
import { useRef, useLayoutEffect, useState } from "react"; // Tambah useState
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { IoListOutline, IoCheckmarkDoneOutline, IoTrashBinOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Import Loading Icon
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

gsap.registerPlugin(ScrollTrigger);

interface TodoListProps {
  id: string;
  title?: string;
  todos: Todo[];
  onUpdate: (todo: Todo) => void;
  onDelete: (id: string) => void;
  showPlaceholder?: boolean;
  onClearCompleted?: () => Promise<void>; // Update type jadi Promise<void>
}

export const TodoList = ({
  id,
  title,
  todos,
  onUpdate,
  onDelete,
  showPlaceholder = true,
  onClearCompleted,
}: TodoListProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const listRef = useRef<HTMLUListElement>(null);

  // [NEW] Local States untuk Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!onClearCompleted) return;

    setIsDeleting(true);

    await onClearCompleted();

    setIsDeleting(false);
    setIsDialogOpen(false);
  };

  useLayoutEffect(() => {
    if (!listRef.current || todos.length === 0) return;
    const items = Array.from(listRef.current.children);
    if (items.length > 0 && getComputedStyle(items[0]).opacity === '1') return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: listRef.current,
            start: "top bottom-=50",
            toggleActions: "play none none none",
          },
        }
      );
    }, listRef);
    return () => ctx.revert();
  }, [todos.length]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      {(title || (onClearCompleted && todos.length > 0)) && (
        <div className="flex items-center justify-between pb-2 border-b border-border/50 h-10">
          
          {/* Left Side: Title*/}
          {title && (
            <h3 className="flex items-center gap-2.5 text-sm font-bold text-muted-foreground uppercase tracking-widest">
              <span className="text-lg">
                {id === "active" ? <IoListOutline /> : <IoCheckmarkDoneOutline />}
              </span>
              {title}
            </h3>
          )}
          
          {/* Right Side: Actions */}
          <div className="flex items-center w-full md:w-auto">
            
            {/* Logic Button Clear All dengan Loading */}
            {onClearCompleted && todos.length > 0 && (
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <button 
                    className="cursor-pointer text-xs w-full md:w-auto py-2 md:px-4 flex justify-center md:justify-end items-center gap-1 font-medium text-foreground md:text-muted-foreground transition-colors rounded-md bg-destructive/10 md:bg-transparent md:hover:bg-destructive/10"
                    title="Delete all completed tasks"
                  >
                    <IoTrashBinOutline size={14} /> Clear All
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Completed Tasks?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {todos.length} completed tasks.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
                        Cancel
                    </AlertDialogCancel>
                    
                    <AlertDialogAction 
                      onClick={onConfirmDelete} 
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer min-w-[100px] flex justify-center"
                    >
                      {isDeleting ? (
                          <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
                      ) : (
                          "Yes, Clear All"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      )}

      <section
        ref={setNodeRef}
        className={cn(
          "rounded-2xl transition-all duration-300 flex-1 min-h-[100px]",
          isOver && "bg-primary/5 ring-2 ring-primary/20 ring-dashed",
          todos.length === 0 && showPlaceholder && "border-2 border-dashed border-border/60 bg-muted/5 flex items-center justify-center"
        )}
      >
        <SortableContext
          id={id}
          items={todos.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul ref={listRef} className="space-y-3 p-1">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </SortableContext>

        {todos.length === 0 && showPlaceholder && (
          <div className="text-center p-8 select-none">
            <p className="text-sm text-muted-foreground font-medium">No active tasks</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Drag tasks here or create new ones</p>
          </div>
        )}
      </section>
    </div>
  );
};