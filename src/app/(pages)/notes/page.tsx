/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { NotesBoard } from "./_components/notes-board";
import Link from "next/link";
import Container from "@/components/container";
import { IoArrowBack, IoReaderOutline } from "react-icons/io5";
import { NoteSearch } from "./_components/note-search";
import { Suspense } from "react"; // [NEW] Import Suspense
import { NotesSkeleton } from "./_components/notes-skeleton"; // [NEW] Import Skeleton

export const metadata: Metadata = {
  title: "Notes",
  description: "A lightweight space for quick thoughts...",
};

// --- [1] SERVER COMPONENT KHUSUS DATA FETCHING ---
// Kita pisah logic ini biar bisa dibungkus Suspense
async function NotesList({ query }: { query: string }) {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return null;

  // Simulate network delay (optional, biar kelihatan loadingnya kalau local)
  // await new Promise((resolve) => setTimeout(resolve, 1000));

  const whereClause: any = { userId: user.id };
  
  if (query) {
    whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        // { content: { contains: query, mode: 'insensitive' } },
    ];
  }

  const notes = await prisma.note.findMany({
    where: whereClause,
    orderBy: { updatedAt: "desc" },
  });

  // Render Client Component
  return (
    <>
      {/* Hidden Counter untuk Header (Opsional: Butuh trik lain kalau mau update counter di header realtime) */}
      <NotesBoard initialNotes={notes} />
    </>
  );
}

// --- [2] MAIN PAGE (SHELL) ---
export default async function NotesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const query = params?.q || "";

  return (
    <main className="min-h-screen bg-background text-foreground pt-28 pb-20 md:pt-32 md:pb-24 px-4 sm:px-6">
      <Container className="max-w-6xl">

        {/* HEADER */}
        <header className="mb-12 flex flex-col gap-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-fit group cursor-pointer px-3 py-1.5 rounded-full border border-transparent hover:border-border/50 hover:bg-muted/50">
            <IoArrowBack className="group-hover:-translate-x-1 transition-transform"/> Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight text-foreground">
                Writer&apos;s Desk
              </h1>
              <p className="text-muted-foreground text-base md:text-lg font-light max-w-md leading-relaxed">
                A clean space for your drafts, fleeting ideas, and master plans.
              </p>
            </div>
            
            <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                <NoteSearch />
                
            </div>
          </div>
        </header>

        {/* CONTENT WITH SUSPENSE */}
        {/* Key={query} memaksa React me-reset Suspense setiap kali user ngetik search baru */}
        <Suspense key={query} fallback={<NotesSkeleton />}>
            <NotesList query={query} />
        </Suspense>

      </Container>
    </main>
  );
}