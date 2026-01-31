import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  // 1. Ambil user dari Clerk
  const user = await currentUser();

  // Jika entah kenapa tidak ada user (misal ditembak langsung via Postman tanpa login)
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 2. Cek apakah user sudah ada di database Neon?
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  // 3. Jika BELUM ada, buat user baru
  if (!dbUser) {
    try {
      await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0].emailAddress,
          // Gabungkan First & Last name karena di schema kamu cuma ada 'name'
          name: user.firstName ?? '',
        },
      });
    } catch (error) {
      console.error('Gagal membuat user di DB:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }

  // 4. Redirect ke Home
  // Gunakan 'req.url' untuk mendeteksi domain otomatis (localhost atau vercel.app)
  const homeUrl = new URL('/', req.url);
  return NextResponse.redirect(homeUrl);
}