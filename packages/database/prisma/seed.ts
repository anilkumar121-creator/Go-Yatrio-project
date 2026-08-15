import { PrismaClient, DestinationStatus, PackageType, VehicleType, UserRole } from "@prisma/client";
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

  const destinationSeeds = [
    {
      slug: "goa",
      name: "Goa",
      state: "Goa",
      shortDescription: "Sun-kissed golden beaches, vibrant nightlife, Portuguese heritage, and thrilling watersports.",
      description:
        "Goa is India's most popular beach destination, offering a unique blend of Portuguese colonial heritage, palm-fringed beaches, bustling night markets, and lively beach shacks. From the historic churches of Old Goa to the sunsets of Palolem, Goa promises a vacation packed with sun, sand, seafood, and celebration.",
      featuredImage: "",
      featured: true,
      status: DestinationStatus.PUBLISHED,
      metaTitle: "Goa Holiday Packages | Best Goa Tour Packages | GoYatrio",
      metaDescription: "Explore Goa beach holidays with GoYatrio. Book customized Goa tour packages, resorts, and cab services at the best prices.",
    },
    {
      slug: "kerala",
      name: "Kerala",
      state: "Kerala",
      shortDescription: "God's Own Country with tranquil backwaters, misty hill stations, spice plantations, and Ayurveda wellness.",
      description:
        "Kerala is a tropical paradise known for its serene backwaters, lush green hill stations, pristine beaches, and rich cultural heritage. Cruise the Alleppey backwaters on a traditional houseboat, explore the tea gardens of Munnar, and experience rejuvenating Ayurvedic therapies in Kovalam.",
      featuredImage: "",
      featured: true,
      status: DestinationStatus.PUBLISHED,
      metaTitle: "Kerala Tour Packages | Kerala Backwaters & Hill Stations | GoYatrio",
      metaDescription: "Book Kerala tour packages with GoYatrio. Experience backwater houseboats, Munnar tea hills, and Ayurveda wellness retreats.",
    },
    {
      slug: "kashmir",
      name: "Kashmir",
      state: "Jammu & Kashmir",
      shortDescription: "Paradise on Earth featuring snow-capped Himalayas, serene Dal Lake shikaras, and Gulmarg meadows.",
      description:
        "Kashmir is often described as paradise on earth. From the tranquil waters of Dal Lake and the floating gardens of Srinagar to the alpine meadows of Gulmarg and the saffron fields of Pampore, Kashmir offers breathtaking landscapes, warm hospitality, and unforgettable shikara rides.",
      featuredImage: "",
      featured: true,
      status: DestinationStatus.PUBLISHED,
      metaTitle: "Kashmir Tour Packages | Srinagar & Gulmarg Holidays | GoYatrio",
      metaDescription: "Discover Kashmir with GoYatrio. Book Srinagar houseboat stays, Gulmarg excursions, and complete Kashmir holiday packages.",
    },
    {
      slug: "andaman",
      name: "Andaman",
      state: "Andaman & Nicobar Islands",
      shortDescription: "Exotic tropical islands with turquoise waters, coral reefs, and pristine white-sand beaches.",
      description:
        "The Andaman Islands are an archipelago of more than 300 islands offering some of India's most pristine beaches, crystal-clear turquoise waters, vibrant coral reefs, and fascinating colonial history. Explore Cellular Jail in Port Blair, snorkel in Havelock, and unwind on the white sands of Radhanagar Beach.",
      featuredImage: "",
      featured: true,
      status: DestinationStatus.PUBLISHED,
      metaTitle: "Andaman Tour Packages | Havelock & Port Blair Holidays | GoYatrio",
      metaDescription: "Plan your Andaman island vacation with GoYatrio. Book Havelock beach tours, snorkeling adventures, and island hopping packages.",
    },
    {
      slug: "leh-ladakh",
      name: "Leh Ladakh",
      state: "Ladakh",
      shortDescription: "High-altitude desert adventure with dramatic mountain passes, monasteries, and starry skies.",
      description:
        "Leh Ladakh is a high-altitude desert adventure paradise featuring dramatic mountain passes like Khardung La, ancient Buddhist monasteries, surreal Pangong Lake, and some of the world's most scenic driving routes. Perfect for adventure seekers, bikers, and photographers.",
      featuredImage: "",
      featured: true,
      status: DestinationStatus.PUBLISHED,
      metaTitle: "Leh Ladakh Tour Packages | Ladakh Bike Tours | GoYatrio",
      metaDescription: "Book Leh Ladakh tour packages with GoYatrio. Experience Pangong Lake, Nubra Valley, Khardung La, and Buddhist monasteries.",
    },
    {
      slug: "jaipur",
      name: "Jaipur",
      state: "Rajasthan",
      shortDescription: "The Pink City of India with royal palaces, majestic forts, and vibrant bazaars.",
      description:
        "Jaipur, the capital of Rajasthan, is known as the Pink City for its distinct terracotta-pink buildings. Explore the magnificent Amber Fort, the astronomical marvel of Jantar Mantar, the royal City Palace, and shop for traditional textiles and jewellery in the bustling bazaars.",
      featuredImage: "",
      featured: true,
      status: DestinationStatus.PUBLISHED,
      metaTitle: "Jaipur Tour Packages | Pink City Rajasthan Tours | GoYatrio",
      metaDescription: "Discover Jaipur with GoYatrio. Book Pink City heritage tours, Amber Fort excursions, and Rajasthan royal experiences.",
    },
    {
      slug: "varanasi",
      name: "Varanasi",
      state: "Uttar Pradesh",
      shortDescription: "India's spiritual capital on the banks of the Ganges with ancient ghats and sacred rituals.",
      description:
        "Varanasi is one of the world's oldest living cities and India's spiritual capital. Witness the mesmerizing Ganga Aarti at Dashashwamedh Ghat, take a sunrise boat ride along the sacred Ganges, and explore the narrow lanes filled with ancient temples and traditional crafts.",
      featuredImage: "",
      featured: false,
      status: DestinationStatus.PUBLISHED,
      metaTitle: "Varanasi Tour Packages | Spiritual Ganges Tours | GoYatrio",
      metaDescription: "Experience the spiritual heart of India with GoYatrio. Book Varanasi temple tours, Ganga Aarti experiences, and heritage walks.",
    },
    {
      slug: "rann-of-kutch",
      name: "Rann of Kutch",
      state: "Gujarat",
      shortDescription: "The Great White Desert with the spectacular Rann Utsav festival and vibrant craft villages.",
      description:
        "The Rann of Kutch is a seasonal salt marsh that transforms into the surreal Great White Desert. During the annual Rann Utsav, the region comes alive with cultural performances, traditional handicrafts, luxury tent stays, and unforgettable desert sunsets.",
      featuredImage: "",
      featured: false,
      status: DestinationStatus.PUBLISHED,
      metaTitle: "Rann of Kutch Tour Packages | Rann Utsav Gujarat | GoYatrio",
      metaDescription: "Book Rann of Kutch packages with GoYatrio. Experience Rann Utsav, white desert sunsets, and Kutch craft villages.",
    },
    {
      slug: "ooty",
      name: "Ooty",
      state: "Tamil Nadu",
      shortDescription: "Queen of Hill Stations with rolling tea gardens, colonial charm, and scenic toy train rides.",
      description:
        "Ooty, nestled in the Nilgiri Hills, is a classic British-era hill station known for its lush tea gardens, serene lakes, botanical gardens, and the charming Nilgiri Mountain Railway toy train. A perfect escape for families and nature lovers.",
      featuredImage: "",
      featured: false,
      status: DestinationStatus.PUBLISHED,
      metaTitle: "Ooty Tour Packages | Nilgiri Hills Getaways | GoYatrio",
      metaDescription: "Plan a relaxing Ooty hill station holiday with GoYatrio. Book tea garden tours, toy train rides, and lake resorts.",
    },
    {
      slug: "darjeeling",
      name: "Darjeeling",
      state: "West Bengal",
      shortDescription: "Tea capital of India with Himalayan views, heritage toy trains, and misty monasteries.",
      description:
        "Darjeeling is the tea capital of India, offering panoramic views of the Kanchenjunga range, lush tea estates, the heritage Darjeeling Himalayan Railway, and peaceful Buddhist monasteries. An unforgettable destination for tea lovers and mountain enthusiasts.",
      featuredImage: "",
      featured: false,
      status: DestinationStatus.PUBLISHED,
      metaTitle: "Darjeeling Tour Packages | Himalayan Tea Garden Tours | GoYatrio",
      metaDescription: "Book Darjeeling tour packages with GoYatrio. Experience Himalayan views, heritage toy trains, and tea estate tours.",
    },
  ];

  const seededDestinations: Record<string, { id: string }> = {};

  for (const destinationSeed of destinationSeeds) {
    const destination = await prisma.destination.upsert({
      where: { slug: destinationSeed.slug },
      update: {
        name: destinationSeed.name,
        state: destinationSeed.state,
        shortDescription: destinationSeed.shortDescription,
        description: destinationSeed.description,
        featured: destinationSeed.featured,
        status: destinationSeed.status,
        metaTitle: destinationSeed.metaTitle,
        metaDescription: destinationSeed.metaDescription,
        isActive: true,
      },
      create: {
        ...destinationSeed,
        country: "India",
        galleryImages: [],
      },
    });

    seededDestinations[destinationSeed.slug] = destination;
  }

  const kerala = await prisma.destination.findUniqueOrThrow({ where: { slug: "kerala" } });
  const rajasthan = await prisma.destination.findUniqueOrThrow({ where: { slug: "jaipur" } });

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