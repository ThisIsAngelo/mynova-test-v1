"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const GoldFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Menggerakkan background gradient agar terlihat berkilau
      gsap.to(ringRef.current, {
        backgroundPosition: "200% center",
        duration: 2.5,
        repeat: -1,
        ease: "linear",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-center", className)}>
      {/* Gold Ring with Shimmer Gradient */}
      <div 
        ref={ringRef}
        className="absolute -inset-[4px] rounded-full z-0 bg-gradient-to-tr from-yellow-700 via-yellow-200 to-yellow-600 bg-[length:200%_auto] shadow-[0_0_25px_rgba(234,179,8,0.5)] border border-yellow-500/50"
      />
      
      {/* Inner Container */}
      <div className="relative w-full h-full rounded-full overflow-hidden z-10 border-[3px] border-yellow-900/10 dark:border-yellow-100/10 bg-background">
        {children}
      </div>
    </div>
  );
};