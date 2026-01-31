"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const OrbitFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Putar container bola
      gsap.to(orbitRef.current, {
        rotation: 360,
        duration: 8, // Slow & Elegant
        repeat: -1,
        ease: "none",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-center", className)}>
      {/* Track Lingkaran */}
      <div className="absolute -inset-[8px] rounded-full border border-neutral-300 dark:border-neutral-700 z-0" />
      
      {/* Orbiting Dot Container */}
      <div ref={orbitRef} className="absolute -inset-[8px] z-0 rounded-full">
         {/* The Dot */}
         <div className="absolute top-1/2 -right-[5px] w-3 h-3 bg-foreground rounded-full shadow-sm -translate-y-1/2" />
      </div>

      {/* Inner Image */}
      <div className="relative w-full h-full rounded-full overflow-hidden z-10 border border-neutral-100 dark:border-white/5 bg-background">
        {children}
      </div>
    </div>
  );
};