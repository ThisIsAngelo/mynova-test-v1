import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) return new NextResponse("User not found", { status: 404 });

        // Ambil yang BUKAN NORMAL (artinya template)
        const templates = await prisma.todo.findMany({
            where: {
                userId: user.id,
                type: { not: "NORMAL" },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(templates);
    } catch (error) {
        return new NextResponse("Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const body = await req.json();
        const { id, title, type } = body;

        if (!id || !title || !type) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) return new NextResponse("User not found", { status: 404 });

        // Cek data lama dulu
        const existingTemplate = await prisma.todo.findUnique({
            where: { id, userId: user.id }
        });

        if (!existingTemplate) return new NextResponse("Not found", { status: 404 });

        // Logic Reset: Jika Tipe berubah, reset lastGeneratedAt biar langsung trigger next run
        const shouldResetTimer = existingTemplate.type !== type;

        const updatedTemplate = await prisma.todo.update({
            where: { id },
            data: {
                title: title.trim(),
                type: type, // DAILY, WEEKLY, etc.
                // Jika tipe berubah, set null. Jika tidak, biarkan tetap (undefined artinya gak diupdate)
                lastGeneratedAt: shouldResetTimer ? null : undefined 
            }
        });

        return NextResponse.json(updatedTemplate);
    } catch (error) {
        console.error("[TEMPLATE_PATCH]", error);
        return new NextResponse("Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });
        
        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) return new NextResponse("User not found", { status: 404 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return new NextResponse("ID Required", { status: 400 });


        // Hapus Template (Anak-anak yg sudah lahir TIDAK ikut terhapus karena sejarah)
        // Kecuali kita set onDelete Cascade di prisma, tapi aman begini dulu.
        await prisma.todo.delete({
            where: { id, userId: user.id, },
            
        });

        return new NextResponse("Deleted", { status: 200 });
    } catch (error) {
        return new NextResponse("Error", { status: 500 });
    }
}