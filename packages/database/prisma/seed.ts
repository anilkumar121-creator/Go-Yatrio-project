import { PrismaClient, PackageType, VehicleType, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin.dev@goyatrio.local";
  const password = process.env.ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe.dev.only.123";
  const passwordHash = await hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: "GoYatrio Dev Admin", passwordHash, role: UserRole.ADMIN, isActive: true },
    create: {
      name: "GoYatrio Dev Admin",
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const kerala = await prisma.destination.upsert({
    where: { slug: "demo-kerala" },
    update: {},
    create: {
      name: "Demo Kerala",
      slug: "demo-kerala",
      shortDescription: "Development sample destination for Kerala inquiries.",
      description: "Demo data for local development only. Replace before production use.",
      country: "India",
      state: "Kerala",
      isFeatured: true,
      seoTitle: "Demo Kerala Travel Packages",
      seoDescription: "Development sample SEO metadata for Kerala.",
    },
  });

  const rajasthan = await prisma.destination.upsert({
    where: { slug: "demo-rajasthan" },
    update: {},
    create: {
      name: "Demo Rajasthan",
      slug: "demo-rajasthan",
      shortDescription: "Development sample destination for Rajasthan inquiries.",
      description: "Demo data for local development only. Replace before production use.",
      country: "India",
      state: "Rajasthan",
      isFeatured: true,
    },
  });

  const keralaPackage = await prisma.tourPackage.upsert({
    where: { slug: "demo-kerala-escape" },
    update: {},
    create: {
      title: "Demo Kerala Escape",
      slug: "demo-kerala-escape",
      shortDescription: "Development sample domestic package.",
      description: "Demo package data for backend development only.",
      destinationId: kerala.id,
      durationDays: 5,
      durationNights: 4,
      priceFrom: 24999,
      packageType: PackageType.DOMESTIC,
      isFeatured: true,
    },
  });

  await prisma.tourPackage.upsert({
    where: { slug: "demo-rajasthan-royal-trail" },
    update: {},
    create: {
      title: "Demo Rajasthan Royal Trail",
      slug: "demo-rajasthan-royal-trail",
      shortDescription: "Development sample luxury package.",
      description: "Demo package data for backend development only.",
      destinationId: rajasthan.id,
      durationDays: 6,
      durationNights: 5,
      priceFrom: 34999,
      packageType: PackageType.LUXURY,
      isFeatured: false,
    },
  });

  await prisma.itinerary.createMany({
    data: [
      {
        packageId: keralaPackage.id,
        dayNumber: 1,
        title: "Demo Arrival",
        description: "Development sample itinerary day.",
        meals: "Dinner",
      },
      {
        packageId: keralaPackage.id,
        dayNumber: 2,
        title: "Demo Local Experience",
        description: "Development sample itinerary day.",
        meals: "Breakfast",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.hotel.upsert({
    where: { slug: "demo-kerala-resort" },
    update: {},
    create: {
      name: "Demo Kerala Resort",
      slug: "demo-kerala-resort",
      destinationId: kerala.id,
      description: "Development sample hotel.",
      address: "Demo address, Kerala",
      category: "4 Star",
      priceFrom: 5999,
    },
  });

  await prisma.vehicle.createMany({
    data: [
      {
        vehicleName: "Demo Sedan",
        vehicleType: VehicleType.SEDAN,
        description: "Development sample vehicle.",
        capacity: 4,
        priceFrom: 2500,
      },
      {
        vehicleName: "Demo Tempo Traveller",
        vehicleType: VehicleType.TEMPO_TRAVELLER,
        description: "Development sample vehicle.",
        capacity: 12,
        priceFrom: 8500,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.blog.upsert({
    where: { slug: "demo-travel-planning-guide" },
    update: {},
    create: {
      title: "Demo Travel Planning Guide",
      slug: "demo-travel-planning-guide",
      excerpt: "Development sample blog excerpt.",
      content: "Development sample blog content. Replace before production use.",
      author: "GoYatrio Team",
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  console.log(`Seed complete. Development admin: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });