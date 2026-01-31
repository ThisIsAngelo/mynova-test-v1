"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const GradientFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(spinnerRef.current, {
        rotation: 360,
        duration: 4, // 4 detik per putaran
        repeat: -1,
        ease: "none", // Linear speed
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-center", className)}>
      {/* Spinning Gradient Disk */}
      <div 
        ref={spinnerRef}
        className="absolute -inset-[3px] rounded-full z-0 bg-[conic-gradient(from_0deg,theme(colors.pink.500),theme(colors.purple.500),theme(colors.indigo.500),theme(colors.pink.500))] blur-[2px] opacity-80"
      />
      
      {/* Masking Container (Agar gradient jadi border) */}
      <div className="relative w-full h-full rounded-full overflow-hidden z-10 border-[4px] border-background bg-background shadow-inner">
        {children}
      </div>
    </div>
  );
};