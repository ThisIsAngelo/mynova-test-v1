/* eslint-disable react-hooks/purity */
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Hero from "../components/section/hero";
import { ClientLenis } from "../components/smooth-scroll-lenis/client-lenis";
export const dynamic = "force-dynamic";

export default async function Home() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      // Ambil data secukupnya saja untuk di-randomize
      wishlists: { take: 20, orderBy: { createdAt: 'desc' } },
      tips: { take: 50, orderBy: { createdAt: 'desc' } },
      goals: {
        where: { progress: { lt: 100 } }, // Ambil goal yang BELUM selesai aja biar relevan
        take: 10,
        orderBy: { updatedAt: 'desc' }
      },
    },
  });

  if (!user) redirect("/sign-in");

  // --- LOGIC RANDOMIZER ---

  // 1. Random Wishlist (Background)
  const randomWishlist = user.wishlists.length > 0
    ? user.wishlists[Math.floor(Math.random() * user.wishlists.length)]
    : undefined;

  // 2. Random Tip (Wisdom)
  const randomTip = user.tips.length > 0
    ? user.tips[Math.floor(Math.random() * user.tips.length)]
    : undefined;

  // 3. Random Goal (Tracker)
  const randomGoal = user.goals.length > 0
    ? user.goals[Math.floor(Math.random() * user.goals.length)]
    : undefined;
    
  return (
    <ClientLenis>
      <main>
        <Hero
          userParams={{ name: user.name }}
          wishlist={randomWishlist}
          tip={randomTip}
          goal={randomGoal}
        />
      </main>
    </ClientLenis>
  );
}