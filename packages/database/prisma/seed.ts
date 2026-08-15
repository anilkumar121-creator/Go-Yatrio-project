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
      metaDescription: "Book Leh Ladakh tour packages with GoYatrio. Experience Nubra Valley camel safaris, Pangong Tso camping, and Khardung La rides.",
    },
    {
      slug: "rajasthan",
      name: "Rajasthan",
      state: "Rajasthan",
      shortDescription: "Land of Kings with royal palaces, majestic desert forts, camel safaris, and rich folk culture.",
      description:
        "Rajasthan is a land of royal splendour, featuring majestic fortresses in Jaipur and Jodhpur, romantic lakes in Udaipur, golden sand dunes in Jaisalmer, and colorful markets filled with handcrafted textiles and jewelry. Experience royal heritage hospitality and vibrant folk culture.",
      featuredImage: "",
      featured: true,
      status: DestinationStatus.PUBLISHED,
      metaTitle: "Rajasthan Tour Packages | Royal Forts & Palaces | GoYatrio",
      metaDescription: "Explore Rajasthan with GoYatrio. Book Jaipur, Udaipur, and Jaisalmer heritage tours with royal stays and private transfers.",
    },
  ];

  const seededDestinations: Record<string, { id: string }> = {};

  for (const dest of destinationSeeds) {
    const record = await prisma.destination.upsert({
      where: { slug: dest.slug },
      update: dest,
      create: dest,
    });
    seededDestinations[dest.slug] = record;
  }

  const kerala = seededDestinations["kerala"];

  const packageSeeds = [
    {
      slug: "kerala-backwaters-and-hills",
      destinationSlug: "kerala",
      title: "Kerala Backwaters & Hill Station Escape",
      shortDescription: "5 Days / 4 Nights exploring Munnar tea gardens, Thekkady wildlife, and Alleppey houseboat cruise.",
      description: "Immerse yourself in God's Own Country. Start in Munnar amid cascading waterfalls and spice-scented hills, discover Periyar wildlife in Thekkady, and end with an unforgettable overnight houseboat stay on the tranquil backwaters of Alleppey.",
      durationDays: 5,
      durationNights: 4,
      priceFrom: 18999,
      packageType: PackageType.DOMESTIC,
      inclusions: ["Breakfast & Dinner", "AC Private Sedan Transfer", "Houseboat Cruise with all meals", "Sightseeing Entry Tickets"],
      exclusions: ["Airfare/Trainfare", "Personal expenses", "Camera fees", "Travel Insurance"],
      featured: true,
      status: PackageStatus.PUBLISHED,
      metaTitle: "Kerala Backwaters & Hill Station Escape | 5D4N Package | GoYatrio",
      metaDescription: "Book 5D/4N Kerala Tour with GoYatrio. Includes Munnar tea hills, Thekkady Periyar lake, and Alleppey houseboat experience.",
      itineraries: [
        { dayNumber: 1, title: "Arrival in Cochin & Transfer to Munnar", description: "Arrive at Cochin Airport/Railway Station. Meet our representative and drive to Munnar. En route, enjoy Cheeyappara and Valara waterfalls.", city: "Munnar", accommodation: "Tea Valley Resort Munnar", meals: "Dinner", transfers: "Private AC Sedan", notes: "Check-in after 2 PM", activities: [{ title: "Waterfall stops at Cheeyappara & Valara", timing: "Morning / Afternoon" }] },
        { dayNumber: 2, title: "Munnar Full Day Tea & Nature Sightseeing", description: "Full day sightseeing of Munnar including Mattupetty Dam, Echo Point, Kundala Lake, and Tea Museum with tea tasting.", city: "Munnar", accommodation: "Tea Valley Resort Munnar", meals: "Breakfast & Dinner", transfers: "Private AC Sedan", notes: "Tea Museum closed on Mondays", activities: [{ title: "Mattupetty Dam & Speed Boat Ride", timing: "09:30 AM" }, { title: "Echo Point & Kundala Lake Visit", timing: "01:30 PM" }] },
        { dayNumber: 3, title: "Munnar to Thekkady Spice Plantation & Lake", description: "Morning scenic drive to Thekkady. Visit spice plantations and enjoy boat ride on Periyar Lake for wildlife viewing.", city: "Thekkady", accommodation: "Periyar Meadow Resort", meals: "Breakfast & Dinner", transfers: "Private AC Sedan", notes: "Boating tickets subject to online booking availability", activities: [{ title: "Spice Plantation Walk", timing: "11:00 AM" }, { title: "Periyar Wildlife Boat Safari", timing: "03:30 PM" }] },
        { dayNumber: 4, title: "Thekkady to Alleppey Houseboat Check-in", description: "Drive to Alleppey backwaters. Board traditional deluxe houseboat at 12 PM. Cruise through narrow canals, paddy fields and palm groves.", city: "Alleppey", accommodation: "Deluxe Private Houseboat", meals: "Breakfast, Lunch, Evening Tea & Dinner", transfers: "Private AC Sedan", notes: "AC operates from 9 PM to 6 AM in deluxe category", activities: [{ title: "Backwater Cruise & Sunset Deck Experience", timing: "12:00 PM onwards" }] },
        { dayNumber: 5, title: "Departure from Cochin", description: "Disembark houseboat after breakfast and transfer to Cochin Airport / Railway Station for departure.", city: "Cochin", accommodation: "N/A", meals: "Breakfast", transfers: "Private AC Sedan", notes: "Drop off according to flight schedule", activities: [{ title: "Cochin Fort Sightseeing (time permitting)", timing: "Morning" }] },
      ],
    },
    {
      slug: "kashmir-paradise-experience",
      destinationSlug: "kashmir",
      title: "Kashmir Paradise & Gulmarg Gondola Experience",
      shortDescription: "6 Days / 5 Nights covering Srinagar Dal Lake houseboat stay, Pahalgam valleys, and Gulmarg snow peaks.",
      description: "Experience the magic of Kashmir with Dal Lake Shikara ride, overnight stay in a handcrafted wooden houseboat, meadow walks in Pahalgam, and high-altitude Gondola cable car ride in Gulmarg.",
      durationDays: 6,
      durationNights: 5,
      priceFrom: 24999,
      packageType: PackageType.DOMESTIC,
      inclusions: ["Breakfast & Dinner", "Shikara Ride on Dal Lake", "Pahalgam & Gulmarg transfers", "Luxury Houseboat Stay"],
      exclusions: ["Gondola Phase 2 tickets", "Personal Pony charges", "Airfare"],
      featured: true,
      status: PackageStatus.PUBLISHED,
      metaTitle: "Kashmir Paradise & Gulmarg Gondola Tour | 6D5N Package | GoYatrio",
      metaDescription: "Book 6D/5N Kashmir Holiday with GoYatrio. Includes Srinagar houseboat, Gulmarg gondola, and Pahalgam Betaab valley tour.",
      itineraries: [
        { dayNumber: 1, title: "Arrival in Srinagar & Dal Lake Shikara Ride", description: "Arrive at Srinagar Airport. Transfer to houseboat on Dal Lake. Enjoy a serene 1-hour sunset Shikara ride.", city: "Srinagar", accommodation: "Luxury Dal Lake Houseboat", meals: "Dinner", transfers: "Private Sedan", notes: "Airport pickup included", activities: [{ title: "Sunset Shikara Ride on Dal Lake", timing: "05:00 PM" }] },
        { dayNumber: 2, title: "Srinagar Mughal Gardens & Shankaracharya Temple", description: "Visit Nishat Bagh, Shalimar Bagh, Cheshma Shahi Mughal gardens, and Shankaracharya Temple.", city: "Srinagar", accommodation: "Srinagar City Hotel", meals: "Breakfast & Dinner", transfers: "Private Sedan", notes: "Wear comfortable walking shoes", activities: [{ title: "Mughal Gardens Tour", timing: "10:00 AM" }] },
        { dayNumber: 3, title: "Srinagar to Pahalgam Valley of Shepherds", description: "Drive to Pahalgam via saffron fields of Pampore. Visit Aru Valley and Betaab Valley.", city: "Pahalgam", accommodation: "Pahalgam Pine Resort", meals: "Breakfast & Dinner", transfers: "Private Sedan", notes: "Local union cab for Betaab valley", activities: [{ title: "Betaab & Aru Valley Sightseeing", timing: "01:00 PM" }] },
        { dayNumber: 4, title: "Pahalgam to Gulmarg Meadow of Flowers", description: "Drive to Gulmarg. Ride the world's second-highest Gondola cable car up to Kongdoori & Apharwat Peak.", city: "Gulmarg", accommodation: "Gulmarg Resort", meals: "Breakfast & Dinner", transfers: "Private Sedan", notes: "Gondola tickets booked in advance", activities: [{ title: "Gulmarg Gondola Ride Phase 1 & 2", timing: "10:30 AM" }] },
        { dayNumber: 5, title: "Gulmarg to Srinagar Local Craft Shopping", description: "Return to Srinagar. Visit local handicraft centers for Pashmina shawls, carpets, and dry fruits.", city: "Srinagar", accommodation: "Srinagar Hotel", meals: "Breakfast & Dinner", transfers: "Private Sedan", notes: "Evening free for shopping", activities: [{ title: "Heritage Craft Shopping Walk", timing: "04:00 PM" }] },
        { dayNumber: 6, title: "Srinagar Departure", description: "Transfer to Srinagar airport for departure with sweet memories of Kashmir.", city: "Srinagar", accommodation: "N/A", meals: "Breakfast", transfers: "Private Sedan", notes: "Arrive airport 3 hours prior", activities: [{ title: "Airport Transfer", timing: "Morning" }] },
      ],
    },
    {
      slug: "grand-rajasthan-heritage-tour",
      destinationSlug: "rajasthan",
      title: "Grand Rajasthan Heritage & Desert Safari",
      shortDescription: "7 Days / 6 Nights across Jaipur Pink City, Jodhpur Blue City, and Udaipur City of Lakes.",
      description: "Step into royal India with GoYatrio. Includes Jaipur Pink City, Amber Fort, Udaipur Lake Pichola cruise, and heritage stays.",
      durationDays: 7,
      durationNights: 6,
      priceFrom: 29999,
      packageType: PackageType.DOMESTIC,
      inclusions: ["Breakfast & Dinner", "Heritage Hotel Stays", "AC SUV Transfer", "Lake Pichola Boat Cruise"],
      exclusions: ["Monument Entry Fees", "Camera Charges", "Airfare"],
      featured: true,
      status: PackageStatus.PUBLISHED,
      metaTitle: "Grand Rajasthan Heritage Tour | 7D6N Package | GoYatrio",
      metaDescription: "Book 7D/6N Rajasthan Heritage Tour with GoYatrio. Includes Jaipur Amber Fort, Jodhpur Fort, and Udaipur Lake Pichola cruise.",
      itineraries: [
        { dayNumber: 1, title: "Arrival in Jaipur Pink City", description: "Arrive in Jaipur and check into heritage hotel. Visit Birla Temple in the evening.", city: "Jaipur", accommodation: "Jaipur Heritage Palace", meals: "Dinner", transfers: "Private AC SUV", notes: "Evening cultural show optional", activities: [{ title: "Birla Temple Visit", timing: "06:00 PM" }] },
        { dayNumber: 2, title: "Jaipur Forts & Palaces Full Day Tour", description: "Explore Amber Fort with elephant ride, City Palace, Hawa Mahal, and Jantar Mantar observatory.", city: "Jaipur", accommodation: "Jaipur Heritage Palace", meals: "Breakfast & Dinner", transfers: "Private AC SUV", notes: "Guide included", activities: [{ title: "Amber Fort Exploration", timing: "09:00 AM" }, { title: "City Palace & Hawa Mahal Walk", timing: "02:00 PM" }] },
        { dayNumber: 3, title: "Jaipur to Ajmer/Pushkar & Jodhpur", description: "Drive via holy Pushkar Lake and Brahma Temple to the Blue City of Jodhpur.", city: "Jodhpur", accommodation: "Jodhpur Palace Hotel", meals: "Breakfast & Dinner", transfers: "Private AC SUV", notes: "Pushkar stop 2 hours", activities: [{ title: "Pushkar Lake & Temple Visit", timing: "12:00 PM" }] },
        { dayNumber: 4, title: "Jodhpur Sightseeing & Drive to Udaipur", description: "Visit Mehrangarh Fort and Jaswant Thada, then drive to Udaipur City of Lakes.", city: "Udaipur", accommodation: "Udaipur Lake Resort", meals: "Breakfast & Dinner", transfers: "Private AC SUV", notes: "Ranakpur Jain Temple stop en route", activities: [{ title: "Mehrangarh Fort Tour", timing: "09:30 AM" }] },
        { dayNumber: 5, title: "Udaipur City Palace & Lake Pichola Cruise", description: "Visit City Palace, Saheliyon Ki Bari, and enjoy evening boat ride on Lake Pichola.", city: "Udaipur", accommodation: "Udaipur Lake Resort", meals: "Breakfast & Dinner", transfers: "Private AC SUV", notes: "Sunset boat cruise included", activities: [{ title: "Lake Pichola Boat Cruise", timing: "05:00 PM" }] },
        { dayNumber: 6, title: "Excursion to Chittorgarh Fort", description: "Day trip to historic Chittorgarh Fort, India's largest fort complex.", city: "Udaipur", accommodation: "Udaipur Lake Resort", meals: "Breakfast & Dinner", transfers: "Private AC SUV", notes: "Full day excursion", activities: [{ title: "Chittorgarh Fort Guided Tour", timing: "10:00 AM" }] },
        { dayNumber: 7, title: "Departure from Udaipur", description: "Transfer to Udaipur airport for your return flight.", city: "Udaipur", accommodation: "N/A", meals: "Breakfast", transfers: "Private AC SUV", notes: "Airport drop", activities: [{ title: "Airport Transfer", timing: "Morning" }] },
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

    const itinSlug = `${pkgSeed.slug}-standard-itinerary`;
    const itinerary = await prisma.itinerary.upsert({
      where: { slug: itinSlug },
      update: {
        title: `${pkgData.title} Standard Itinerary`,
        description: `Complete ${pkgData.durationDays}D/${pkgData.durationNights}N day-by-day itinerary schedule.`,
        packageId: tourPackage.id,
        isDefault: true,
        isActive: true,
      },
      create: {
        packageId: tourPackage.id,
        title: `${pkgData.title} Standard Itinerary`,
        slug: itinSlug,
        description: `Complete ${pkgData.durationDays}D/${pkgData.durationNights}N day-by-day itinerary schedule.`,
        isDefault: true,
        isActive: true,
      },
    });

    for (const itinDay of itineraries) {
      const { activities, ...dayFields } = itinDay;

      const createdDay = await prisma.itineraryDay.upsert({
        where: {
          itineraryId_dayNumber: {
            itineraryId: itinerary.id,
            dayNumber: dayFields.dayNumber,
          },
        },
        update: {
          ...dayFields,
          sortOrder: dayFields.dayNumber,
        },
        create: {
          itineraryId: itinerary.id,
          sortOrder: dayFields.dayNumber,
          ...dayFields,
        },
      });

      if (activities && activities.length > 0) {
        for (let i = 0; i < activities.length; i++) {
          const act = activities[i];
          await prisma.dayActivity.create({
            data: {
              dayId: createdDay.id,
              title: act.title,
              timing: act.timing,
              sortOrder: i + 1,
            },
          });
        }
      }
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
