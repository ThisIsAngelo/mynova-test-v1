import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });;

async function main() {
  console.log("🌱 Seeding Premium Shop Items...");

  // --- 1. AVATARS (Static Images) ---
  // Note: User akan menyiapkan file png-nya di folder public/assets/images/avatars/
  
  const avatars = [
    {
      id: "avatar-default",
      name: "Novice Dreamer",
      desc: "The default look for every new journey.",
      price: 0,
      asset: "/assets/images/avatars/default.jpg",
      isDefault: true,
    },
    {
      id: "avatar-coder",
      name: "Cyber Architect",
      desc: "For those who build the future with code.",
      price: 500,
      asset: "/assets/images/avatars/avatar-coder.png",
      isDefault: false,
    },
    {
      id: "avatar-zen",
      name: "Mindful Spirit",
      desc: "Calmness in the midst of chaos.",
      price: 1000,
      asset: "/assets/images/avatars/avatar-zen.png",
      isDefault: false,
    },
    {
      id: "avatar-artist",
      name: "Abstract Creative",
      desc: "Seeing the world through shapes and colors.",
      price: 2500,
      asset: "/assets/images/avatars/avatar-artist.png",
      isDefault: false,
    },
    {
      id: "avatar-founder",
      name: "The Visionary",
      desc: "A look for those who lead the way.",
      price: 5000,
      asset: "/assets/images/avatars/avatar-founder.png",
      isDefault: false,
    },
  ];

  for (const avatar of avatars) {
    await prisma.shopItem.upsert({
      where: { id: avatar.id },
      update: {},
      create: {
        id: avatar.id,
        type: "AVATAR",
        name: avatar.name,
        description: avatar.desc,
        price: avatar.price,
        asset: avatar.asset,
        isDefault: avatar.isDefault,
      },
    });
  }

  // --- 2. FRAMES (CSS/Tailwind Animations) ---
  // Kita gunakan 'asset' sebagai KEY untuk memanggil class Tailwind nanti
  
  const frames = [
    {
      id: "frame-minimal",
      name: "Clean Slate",
      desc: "A subtle, clean border for the minimalist.",
      price: 200,
      asset: "minimal", // Key: Simple border
    },
    {
      id: "frame-neon",
      name: "Cyber Pulse",
      desc: "A high-contrast neon glow that breathes.",
      price: 800,
      asset: "neon", // Key: Blue/Cyan glow animation
    },
    {
      id: "frame-gradient",
      name: "Aurora Borealis",
      desc: "A shifting gradient of vivid colors.",
      price: 1500,
      asset: "gradient", // Key: Rotating gradient border
    },
    {
      id: "frame-glass",
      name: "Crystal Prism",
      desc: "Premium glassmorphism with light refraction.",
      price: 3000,
      asset: "glass", // Key: Backdrop blur + white shine
    },
    {
      id: "frame-golden",
      name: "Midas Touch",
      desc: "Radiating pure gold energy. The ultimate flex.",
      price: 10000,
      asset: "gold", // Key: Golden shine + particles effect
    },
    {
      id: "frame-orbit",
      name: "Solar Orbit",
      desc: "A satellite orbiting your profile in perfect harmony.",
      price: 600,
      asset: "orbit", // Key: Thin ring + orbiting dot
    },
    {
      id: "frame-blob",
      name: "Liquid Spirit",
      desc: "An organic, morphing shape that flows like water.",
      price: 1200,
      asset: "blob", // Key: Animated border-radius
    },
    {
      id: "frame-tech",
      name: "System Core",
      desc: "Precision engineering with rotating data rings.",
      price: 1800,
      asset: "tech", // Key: Double dashed rings (Upgrade dari default user)
    },
    {
      id: "frame-brutalist",
      name: "Bold Shift",
      desc: "High contrast offset shadow for the modern minimalist.",
      price: 900,
      asset: "brutalist", // Key: Hard offset shadow animation
    },
    {
      id: "frame-eclipse",
      name: "Lunar Eclipse",
      desc: "Soft shadow play mimicking the phases of the moon.",
      price: 2200,
      asset: "eclipse", // Key: Moving soft shadow
    },
  ];

  for (const frame of frames) {
    await prisma.shopItem.upsert({
      where: { id: frame.id },
      update: {},
      create: {
        id: frame.id,
        type: "FRAME",
        name: frame.name,
        description: frame.desc,
        price: frame.price,
        asset: frame.asset,
        isDefault: false,
      },
    });
  }

  console.log("✅ Premium Shop Seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });