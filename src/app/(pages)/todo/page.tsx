import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { TodoApp } from "./_components/todo-app";
import Container from "@/components/container";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { RecurringManager } from "./_components/reccuring-manager";

// [NEW] Import logic Scheduler & Date Helper
import { generateRecurringTodos } from "@/lib/todo-scheduler";
import { startOfDay } from "date-fns";

export const metadata: Metadata = {
  title: "Todo",
  description:
    "A simple space to list, complete, and focus on what needs to be done today — without noise or pressure.",
};

async function getInitialTodos() {
  const { userId } = await auth();
  if (!userId) return [];
  
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return [];

  await generateRecurringTodos(user.id);

  return prisma.todo.findMany({ 
    where: { 
      userId: user.id,
      
      type: "NORMAL", 
      
      OR: [
        { isCompleted: false }, 
        { 
            isCompleted: true, 
            updatedAt: { gte: startOfDay(new Date()) } 
        }
      ]
    }, 
    orderBy: { order: "asc" } 
  });
}

export default async function TodoPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const initialTodos = await getInitialTodos();

  return (
    <main className="min-h-screen bg-background text-foreground pt-28 pb-20 md:pt-32 md:pb-24">
      <Container className="max-w-4xl">
        
        <header className="mb-10 flex flex-col gap-2">
            <div className="flex justify-between items-center mb-2">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group w-fit">
                  <IoArrowBack className="group-hover:-translate-x-1 transition-transform"/> Back to Dashboard
              </Link>
              
              <RecurringManager />
            </div>
            <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-foreground">
                    Focus Tasks
                </h1>
                <p className="text-muted-foreground text-lg font-light">
                    Clear your mind, organize your work.
                </p>
            </div>
            
            <div className="h-[1px] w-full bg-border mt-6"></div>
        </header>

        {/* APP SECTION */}
        <TodoApp initialTodos={initialTodos} />
        
      </Container>
    </main>
  );
}