/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// GET ALL NOTES (WITH SEARCH)
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    const whereClause: any = {
      userId: userId
    };

    if (query) {
      whereClause.title = { 
        contains: query, 
        mode: 'insensitive' 
      };
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST (CREATE) - Update sedikit untuk inisialisasi headings
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const body = await req.json();
    const { title, content } = body;

    const note = await prisma.note.create({
      data: {
        title: title || "Untitled Note",
        content: content || "",
        userId: user.id,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}