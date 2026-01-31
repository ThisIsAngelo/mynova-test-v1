import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const adminId = process.env.CLERK_ADMIN_ID

  // Proteksi Route (Logic Utama)
  if (!isPublicRoute(req)) {
    // 1. Cek apakah user login? Kalau belum, suruh login.
    await auth.protect()

    // 2. SAFETY LOCK:
    // Jika user yang login ID-nya BUKAN ID Admin, langsung tendang.
    if (userId && userId !== adminId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
      
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}