import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { generateRecurringTodos } from "@/lib/todo-scheduler";
import { startOfDay } from "date-fns";

// Helper User Auth (Tetap sama)
async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  return user;
}

// GET: Ambil Todo + Trigger Scheduler
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // 1. Trigger Scheduler (Pastikan task hari ini dibuat dulu)
    await generateRecurringTodos(user.id);

    // [UPDATED] Logic Filtering "Clean Dashboard"
    const todos = await prisma.todo.findMany({
      where: { 
        userId: user.id,
        type: "NORMAL",
        // Logic: Tampilkan jika (Belum Selesai) ATAU (Selesai TAPI baru hari ini)
        OR: [
            { isCompleted: false }, 
            { 
                isCompleted: true, 
                updatedAt: { gte: startOfDay(new Date()) } // Hanya yang diupdate hari ini
            }
        ]
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error("[API_TODO_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { title, description, type } = body;

    if (!title || title.trim().length === 0) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const todoType = type || "NORMAL";

    // 1. Buat TODO Utama (Bisa jadi NORMAL atau TEMPLATE)
    const newTodo = await prisma.todo.create({
      data: {
        title: title.trim(),
        description: description || null,
        userId: user.id,
        type: todoType,
        // Jika Template, lastGeneratedAt kita isi NOW agar scheduler besok tidak bingung
        lastGeneratedAt: todoType !== "NORMAL" ? new Date() : null, 
      },
    });

    // 2. [LOGIC BARU] Jika ini Template (Daily/Weekly), LANGSUNG buatkan anak pertamanya!
    if (todoType !== "NORMAL") {
        const firstInstance = await prisma.todo.create({
            data: {
                title: newTodo.title,
                description: newTodo.description,
                userId: user.id,
                type: "NORMAL", // Anak selalu NORMAL
                sourceId: newTodo.id, // Link ke Bapaknya
                order: 0,
            }
        });

        // KEMBALIKAN SI ANAK ke Frontend biar langsung muncul di list!
        return NextResponse.json(firstInstance, { status: 201 });
    }

    // Jika tipe NORMAL, kembalikan dirinya sendiri
    return NextResponse.json(newTodo, { status: 201 });

  } catch (error) {
    console.error("[API_TODO_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}