"use client"

import Container from "@/components/container"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"; // useUser tetap dipakai untuk cek status login
import gsap from "gsap"
import Link from "next/link"
import React, { useEffect, useRef } from "react"
import { FaArrowRightLong } from "react-icons/fa6"
import { IoMdClose } from "react-icons/io"
import { AvatarFrame } from "../ui/avatar-frame"
import { NovaCoinBadge } from "../ui/nova-coin"
import { navLinks } from "./data"

interface MobileNavProps {
    mobileNav: boolean
    setMobileNav: (mobileNav: boolean) => void
    customAvatar?: string
    customFrame?: string
}

const MobileNav: React.FC<MobileNavProps> = ({ mobileNav, setMobileNav, customAvatar, customFrame }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const { user } = useUser();

    // Logic animasi sama...
    useEffect(() => {
        const tl = gsap.timeline();
        if (mobileNav) {
            document.body.style.overflow = "hidden";
            tl.to(menuRef.current, { x: "0%", borderTopLeftRadius: "0vw", borderBottomLeftRadius: "0vw", duration: 0.8, ease: "power4.inOut" });
            tl.fromTo(".mobile-link-item", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: "back.out(1.2)" }, "-=0.5");
        } else {
            document.body.style.overflow = "";
            tl.to(".mobile-link-item", { opacity: 0, y: -20, duration: 0.3 });
            tl.to(menuRef.current, { x: "100%", borderTopLeftRadius: "50vh", borderBottomLeftRadius: "50vh", duration: 0.8, ease: "power4.inOut" }, "-=0.1");
        }
    }, [mobileNav]);

    // Gunakan customAvatar jika ada, kalau tidak fallback ke Clerk, lalu placeholder
    const displayImage = customAvatar || user?.imageUrl || "/assets/images/avatars/default.jpg";
    const activeFrame = customFrame || "none";

    return (
        <>
            <div className={cn("fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-500 lg:hidden", mobileNav ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")} onClick={() => setMobileNav(false)} />

            <div ref={menuRef} className="fixed top-0 right-0 bottom-0 z-[100] h-dvh w-full sm:w-[450px] bg-background border-l border-border translate-x-full lg:hidden flex flex-col shadow-2xl overflow-y-auto">
                <Container className="min-h-full flex flex-col px-8 py-8">

                    {/* Header Mobile Nav */}
                    <div className="mobile-link-item flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                            <Link href="/shop" onClick={() => setMobileNav(false)}>
                                <NovaCoinBadge />
                            </Link>
                            <ModeToggle />
                        </div>
                        <button onClick={() => setMobileNav(false)} className="p-2 rounded-full border border-border hover:bg-secondary hover:rotate-90 transition-all duration-300 text-foreground cursor-pointer">
                            <IoMdClose size={24} />
                        </button>
                    </div>

                    {/* Links */}
                    <div className="flex-1 flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} onClick={() => setMobileNav(false)} className="mobile-link-item group flex items-center justify-between py-4 border-b border-border/40 hover:border-foreground/20 transition-all">
                                <span className="font-heading text-4xl md:text-5xl font-bold text-muted-foreground group-hover:text-foreground transition-colors duration-300">{link.name}</span>
                                <span className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary -rotate-45 group-hover:rotate-0"><FaArrowRightLong size={24} /></span>
                            </Link>
                        ))}
                    </div>

                    {/* Footer / User Profile */}
                    <div className="mt-auto space-y-4 pt-8">
                        {user ? (
                            <div className="mobile-link-item">
                                <Link href="/profile" onClick={() => setMobileNav(false)} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 hover:border-primary/30 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-4">

                                        {/* [UPDATED] Avatar Container dengan Frame Logic */}
                                        <AvatarFrame
                                            src={displayImage}
                                            alt="Profile"
                                            frameAsset={activeFrame}
                                            sizeClass="w-10 h-10"
                                            className="transition-transform group-hover:scale-105"
                                        />

                                        <span className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">My Profile</span>
                                    </div>
                                    <FaArrowRightLong className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Link>
                            </div>
                        ) : (
                            <div className="mobile-link-item">
                                <Link href="/sign-in" onClick={() => setMobileNav(false)}>
                                    <Button className="w-full py-6 text-lg rounded-xl font-bold">Sign In</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                </Container>
            </div>
        </>
    )
}

export default MobileNav