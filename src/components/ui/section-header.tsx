"use client"

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useLayoutEffect, useRef } from 'react'
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

interface SectionHeaderProps {
    title: string
    description: string
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    description
}) => {
    const mainRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLSpanElement>(null);
    const descRef = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const isMobile = window.innerWidth < 1024;

            // Use the refs instead of querySelector
            const splitTitle = new SplitType(titleRef.current!, { types: "lines,words" });
            const splitDesc = new SplitType(descRef.current!, { types: "lines" });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: mainRef.current,
                    start: isMobile ? "top 30%" : "top 50%",
                    toggleActions: 'play none none none',
                },
            });

            tl.fromTo(
                splitTitle.lines,
                { yPercent: 100, opacity: 0 },
                {
                    yPercent: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power3.out",
                    stagger: 0.15,
                }
            );

            tl.fromTo(
                splitTitle.words,
                { color: '#1A1A1A' },
                {
                    color: 'rgba(247, 246, 243, 1)',
                    duration: 1,
                    ease: 'power2.out',
                    stagger: 0.05,
                },
            );

            // Animasi slide-up untuk baris deskripsi
            tl.fromTo(
                splitDesc.lines,
                { yPercent: 100, opacity: 0 },
                {
                    yPercent: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power3.out",
                    stagger: 0.15,
                },
                "-=1.2"
            );

        }, mainRef);

        return () => ctx.revert();
    }, []);
    return (
        <div ref={mainRef} className="hidden text-center lg:flex flex-col items-center py-12">
            <h2 className="max-w-4xl text-3xl sm:text-4xl md:text-5xl font-medium text-offwhite">
                <span ref={titleRef}>
                    {title}
                </span>
            </h2>
            <p className="text-base sm:text-lg max-w-2xl text-offwhite/60 mt-4">
                <span ref={descRef}>
                    {description}
                </span>
            </p>
        </div>
    )
}

export default SectionHeader
