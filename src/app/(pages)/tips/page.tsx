import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { TipsBoard } from "./_components/tips-board";
import Link from "next/link";
import Container from "@/components//container";
import { IoArrowBack, IoBulbOutline } from "react-icons/io5";

export const metadata: Metadata = {
  title: "Tips",
  description:
    "Store personal tips, reminders, and small insights so they don’t get lost and can resurface when you need them.",
};

async function getTips() {
    const { userId } = await auth();
    if (!userId) return [];

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return [];

    return prisma.tip.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    });
}

export default async function TipsPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const tips = await getTips();

    return (
        <main className="min-h-screen bg-background text-foreground pt-28 pb-20 md:pt-32 md:pb-24 px-4 sm:px-6">
            <Container className="max-w-5xl">

                <header className="mb-12 flex flex-col gap-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit group cursor-pointer">
                        <IoArrowBack className="group-hover:-translate-x-1 transition-transform"/> Back to Dashboard
                    </Link>

                    <div className="flex items-end justify-between border-b border-border/60 pb-6">
                        <div className="space-y-1">
                            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-foreground">
                                Knowledge Base
                            </h1>
                            <p className="text-muted-foreground text-lg font-light">
                                A collection of wisdom, hacks, and snippets.
                            </p>
                        </div>
                        <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
                            <IoBulbOutline size={24} />
                        </div>
                    </div>
                </header>

                <TipsBoard initialTips={tips} />

            </Container>
        </main>
    );
}