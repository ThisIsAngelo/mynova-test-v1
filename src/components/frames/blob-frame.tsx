"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const BlobFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate Border Radius untuk efek cair
      gsap.to(blobRef.current, {
        borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        keyframes: {
            "0%":   { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
            "33%":  { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
            "66%":  { borderRadius: "70% 30% 50% 50% / 30% 40% 60% 50%" },
            "100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
        }
      });
      // Rotasi pelan agar lebih dinamis
      gsap.to(blobRef.current, {
          rotation: 360,
          duration: 20,
          repeat: -1,
          ease: "none"
      })
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-center", className)}>
      {/* Blob Background */}
      <div 
        ref={blobRef}
        className="absolute -inset-[6px] bg-gradient-to-tr from-indigo-200 to-purple-200 dark:from-indigo-900 dark:to-purple-900 z-0 opacity-80"
      />
      
      {/* Inner Image (Tetap bulat sempurna biar kontras) */}
      <div className="relative w-full h-full rounded-full overflow-hidden z-10 border-2 border-white dark:border-neutral-900 bg-background shadow-sm">
        {children}
      </div>
    </div>
  );
};