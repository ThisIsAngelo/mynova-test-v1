import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { extractHeadings } from "@/lib/note-helper";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const note = await prisma.note.findUnique({
      where: { id },
    });

    return NextResponse.json(note);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}


// NOTE (AUTO-SAVE) WITH METADATA EXTRACTION
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { title, content } = body;

    // Ekstraksi Metadata Heading
    // Jika content ada update, kita hitung ulang heading-nya
    let headingsData = undefined;
    if (content) {
        headingsData = extractHeadings(content);
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
        // Update headings jika content berubah
        ...(headingsData && { headings: headingsData }), 
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error(error); // Debugging
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const note = await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json(note);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}