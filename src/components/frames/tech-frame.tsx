"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const TechFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Outer Ring: Clockwise, Slow
      gsap.to(outerRef.current, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none",
      });
      
      // Inner Ring: Counter-Clockwise, Fast
      gsap.to(innerRef.current, {
        rotation: -360,
        duration: 10,
        repeat: -1,
        ease: "none",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-center", className)}>
      {/* Outer Dashed Ring */}
      <div 
        ref={outerRef}
        className="absolute -inset-[8px] rounded-full border border-dashed border-neutral-400 dark:border-neutral-600 z-0 opacity-60"
      />
      
      {/* Inner Dashed Ring */}
      <div 
        ref={innerRef}
        className="absolute -inset-[3px] rounded-full border-[2px] border-dashed border-primary/40 dark:border-primary/60 z-0"
      />

      {/* Image */}
      <div className="relative w-full h-full rounded-full overflow-hidden z-10 border border-neutral-100 dark:border-white/5 bg-background">
        {children}
      </div>
    </div>
  );
};