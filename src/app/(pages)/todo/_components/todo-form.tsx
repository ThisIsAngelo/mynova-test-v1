"use client";

import { Todo } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { todoApi } from "@/services/todo-service";
import gsap from "gsap";
import { useLayoutEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoAdd, IoRepeat } from "react-icons/io5";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TodoFormProps {
  onAdd: (todo: Todo) => void;
}

export const TodoForm = ({ onAdd }: TodoFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // [NEW] State untuk tipe tugas
  const [type, setType] = useState("NORMAL"); 

  useLayoutEffect(() => {
    if (!formRef.current) return;
    gsap.fromTo(
      formRef.current,
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title.trim()) {
      setIsLoading(false);
      return;
    }

    try {
      const newTodo = await todoApi.create(title, description, type);

      onAdd(newTodo);

      formRef.current?.reset();
      setType("NORMAL");
      setIsFocused(false);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "mb-10 rounded-2xl border bg-card p-1 shadow-sm transition-all duration-300",
        isFocused ? "border-primary/50 ring-4 ring-primary/5 shadow-xl" : "border-border shadow-sm hover:border-primary/30"
      )}
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col relative"
        onFocus={() => setIsFocused(true)}
        // Logic blur: Cek apakah klik masih di dalam form (termasuk dropdown select)
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsFocused(false);
          }
        }}
      >
        <div className="flex items-start gap-4 p-4">

          <div className="flex-1">
            {/* TITLE INPUT */}
            <input
              type="text"
              name="title"
              placeholder="What's your main focus?"
              required
              disabled={isLoading}
              autoComplete="off"
              className="w-full bg-transparent text-lg font-medium placeholder:text-muted-foreground/50 placeholder:text-sm lg:placeholder:text-lg focus:outline-none disabled:opacity-50 py-1"
            />

            {/* SEPARATOR */}
            <div
              className={cn(
                "h-[1px] w-full bg-border/60 my-3 transition-all duration-300 origin-left",
                isFocused ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              )}
            />

            {/* DESCRIPTION INPUT */}
            <textarea
              name="description"
              placeholder="Add details (Context, Links, Notes)..."
              rows={isFocused ? 3 : 1}
              disabled={isLoading}
              className={cn(
                "w-full bg-transparent text-sm text-muted-foreground resize-none focus:outline-none disabled:opacity-50 transition-all duration-300 leading-relaxed",
                !isFocused && "h-0 opacity-0 overflow-hidden py-0 my-0"
              )}
            />

            {/* RECURRING SELECTOR (Muncul saat focused) */}
            <div className={cn(
                "overflow-hidden transition-all duration-300 ease-out",
                isFocused ? "max-h-20 opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
            )}>
                <div className="flex items-center gap-2">
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary/50 border-0">
                            <div className="flex items-center gap-2">
                                <IoRepeat className={type !== "NORMAL" ? "text-primary" : "text-muted-foreground"} />
                                <SelectValue placeholder="Repeat" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NORMAL">No Repeat</SelectItem>
                            <SelectItem value="DAILY">Daily</SelectItem>
                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    {type !== "NORMAL" && (
                        <span className="text-[10px] text-primary font-medium bg-primary/10 px-2 py-1 rounded-full animate-in fade-in">
                            Auto-generates {type.toLowerCase()}
                        </span>
                    )}
                </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md shrink-0 mt-1 cursor-pointer"
          >
            {isLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin" />
            ) : (
              <IoAdd size={24} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};