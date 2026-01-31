"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const NeonFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP Context untuk cleanup otomatis
    const ctx = gsap.context(() => {
      gsap.to(glowRef.current, {
        boxShadow: "0 0 25px 6px rgba(6,182,212,0.7)", // Cyan glow
        scale: 1.08, // Frame membesar sedikit
        duration: 1.5,
        yoyo: true, // Bolak balik (Nafas)
        repeat: -1,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert(); // Cleanup saat unmount
  }, []);

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-center", className)}>
      {/* Layer Animasi (Di Belakang) */}
      <div 
        ref={glowRef} 
        className="absolute inset-0 rounded-full border-[3px] border-cyan-400 dark:border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)] z-0" 
      />
      
      {/* Layer Gambar (Di Depan & Static) */}
      <div className="relative w-full h-full rounded-full overflow-hidden z-10 border-2 border-cyan-500/30 bg-background">
        {children}
      </div>
    </div>
  );
};