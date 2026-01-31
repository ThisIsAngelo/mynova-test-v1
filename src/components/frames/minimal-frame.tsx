"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const MinimalFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Subtle color shift
      gsap.to(borderRef.current, {
        borderColor: "rgba(163, 163, 163, 1)", // Neutral-400
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "power1.inOut"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-center", className)}>
      <div 
        ref={borderRef}
        className="absolute -inset-[2px] rounded-full z-0 border-[3px] border-neutral-200 dark:border-neutral-800 transition-colors"
      />
      <div className="relative w-full h-full rounded-full overflow-hidden z-10 border border-black/5 dark:border-white/5 bg-background">
        {children}
      </div>
    </div>
  );
};