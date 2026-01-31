"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { IoArrowBack, IoPlanetOutline } from "react-icons/io5";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current || !numberRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Animasi Masuk (Fade Up)
      gsap.fromTo(
        ".nf-item",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );

      // 2. Animasi Floating untuk Angka 404 (Background)
      gsap.to(numberRef.current, {
        y: -20,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 3. Animasi Floating Icon Planet
      gsap.to(".nf-icon", {
        rotation: 10,
        y: 10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main 
        className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden px-6"
        ref={containerRef}
    >
        {/* BACKGROUND DECORATION */}
        {/* Angka 404 Raksasa di belakang */}
        <h1 
            ref={numberRef}
            className="absolute text-[12rem] sm:text-[18rem] md:text-[25rem] font-black text-foreground/5 select-none z-0 pointer-events-none"
        >
            404
        </h1>

        {/* Lingkaran Glow Halus */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none z-0" />

        {/* CONTENT UTAMA */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
            
            <div className="nf-item nf-icon mb-6 p-4 rounded-3xl bg-card border border-border shadow-lg">
                <IoPlanetOutline className="text-4xl sm:text-5xl text-primary" />
            </div>

            <h2 className="nf-item text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">
                Lost in the Void?
            </h2>
            
            <p className="nf-item text-muted-foreground text-base sm:text-lg mb-10 leading-relaxed">
                The page you are looking for doesn&apos;t exist or has been moved to another dimension.
            </p>

            <Link 
                href="/" 
                className="nf-item group relative inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground text-sm font-semibold rounded-full shadow-md hover:shadow-xl hover:bg-primary/90 transition-all duration-300 active:scale-95"
            >
                <IoArrowBack className="text-lg group-hover:-translate-x-1 transition-transform" />
                <span>Back to Dashboard</span>
            </Link>

            {/* Footer Text Kecil */}
            <p className="nf-item mt-12 text-xs font-mono text-muted-foreground/40 uppercase tracking-widest">
                Error Code: 404 • Not Found
            </p>
        </div>
    </main>
  );
}