import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Diwali", icon: "🪔", order: 1 },
  { name: "Holi", icon: "🎨", order: 2 },
  { name: "Raksha Bandhan", icon: "🎀", order: 3 },
  { name: "Janmashtami", icon: "🦚", order: 4 },
  { name: "Ganesh Chaturthi", icon: "🐘", order: 5 },
  { name: "Navratri", icon: "💃", order: 6 },
  { name: "Republic Day", icon: "🇮🇳", order: 7 },
  { name: "Independence Day", icon: "🏳️", order: 8 },
  { name: "Christmas", icon: "🎄", order: 9 },
  { name: "New Year", icon: "🎉", order: 10 },
  { name: "Eid", icon: "🌙", order: 11 },
  { name: "Guru Purnima", icon: "🙏", order: 12 },
  { name: "Mahashivratri", icon: "🔱", order: 13 },
  { name: "Mother's Day", icon: "👩", order: 14 },
  { name: "Father's Day", icon: "👨", order: 15 },
  { name: "Women's Day", icon: "👩‍🦯", order: 16 },
  { name: "Business Promotions", icon: "📢", order: 17 },
  { name: "Birthday", icon: "🎂", order: 18 },
  { name: "Anniversary", icon: "💑", order: 19 },
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@festcard.com" },
    update: {},
    create: {
      email: "admin@festcard.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create demo user
  const userPassword = await bcrypt.hash("user123", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@festcard.com" },
    update: {},
    create: {
      email: "demo@festcard.com",
      password: userPassword,
      name: "Demo User",
      role: "USER",
      status: "ACTIVE",
      businessProfile: {
        create: {
          businessName: "Demo Enterprises",
          ownerName: "Demo Owner",
          phone: "+91 98765 43210",
          email: "demo@business.com",
          website: "www.demoenterprise.com",
          address: "123 Main Street, Mumbai, Maharashtra",
          tagline: "Quality You Can Trust",
          instagram: "@demoenterprise",
        },
      },
    },
  });
  console.log("✅ Demo user created:", demoUser.email);

  // Create categories
  for (const cat of CATEGORIES) {
    const slug = slugify(cat.name);
    await prisma.festivalCategory.upsert({
      where: { slug },
      update: { icon: cat.icon, order: cat.order },
      create: {
        name: cat.name,
        slug,
        icon: cat.icon,
        order: cat.order,
        isVisible: true,
        description: `Beautiful ${cat.name} festival card templates for your business`,
      },
    });
  }
  console.log(`✅ ${CATEGORIES.length} categories created`);

  // Create sample festival cards
  const diwaliCat = await prisma.festivalCategory.findUnique({ where: { slug: "diwali" } });
  const newYearCat = await prisma.festivalCategory.findUnique({ where: { slug: "new-year" } });
  const christmasCat = await prisma.festivalCategory.findUnique({ where: { slug: "christmas" } });

  const sampleCards = [
    {
      title: "Diwali Gold Elegance",
      categoryId: diwaliCat!.id,
      thumbnail: "https://images.unsplash.com/photo-1604514628550-37477afdf4e3?w=400&h=400&fit=crop",
      highResImage: "https://images.unsplash.com/photo-1604514628550-37477afdf4e3?w=1200&h=1200&fit=crop",
      primaryColor: "#D97706",
      secondaryColor: "#FEF3C7",
      status: "PUBLISHED" as const,
      isTrending: true,
      isFeatured: true,
      tags: ["diwali", "gold", "elegant", "festival"],
      logoX: 300, logoY: 80, logoWidth: 120, logoHeight: 120,
      businessNameX: 40, businessNameY: 230, businessNameFontSize: 28,
      businessNameColor: "#92400E",
      phoneX: 40, phoneY: 275, phoneColor: "#78350F",
      emailX: 40, emailY: 305, emailColor: "#78350F",
      websiteX: 40, websiteY: 335, websiteColor: "#78350F",
      addressX: 40, addressY: 365, addressColor: "#92400E",
      taglineX: 40, taglineY: 200, taglineColor: "#D97706",
      downloadCount: 234,
    },
    {
      title: "Happy New Year Sparkle",
      categoryId: newYearCat!.id,
      thumbnail: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&h=400&fit=crop",
      highResImage: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1200&h=1200&fit=crop",
      primaryColor: "#1E40AF",
      secondaryColor: "#DBEAFE",
      status: "PUBLISHED" as const,
      isTrending: true,
      tags: ["new year", "celebration", "fireworks"],
      logoX: 280, logoY: 60, logoWidth: 130, logoHeight: 130,
      businessNameX: 40, businessNameY: 240, businessNameFontSize: 26,
      businessNameColor: "#FFFFFF",
      phoneX: 40, phoneY: 285, phoneColor: "#BFDBFE",
      emailX: 40, emailY: 315, emailColor: "#BFDBFE",
      websiteX: 40, websiteY: 345, websiteColor: "#BFDBFE",
      addressX: 40, addressY: 375, addressColor: "#DBEAFE",
      taglineX: 40, taglineY: 210, taglineColor: "#93C5FD",
      downloadCount: 189,
    },
    {
      title: "Merry Christmas Joy",
      categoryId: christmasCat!.id,
      thumbnail: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&h=400&fit=crop",
      highResImage: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&h=1200&fit=crop",
      primaryColor: "#166534",
      secondaryColor: "#DCFCE7",
      status: "PUBLISHED" as const,
      isFeatured: true,
      tags: ["christmas", "joy", "holiday", "celebration"],
      logoX: 290, logoY: 70, logoWidth: 120, logoHeight: 120,
      businessNameX: 40, businessNameY: 235, businessNameFontSize: 24,
      businessNameColor: "#FFFFFF",
      phoneX: 40, phoneY: 275, phoneColor: "#BBF7D0",
      emailX: 40, emailY: 305, emailColor: "#BBF7D0",
      websiteX: 40, websiteY: 335, websiteColor: "#BBF7D0",
      addressX: 40, addressY: 365, addressColor: "#DCFCE7",
      taglineX: 40, taglineY: 205, taglineColor: "#86EFAC",
      downloadCount: 156,
    },
  ];

  for (const card of sampleCards) {
    await prisma.festivalCard.create({ data: card });
  }
  console.log(`✅ ${sampleCards.length} sample cards created`);

  console.log("\n🎉 Seeding complete!");
  console.log("📧 Admin: admin@festcard.com / admin123");
  console.log("📧 User:  demo@festcard.com / user123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
