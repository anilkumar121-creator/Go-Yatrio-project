import { PrismaClient, DestinationStatus, PackageStatus, PackageType, VehicleType, UserRole } from "@prisma/client";
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

  const packageSeeds = [
    {
      slug: "kashmir-paradise-escape",
      title: "Kashmir Paradise Escape",
      shortDescription: "Experience Srinagar houseboats, Shikara rides on Dal Lake, and snow adventures in Gulmarg.",
      description:
        "Embark on a dream trip to Kashmir! Stay in luxury houseboats on Dal Lake, enjoy romantic Shikara rides, take the Asia's highest gondola ride in Gulmarg, and stroll through the Mughal gardens of Srinagar.",
      destinationSlug: "kashmir",
      durationDays: 6,
      durationNights: 5,
      priceFrom: 18999,
      packageType: PackageType.DOMESTIC,
      inclusions: ["5 Nights Accommodation", "Daily Breakfast & Dinner", "Airport Transfers in AC Cab", "Shikara Ride on Dal Lake", "Gondola Ticket Phase 1"],
      exclusions: ["Airfare / Train tickets", "Personal expenses & tips", "Gondola Phase 2 Ticket"],
      featured: true,
      status: PackageStatus.PUBLISHED,
      metaTitle: "Kashmir Paradise Escape 5N/6D Package | GoYatrio",
      metaDescription: "Book Kashmir Paradise Escape with GoYatrio. Includes Srinagar houseboat stay, Gulmarg gondola, Shikara ride, and private transfers.",
      itineraries: [
        { dayNumber: 1, title: "Arrival in Srinagar & Dal Lake Shikara Ride", description: "Arrive at Srinagar airport. Transfer to luxury houseboat. Enjoy evening Shikara ride on Dal Lake.", accommodation: "Deluxe Houseboat", meals: "Dinner", activities: "Shikara Ride" },
        { dayNumber: 2, title: "Srinagar Mughal Gardens Tour", description: "Visit Nishat Bagh, Shalimar Bagh, Chashme Shahi, and Shankaracharya Temple.", accommodation: "Srinagar Hotel", meals: "Breakfast & Dinner", activities: "Garden Sightseeing" },
        { dayNumber: 3, title: "Excursion to Gulmarg", description: "Drive to Gulmarg. Take the world-famous Gulmarg Gondola ride to Kongdoori.", accommodation: "Gulmarg Resort", meals: "Breakfast & Dinner", activities: "Gondola Ride & Snow Sports" },
        { dayNumber: 4, title: "Day Trip to Pahalgam Valley", description: "Drive to Pahalgam. Visit Betaab Valley, Aru Valley, and Chandanwari.", accommodation: "Pahalgam Hotel", meals: "Breakfast & Dinner", activities: "Valley Exploration" },
        { dayNumber: 5, title: "Return to Srinagar & Shopping", description: "Return to Srinagar. Explore Lal Chowk bazaar for saffron, dry fruits, and pashmina shawls.", accommodation: "Srinagar Hotel", meals: "Breakfast & Dinner", activities: "Shopping" },
        { dayNumber: 6, title: "Departure from Srinagar", description: "After breakfast, transfer to Srinagar airport for onward journey.", accommodation: "N/A", meals: "Breakfast", activities: "Departure Transfer" },
      ],
    },
    {
      slug: "kerala-backwaters-and-hills",
      title: "Kerala Backwaters & Hills",
      shortDescription: "Explore Munnar tea hills, Alleppey backwater houseboats, and spice garden sanctuaries.",
      description:
        "Immerse yourself in God's Own Country. Explore tea plantations in Munnar, watch wildlife in Periyar, and cruise the peaceful backwaters of Alleppey in a private luxury houseboat.",
      destinationSlug: "kerala",
      durationDays: 5,
      durationNights: 4,
      priceFrom: 15499,
      packageType: PackageType.DOMESTIC,
      inclusions: ["4 Nights Accommodation (1N Houseboat + 3N Hotel)", "All Meals on Houseboat", "Daily Breakfast at Hotels", "Private AC Cab for Transfers"],
      exclusions: ["Airfare / Train tickets", "Entry fees to monuments", "Personal expenses"],
      featured: true,
      status: PackageStatus.PUBLISHED,
      metaTitle: "Kerala Backwaters & Hills 4N/5D Tour Package | GoYatrio",
      metaDescription: "Book Kerala Backwaters & Hills tour with GoYatrio. Experience Munnar tea hills, Periyar spice gardens, and Alleppey houseboats.",
      itineraries: [
        { dayNumber: 1, title: "Cochin to Munnar Tea Hills", description: "Arrive in Cochin and drive through scenic waterfalls to Munnar tea gardens.", accommodation: "Munnar Tea Resort", meals: "Dinner", activities: "Scenic Drive & Cheeyappara Waterfalls" },
        { dayNumber: 2, title: "Munnar Sightseeing Tour", description: "Visit Eravikulam National Park (Nilgiri Tahr), Mattupetty Dam, and Tea Museum.", accommodation: "Munnar Tea Resort", meals: "Breakfast & Dinner", activities: "National Park & Tea Tasting" },
        { dayNumber: 3, title: "Munnar to Thekkady (Periyar)", description: "Drive to Thekkady. Enjoy boat safari on Periyar Lake and spice plantation walk.", accommodation: "Thekkady Jungle Lodge", meals: "Breakfast & Dinner", activities: "Spice Plantation Tour & Boat Safari" },
        { dayNumber: 4, title: "Thekkady to Alleppey Houseboat", description: "Board private houseboat in Alleppey. Cruise through serene backwaters.", accommodation: "Private Deluxe Houseboat", meals: "Breakfast, Lunch & Dinner", activities: "Backwater Cruise" },
        { dayNumber: 5, title: "Alleppey to Cochin Departure", description: "After breakfast on houseboat, transfer to Cochin airport or railway station.", accommodation: "N/A", meals: "Breakfast", activities: "Departure Transfer" },
      ],
    },
    {
      slug: "royal-rajasthan-heritage",
      title: "Royal Rajasthan Heritage Trail",
      shortDescription: "Discover royal palaces, Amber Fort, Lake Pichola in Udaipur, and desert culture.",
      description:
        "Experience the grand heritage of Rajasthan. Visit the iconic Pink City of Jaipur, explore Udaipur's romantic lakes, and admire majestic hill forts.",
      destinationSlug: "jaipur",
      durationDays: 7,
      durationNights: 6,
      priceFrom: 22500,
      packageType: PackageType.LUXURY,
      inclusions: ["6 Nights Royal Hotel Accommodation", "Daily Breakfast & Dinner", "Elephant Ride at Amber Fort", "Boat Cruise on Lake Pichola", "Private AC Sedan Transfer"],
      exclusions: ["Airfare / Train tickets", "Camera fees", "Personal expenses"],
      featured: true,
      status: PackageStatus.PUBLISHED,
      metaTitle: "Royal Rajasthan Heritage Trail 6N/7D Package | GoYatrio",
      metaDescription: "Discover Royal Rajasthan with GoYatrio. Includes Jaipur Pink City, Amber Fort, Udaipur Lake Pichola cruise, and heritage stays.",
      itineraries: [
        { dayNumber: 1, title: "Arrival in Jaipur", description: "Arrive in Jaipur and check into heritage hotel. Visit Birla Temple in the evening.", accommodation: "Jaipur Heritage Hotel", meals: "Dinner", activities: "Temple Visit" },
        { dayNumber: 2, title: "Jaipur Pink City Forts & Palaces", description: "Explore Amber Fort with elephant ride, City Palace, Hawa Mahal, and Jantar Mantar.", accommodation: "Jaipur Heritage Hotel", meals: "Breakfast & Dinner", activities: "Forts & Palaces Tour" },
        { dayNumber: 3, title: "Jaipur to Ajmer/Pushkar to Jodhpur", description: "Drive via holy Pushkar Lake and Brahma Temple to the Blue City of Jodhpur.", accommodation: "Jodhpur Palace Hotel", meals: "Breakfast & Dinner", activities: "Pushkar Lake Visit" },
        { dayNumber: 4, title: "Jodhpur Sightseeing & Drive to Udaipur", description: "Visit Mehrangarh Fort and Jaswant Thada, then drive to Udaipur City of Lakes.", accommodation: "Udaipur Lake Resort", meals: "Breakfast & Dinner", activities: "Mehrangarh Fort Tour" },
        { dayNumber: 5, title: "Udaipur City Palace & Lake Pichola Cruise", description: "Visit City Palace, Saheliyon Ki Bari, and enjoy evening boat ride on Lake Pichola.", accommodation: "Udaipur Lake Resort", meals: "Breakfast & Dinner", activities: "Lake Pichola Boat Cruise" },
        { dayNumber: 6, title: "Excursion to Chittorgarh Fort", description: "Day trip to historic Chittorgarh Fort, India's largest fort complex.", accommodation: "Udaipur Lake Resort", meals: "Breakfast & Dinner", activities: "Chittorgarh Fort Exploration" },
        { dayNumber: 7, title: "Departure from Udaipur", description: "Transfer to Udaipur airport for your return flight.", accommodation: "N/A", meals: "Breakfast", activities: "Departure Transfer" },
      ],
    },
  ];

  for (const pkgSeed of packageSeeds) {
    const dest = seededDestinations[pkgSeed.destinationSlug] ?? kerala;
    const { itineraries, ...pkgData } = pkgSeed;

    const tourPackage = await prisma.tourPackage.upsert({
      where: { slug: pkgSeed.slug },
      update: {
        title: pkgData.title,
        shortDescription: pkgData.shortDescription,
        description: pkgData.description,
        destinationId: dest.id,
        durationDays: pkgData.durationDays,
        durationNights: pkgData.durationNights,
        priceFrom: pkgData.priceFrom,
        packageType: pkgData.packageType,
        inclusions: pkgData.inclusions,
        exclusions: pkgData.exclusions,
        featured: pkgData.featured,
        status: pkgData.status,
        metaTitle: pkgData.metaTitle,
        metaDescription: pkgData.metaDescription,
        isActive: true,
      },
      create: {
        ...pkgData,
        destinationId: dest.id,
        currency: "INR",
        galleryImages: [],
        isActive: true,
      },
    });

    for (const itin of itineraries) {
      await prisma.itinerary.upsert({
        where: {
          packageId_dayNumber: {
            packageId: tourPackage.id,
            dayNumber: itin.dayNumber,
          },
        },
        update: {
          title: itin.title,
          description: itin.description,
          accommodation: itin.accommodation,
          meals: itin.meals,
          activities: itin.activities,
        },
        create: {
          packageId: tourPackage.id,
          ...itin,
        },
      });
    }
  }

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