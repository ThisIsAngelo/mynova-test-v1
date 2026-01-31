"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export const BrutalistFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Gerakkan Shadow Hitam Tebal secara smooth (Circular Motion)
      // Kita gerakkan x dan y dengan sine/cosine yang berbeda fase biar jadi lingkaran
      
      const tl = gsap.timeline({ repeat: -1, yoyo: true });

      // Gerak Diagonal Smooth (Kiri Atas <-> Kanan Bawah)
      tl.to(offsetRef.current, {
        x: 6,
        y: 6,
        duration: 2,
        ease: "power2.inOut"
      })
      .to(offsetRef.current, {
        x: -6,
        y: -6,
        duration: 2,
        ease: "power2.inOut"
      });

      // Efek Scale dikit biar kerasa "hidup"
      gsap.to(offsetRef.current, {
          scale: 0.95,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={cn("relative flex items-center justify-center", className)}>
      {/* Solid Hard Shadow (Offset Layer) */}
      <div 
        ref={offsetRef}
        className={cn(
            "absolute inset-0 rounded-full z-0",
            "bg-black dark:bg-white", // Hitam di Light mode, Putih di Dark mode
            "opacity-100" // Solid, tidak transparan
        )}
      />
      
      {/* Image Container (Border Tebal Kontras) */}
      <div className={cn(
          "relative w-full h-full rounded-full overflow-hidden z-10",
          "border-[3px] border-black dark:border-white", // Border tebal
          "bg-background"
      )}>
        {children}
      </div>
    </div>
  );
};