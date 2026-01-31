"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const EclipseFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const coronaRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Putar "Cahaya Corona" (Cincin Gradasi)
      gsap.to(coronaRef.current, {
        rotation: 360,
        duration: 4, // Kecepatan putaran cahaya
        repeat: -1,
        ease: "none",
      });

      // 2. Animasikan Shadow Overlay (Biar ada efek 'bernafas' gelap terang)
      gsap.to(shadowRef.current, {
        opacity: 0.6,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-center", className)}>
      {/* LAYER 1: Rotating Corona (Cahaya Gerhana) */}
      <div 
        ref={coronaRef}
        className={cn(
            "absolute -inset-[3px] rounded-full z-0",
            // Gradient: Transparan -> Terang -> Transparan (Simulasi cahaya memutar)
            "bg-[conic-gradient(from_0deg,transparent_0%,theme(colors.neutral.400)_20%,theme(colors.neutral.100)_50%,theme(colors.neutral.400)_80%,transparent_100%)]",
            "dark:bg-[conic-gradient(from_0deg,transparent_0%,theme(colors.neutral.800)_20%,theme(colors.white)_50%,theme(colors.neutral.800)_80%,transparent_100%)]",
            "opacity-80 blur-[2px]"
        )}
      />
      
      {/* LAYER 2: Eclipse Shadow (Penutup Gelap) */}
      <div 
        ref={shadowRef}
        className="absolute -inset-[1px] rounded-full z-1 bg-background opacity-20"
      />

      {/* LAYER 3: Image Container */}
      <div className="relative w-full h-full rounded-full overflow-hidden z-10 border border-neutral-200 dark:border-white/10 bg-background">
        {children}
      </div>
    </div>
  );
};