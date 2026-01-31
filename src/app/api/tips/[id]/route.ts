import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const user = await prisma.user.findUnique({ where: { clerkId: userId } });
        if (!user) return new NextResponse("User not found", { status: 404 });

        const { id } = await params;
        const { content, source } = await req.json();

        const updatedTip = await prisma.tip.update({
            where: {
                id,
                userId: user.id // Security check
            },
            data: {
                content,
                source
            },
        });

        return NextResponse.json(updatedTip);
    } catch (error) {
        console.error("[TIP_UPDATE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}