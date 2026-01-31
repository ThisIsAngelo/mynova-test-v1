"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const GlassFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (shineRef.current) {
        // Shine effect passing through
        gsap.fromTo(shineRef.current, 
          { x: "-150%", opacity: 0 },
          { 
            x: "150%", 
            opacity: 0.6, 
            duration: 1.5, 
            repeat: -1, 
            repeatDelay: 3, // Istirahat 3 detik sebelum lewat lagi
            ease: "power2.inOut" 
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-center", className)}>
      {/* Glass Border Container */}
      <div className="absolute -inset-[3px] rounded-full z-10 border-2 border-white/50 dark:border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden pointer-events-none ring-1 ring-black/5 dark:ring-white/5 ">
          {/* Moving Shine Layer */}
          <div ref={shineRef} className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/80 to-transparent -skew-x-12" />
      </div>
      
      {/* Image */}
      <div className="relative w-full h-full rounded-full overflow-hidden z-0 bg-neutral-100 dark:bg-neutral-800">
        {children}
      </div>
    </div>
  );
};