import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { VisionBoard } from "./_components/vision-board";
import Link from "next/link";
import Container from "@/components/container";
import { IoArrowBack } from "react-icons/io5";

export const metadata: Metadata = {
  title: "Vision",
  description:
    "Define your long-term goals and capture meaningful ideas. Break big visions into clear, manageable steps.",
};

async function getData() {
  const { userId } = await auth();
  if (!userId) return { goals: [], ideas: [] };

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return { goals: [], ideas: [] };

  const [goals, ideas] = await Promise.all([
    prisma.goal.findMany({ 
        where: { userId: user.id }, 
        orderBy: { createdAt: "desc" } 
    }),
    prisma.idea.findMany({ 
        where: { userId: user.id }, 
        orderBy: { createdAt: "desc" } 
    }),
  ]);

  return { goals, ideas };
}

export default async function VisionPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { goals, ideas } = await getData();

  return (
    <main className="min-h-screen bg-background text-foreground pt-28 pb-20 md:pt-32 md:pb-24 px-4 sm:px-6">
      <Container className="max-w-6xl">
        
        {/* HEADER */}
        <header className="mb-12 flex flex-col gap-2">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2 group w-fit cursor-pointer">
                <IoArrowBack className="group-hover:-translate-x-1 transition-transform"/> Back to Dashboard
            </Link>
            
            <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-foreground inline-block">
                    The Blueprint
                </h1>
                <p className="text-muted-foreground text-lg font-light tracking-wide">
                    Design your future, capture your ideas.
                </p>
            </div>
            
            <div className="h-[1px] w-full bg-border mt-6"></div>
        </header>

        {/* BOARD */}
        <VisionBoard initialGoals={goals} initialIdeas={ideas} />
        
      </Container>
    </main>
  );
}