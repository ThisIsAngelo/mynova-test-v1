"use client"

import Container from "@/components/container"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { cn } from "@/lib/utils"
import { useClerk } from "@clerk/nextjs"
import gsap from "gsap"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { BiMenuAltRight } from "react-icons/bi"
import { AvatarFrame } from "../ui/avatar-frame"
import { NovaCoinBadge } from "../ui/nova-coin"
import { navLinks } from "./data"
import MobileNav from "./mobile-nav"

// [NEW] Interface Minimal untuk Navbar Data
interface NavbarUserData {
    activeAvatar: string;
    activeFrame: string;
}

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [mobileNav, setMobileNav] = useState(false)
    const [userData, setUserData] = useState<NavbarUserData | null>(null); // [NEW]

    const pathname = usePathname();
    const navRef = useRef(null);
    const clerk = useClerk();

    // [NEW] Fetch User Data untuk Avatar
    useEffect(() => {
        const fetchNavData = async () => {
            if (!clerk.user) return;
            try {
                // Kita panggil API profile yang sudah ada
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    setUserData({
                        activeAvatar: data.activeAvatar,
                        activeFrame: data.activeFrame
                    });
                }
            } catch (e) { console.error("Nav fetch error", e); }
        };

        // Panggil saat mount, dan idealnya saat pathname berubah (jika user habis dari shop/profile)
        fetchNavData();
    }, [clerk.user, pathname]); // Re-fetch saat pindah halaman biar update

    // --- ANIMASI ENTRY ---
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".nav-item",
                { y: -30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.05, ease: "power3.out", delay: 0.2 }
            );
        }, navRef);
        return () => ctx.revert();
    }, []);

    // --- SCROLL LOGIC ---
    useEffect(() => {
        let lastScrollY = 0;
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsScrolled(currentScrollY > 20);
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsHidden(true);
            } else {
                setIsHidden(false);
            }
            lastScrollY = currentScrollY;
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // [LOGIC] Tentukan gambar final (Custom -> Clerk -> Placeholder)
    const displayImage = userData?.activeAvatar || clerk.user?.imageUrl || "/avatars/default.png";
    const activeFrame = userData?.activeFrame || "none";

    return (
        <>
            <header
                ref={navRef}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    isScrolled ? "py-3 bg-background/80 backdrop-blur-xl shadow-sm" : "py-6 bg-transparent"
                )}
                style={{ transform: isHidden ? "translateY(-100%)" : "translateY(0%)" }}
            >
                <Container>
                    <nav className="flex items-center justify-between">

                        {/* --- LOGO --- */}
                        <div className="nav-item flex items-center">
                            <Link href="/" className="group relative flex items-center gap-2">
                                <span className="font-heading text-xl font-bold tracking-tighter text-foreground">
                                    MyNova
                                </span>
                                <span className="h-1.5 w-1.5 rounded-full bg-primary transition-transform duration-300 group-hover:scale-150" />
                            </Link>
                        </div>

                        {/* --- DESKTOP MENU --- */}
                        <div className="hidden lg:flex items-center gap-1 bg-secondary/30 rounded-full px-2 py-1.5 border border-border/50 backdrop-blur-sm nav-item">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                                            isActive
                                                ? "text-primary-foreground bg-primary shadow-md"
                                                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* --- ACTIONS --- */}
                        <div className="flex items-center gap-3">
                            <div className="nav-item hidden sm:block">
                                <Link href="/shop">
                                    <NovaCoinBadge />
                                </Link>
                            </div>
                            <div className="nav-item hidden sm:block">
                                <ModeToggle />
                            </div>

                            {/* --- PROFILE AVATAR (DESKTOP) --- */}
                            <Link href="/profile" className="nav-item hidden lg:block">
                                <AvatarFrame
                                    src={displayImage}
                                    alt="Profile"
                                    frameAsset={activeFrame}
                                    sizeClass="w-10 h-10"
                                    className="transition-transform group-hover:scale-105"
                                />
                            </Link>

                            {/* --- MOBILE TOGGLE --- */}
                            <button
                                onClick={() => setMobileNav(true)}
                                className="nav-item lg:hidden text-foreground hover:bg-secondary rounded-full transition-colors cursor-pointer group"
                            >
                                <BiMenuAltRight className="w-7 h-7 group-hover:rotate-180 transition-transform duration-500" />
                            </button>
                        </div>

                    </nav>
                </Container>
            </header>

            {/* --- MOBILE NAV (Pass data) --- */}
            <MobileNav
                mobileNav={mobileNav}
                setMobileNav={setMobileNav}
                customAvatar={displayImage}
                customFrame={activeFrame}
            />
        </>
    )
}

export default Navbar