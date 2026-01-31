"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function Loading() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const subTextRef = useRef<HTMLParagraphElement>(null);

  const text = "SYSTEM LOADING";
  const letters = text.split("");

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const letterElements = textRef.current?.children || [];

      // 1. Animasi Huruf Utama (Stagger Naik)
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

      tl.fromTo(
        letterElements,
        {
          y: "120%", 
          opacity: 0,
          rotateX: -90,
        },
        {
          y: "0%",
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.04,
          ease: "expo.out",
        }
      )
      .to(letterElements, {
        y: "-120%",
        opacity: 0,
        rotateX: 90,
        duration: 0.6,
        stagger: 0.04,
        ease: "expo.in",
        delay: 1.5,
      });

      // 2. Animasi Garis Progress
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0, transformOrigin: "left center", opacity: 0.5 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 2.5,
          ease: "expo.inOut",
          repeat: -1,
        }
      );

      // 3. Subtext Blinking (Simulasi cursor terminal)
      gsap.to(subTextRef.current, {
        opacity: 0.3,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
        ref={containerRef}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
    >
        {/* Glow Effect di Background (Theme Aware) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-start px-8">
            
            {/* Main Text Container */}
            <div className="overflow-hidden mb-3">
                <div 
                    ref={textRef} 
                    className="flex text-4xl md:text-6xl font-black tracking-tighter text-foreground"
                >
                    {letters.map((letter, index) => (
                        <span
                            key={index}
                            className="inline-block origin-bottom"
                        >
                            {letter === " " ? "\u00A0" : letter}
                        </span>
                    ))}
                </div>
            </div>
            
            {/* Progress Line */}
            <div className="w-full h-[2px] bg-muted relative overflow-hidden rounded-full">
                <div
                    ref={lineRef}
                    className="absolute top-0 left-0 w-full h-full bg-primary origin-left"
                ></div>
            </div>

            {/* Subtext Info */}
            <div className="w-full flex justify-between items-center mt-2">
                <p 
                    ref={subTextRef} 
                    className="text-xs font-mono text-primary font-bold tracking-[0.2em] uppercase"
                >
                    Initializing...
                </p>
                <span className="text-[10px] text-muted-foreground font-mono">BETA</span>
            </div>

        </div>
    </div>
  );
}