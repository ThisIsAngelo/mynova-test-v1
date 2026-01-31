import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { WishlistBoard } from "./_components/wishlist-board";
import Link from "next/link";
import Container from "@/components/container";
import { IoArrowBack, IoSparklesOutline } from "react-icons/io5";

export const metadata: Metadata = {
  title: "Wishlist",
  description:
    "Collect things you want to explore, learn, or experience someday — and keep your future interests visible.",
};

async function getWishlist() {
    const { userId } = await auth();
    if (!userId) return [];

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return [];

    return prisma.wishlist.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });
}

export default async function WishlistPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const data = await getWishlist();

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="pt-28 pb-20 md:pt-32 md:pb-24 px-4 sm:px-6">
                <Container className="max-w-6xl">

                    {/* HEADER */}
                    <header className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-border/40 pb-8">
                        <div className="space-y-3">
                            <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors mb-2 group cursor-pointer">
                                <IoArrowBack className="group-hover:-translate-x-1 transition-transform"/> Back to Dashboard
                            </Link>
                            
                            <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight text-foreground">
                                Dream Garage
                            </h1>
                            <p className="text-muted-foreground text-base md:text-lg max-w-lg leading-relaxed">
                                Curate your aspirations. Visualize the rewards.
                            </p>
                        </div>

                        <div className="hidden md:flex items-center gap-2 text-xs font-mono font-medium text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border">
                            <IoSparklesOutline className="text-primary" />
                            <span>MANIFESTATION MODE</span>
                        </div>
                    </header>

                    {/* BOARD CONTENT */}
                    <WishlistBoard initialData={data} />

                </Container>
            </div>
        </main>
    );
}