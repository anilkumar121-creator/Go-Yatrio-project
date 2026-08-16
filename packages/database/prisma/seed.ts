import {
  PrismaClient,
  DestinationStatus,
  PackageStatus,
  PackageType,
  VehicleType,
  UserRole,
  HotelCategory,
  HotelStatus,
  CabStatus,
  CabTripType,
  CabFuelType,
} from "@prisma/client";
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

  // Seed Amenities
  const amenitySeeds = [
    { name: "Free High-Speed Wi-Fi", icon: "Wifi" },
    { name: "Swimming Pool", icon: "Waves" },
    { name: "Ayurveda & Wellness Spa", icon: "Sparkles" },
    { name: "Multi-Cuisine Restaurant", icon: "Utensils" },
    { name: "Fitness Center / Gym", icon: "Dumbbell" },
    { name: "24/7 Room Service", icon: "Clock" },
    { name: "Free Airport Transfer", icon: "Car" },
    { name: "Beach Access", icon: "Sun" },
    { name: "Valet Parking", icon: "Parking" },
    { name: "Conference & Event Hall", icon: "Users" },
  ];

  const seededAmenities: Record<string, { id: string; name: string }> = {};
  for (const am of amenitySeeds) {
    const record = await prisma.hotelAmenity.upsert({
      where: { name: am.name },
      update: { icon: am.icon, active: true },
      create: { name: am.name, icon: am.icon, active: true },
    });
    seededAmenities[am.name] = record;
  }

  const kerala = seededDestinations["kerala"];
  const goa = seededDestinations["goa"];
  const kashmir = seededDestinations["kashmir"];
  const rajasthan = seededDestinations["rajasthan"];
  const andaman = seededDestinations["andaman"];
  const ladakh = seededDestinations["leh-ladakh"];

  // Seed 20 Hotels
  const hotelSeeds = [
    {
      slug: "tea-valley-resort-munnar",
      name: "Tea Valley Resort Munnar",
      shortDescription: "Charming hillside retreat nestled inside a 25-acre tea estate in Munnar.",
      fullDescription: "Tea Valley Resort offers executive wooden cottages overlooking lush green valleys. Enjoy morning nature walks, bonfires, traditional Keralite dining, and misty mountain views.",
      destinationSlug: "kerala",
      address: "Pothamedu, Munnar, Idukki District",
      city: "Munnar",
      state: "Kerala",
      country: "India",
      hotelCategory: HotelCategory.PREMIUM,
      starRating: 4,
      featured: true,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "Multi-Cuisine Restaurant", "24/7 Room Service", "Ayurveda & Wellness Spa"],
      roomTypes: [
        { roomName: "Executive Tea View Cottage", roomDescription: "Spacious wooden cottage with private balcony facing tea gardens.", maxGuests: 3, bedType: "King Bed", roomSize: "380 sq ft", priceFrom: 5500 },
        { roomName: "Luxury Suite", roomDescription: "Premium suite with panoramic valley view and living room.", maxGuests: 4, bedType: "King Bed + Extra Bed", roomSize: "520 sq ft", priceFrom: 8500 },
      ],
    },
    {
      slug: "royal-houseboat-alleppey",
      name: "Royal Backwater Houseboat Alleppey",
      shortDescription: "Luxury handcrafted wooden houseboat floating through tranquil Alleppey backwaters.",
      fullDescription: "Experience authentic Keralite hospitality on an exclusive private houseboat. Includes air-conditioned bedrooms, sun deck, private chef serving fresh seafood, and evening backwater cruises.",
      destinationSlug: "kerala",
      address: "Finishing Point Jetty, Punnamada, Alleppey",
      city: "Alleppey",
      state: "Kerala",
      country: "India",
      hotelCategory: HotelCategory.PREMIUM,
      starRating: 4,
      featured: true,
      status: HotelStatus.ACTIVE,
      amenities: ["Multi-Cuisine Restaurant", "24/7 Room Service"],
      roomTypes: [
        { roomName: "Deluxe AC Bedroom", roomDescription: "Air-conditioned bedroom with attached bathroom and large window view.", maxGuests: 2, bedType: "Double Bed", roomSize: "220 sq ft", priceFrom: 7500 },
        { roomName: "Luxury Glass Houseboat Suite", roomDescription: "Upper deck glass-walled suite offering 360-degree backwater views.", maxGuests: 3, bedType: "King Bed", roomSize: "320 sq ft", priceFrom: 12000 },
      ],
    },
    {
      slug: "taj-fort-aguada-resort-goa",
      name: "Taj Fort Aguada Resort & Spa",
      shortDescription: "Iconic 5-star beachfront heritage resort overlooking Sinquerim Beach in Goa.",
      fullDescription: "Built on the ramparts of a 16th-century Portuguese fortress, Taj Fort Aguada blends colonial history with luxury amenities, oceanfront infinity pools, and Jiva Spa treatments.",
      destinationSlug: "goa",
      address: "Sinquerim, Candolim, Bardez",
      city: "Goa",
      state: "Goa",
      country: "India",
      hotelCategory: HotelCategory.LUXURY,
      starRating: 5,
      featured: true,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "Swimming Pool", "Ayurveda & Wellness Spa", "Multi-Cuisine Restaurant", "Fitness Center / Gym", "Beach Access", "Valet Parking"],
      roomTypes: [
        { roomName: "Superior Sea View Room", roomDescription: "Elegantly furnished room with private balcony overlooking the Arabian Sea.", maxGuests: 3, bedType: "King Bed", roomSize: "420 sq ft", priceFrom: 18500 },
        { roomName: "Hermitage Villa", roomDescription: "Exclusive private villa with plunge pool and private garden.", maxGuests: 4, bedType: "King Bed", roomSize: "850 sq ft", priceFrom: 35000 },
      ],
    },
    {
      slug: "calangute-grand-beach-resort",
      name: "Calangute Grand Beach Resort",
      shortDescription: "Vibrant family resort just 300 meters from Calangute Beach in North Goa.",
      fullDescription: "Calangute Grand features outdoor swimming pools, poolbar shacks, live Goan music evenings, and spacious rooms close to famous night markets and beach shacks.",
      destinationSlug: "goa",
      address: "Naika Vaddo, Calangute, North Goa",
      city: "Goa",
      state: "Goa",
      country: "India",
      hotelCategory: HotelCategory.STANDARD,
      starRating: 3,
      featured: false,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "Swimming Pool", "Multi-Cuisine Restaurant", "24/7 Room Service"],
      roomTypes: [
        { roomName: "Deluxe Pool View Room", roomDescription: "Comfortable air-conditioned room with pool balcony.", maxGuests: 3, bedType: "Queen Bed", roomSize: "280 sq ft", priceFrom: 3800 },
      ],
    },
    {
      slug: "srinagar-grand-houseboat",
      name: "Grand Palace Houseboat Dal Lake",
      shortDescription: "Heritage cedarwood houseboat anchored on the serene waters of Dal Lake in Srinagar.",
      fullDescription: "Crafted from fragrant cedarwood with hand-carved Kashmir walnut furniture and silk carpets. Enjoy Shikara transfers, traditional Wazwan dinners, and views of Shankaracharya hill.",
      destinationSlug: "kashmir",
      address: "Boulevard Road, Gate No 9, Dal Lake, Srinagar",
      city: "Srinagar",
      state: "Jammu & Kashmir",
      country: "India",
      hotelCategory: HotelCategory.PREMIUM,
      starRating: 4,
      featured: true,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "Multi-Cuisine Restaurant", "24/7 Room Service", "Free Airport Transfer"],
      roomTypes: [
        { roomName: "Royal Heritage Suite", roomDescription: "Carved walnut furniture suite with lake-facing balcony.", maxGuests: 3, bedType: "King Bed", roomSize: "350 sq ft", priceFrom: 6800 },
      ],
    },
    {
      slug: "gulmarg-alpine-resort",
      name: "Gulmarg Alpine Snow Resort",
      shortDescription: "Luxury ski-in ski-out resort near Gulmarg Gondola Base Station.",
      fullDescription: "Surrounded by snow-capped Himalayan peaks, Gulmarg Alpine Resort features heated rooms, indoor spa pools, ski equipment rentals, and fire-lit dining lounges.",
      destinationSlug: "kashmir",
      address: "Near Gondola Base Station, Gulmarg",
      city: "Gulmarg",
      state: "Jammu & Kashmir",
      country: "India",
      hotelCategory: HotelCategory.LUXURY,
      starRating: 5,
      featured: true,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "Multi-Cuisine Restaurant", "Fitness Center / Gym", "Valet Parking"],
      roomTypes: [
        { roomName: "Heated Snow View Room", roomDescription: "Centralized heating room with dramatic views of Apharwat peak.", maxGuests: 3, bedType: "King Bed", roomSize: "400 sq ft", priceFrom: 14500 },
      ],
    },
    {
      slug: "jaipur-heritage-palace-hotel",
      name: "Jaipur Royal Heritage Palace",
      shortDescription: "Converted 19th-century royal Haveli featuring courtyard dining and Rajasthani folk dances.",
      fullDescription: "Immerse in royal grandeur with traditional fresco paintings, marble courtyards, rooftop fort views, Ayurvedic massages, and authentic Marwari dining.",
      destinationSlug: "rajasthan",
      address: "Amber Road, Near Jal Mahal, Jaipur",
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      hotelCategory: HotelCategory.PREMIUM,
      starRating: 4,
      featured: true,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "Swimming Pool", "Multi-Cuisine Restaurant", "Ayurveda & Wellness Spa", "Valet Parking"],
      roomTypes: [
        { roomName: "Heritage Royal Room", roomDescription: "Traditional Rajasthani decor with king canopy bed.", maxGuests: 3, bedType: "King Canopy Bed", roomSize: "360 sq ft", priceFrom: 6200 },
        { roomName: "Maharaja Suite", roomDescription: "Opulent suite with private terrace view of Jal Mahal.", maxGuests: 4, bedType: "King Bed", roomSize: "700 sq ft", priceFrom: 12500 },
      ],
    },
    {
      slug: "udaipur-lake-pichola-resort",
      name: "Udaipur Lake Pichola Palace Resort",
      shortDescription: "Boutique lakeside resort offering romantic boat rides and City Palace views.",
      fullDescription: "Located on the banks of Lake Pichola, this palace resort offers candlelit dining on floating pontoon decks, rooftop pool lounges, and luxury heritage rooms.",
      destinationSlug: "rajasthan",
      address: "Hanuman Ghat, Outside Chandpole, Udaipur",
      city: "Udaipur",
      state: "Rajasthan",
      country: "India",
      hotelCategory: HotelCategory.LUXURY,
      starRating: 5,
      featured: true,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "Swimming Pool", "Multi-Cuisine Restaurant", "Ayurveda & Wellness Spa"],
      roomTypes: [
        { roomName: "Lakefront Suite", roomDescription: "Direct views of Lake Pichola and Taj Lake Palace.", maxGuests: 3, bedType: "King Bed", roomSize: "450 sq ft", priceFrom: 16000 },
      ],
    },
    {
      slug: "havelock-beach-resort-andaman",
      name: "Barefoot Beach Resort Havelock",
      shortDescription: "Eco-luxury beach resort hidden inside tropical rainforest at Radhanagar Beach.",
      fullDescription: "Constructed with indigenous timber and thatch roofs, Barefoot Resort provides direct beach access, scuba diving center, sea-view cottages, and organic dining.",
      destinationSlug: "andaman",
      address: "Beach No 7, Radhanagar Beach, Havelock Island",
      city: "Havelock Island",
      state: "Andaman & Nicobar Islands",
      country: "India",
      hotelCategory: HotelCategory.LUXURY,
      starRating: 5,
      featured: true,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "Beach Access", "Multi-Cuisine Restaurant", "Ayurveda & Wellness Spa"],
      roomTypes: [
        { roomName: "Rainforest Andaman Villa", roomDescription: "Eco-friendly wooden villa surrounded by lush foliage.", maxGuests: 3, bedType: "King Bed", roomSize: "500 sq ft", priceFrom: 14000 },
      ],
    },
    {
      slug: "port-blair-bay-view-hotel",
      name: "Port Blair Bay View Hotel",
      shortDescription: "Modern sea-facing hotel close to Cellular Jail and Port Blair Jetty.",
      fullDescription: "Conveniently situated near Port Blair harbour, offering comfortable sea-facing rooms, rooftop seafood restaurant, and island hopping travel desk.",
      destinationSlug: "andaman",
      address: "Marine Hill, Port Blair",
      city: "Port Blair",
      state: "Andaman & Nicobar Islands",
      country: "India",
      hotelCategory: HotelCategory.STANDARD,
      starRating: 3,
      featured: false,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "Multi-Cuisine Restaurant", "24/7 Room Service", "Free Airport Transfer"],
      roomTypes: [
        { roomName: "Standard Sea View Room", roomDescription: "Comfortable room overlooking Ross Island bay.", maxGuests: 2, bedType: "Queen Bed", roomSize: "260 sq ft", priceFrom: 3200 },
      ],
    },
    {
      slug: "leh-grand-dragon-hotel",
      name: "The Grand Dragon Ladakh",
      shortDescription: "Premier 5-star solar-powered eco-hotel in Leh with Himalayan views.",
      fullDescription: "The Grand Dragon Ladakh features solar heating, handcrafted Tibetan wood carvings, oxygen-enriched rooms, and rooftop views of Stok Kangri mountain range.",
      destinationSlug: "leh-ladakh",
      address: "Old Road, Sheynam, Leh Ladakh",
      city: "Leh",
      state: "Ladakh",
      country: "India",
      hotelCategory: HotelCategory.LUXURY,
      starRating: 5,
      featured: true,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "Multi-Cuisine Restaurant", "Fitness Center / Gym", "Conference & Event Hall", "Free Airport Transfer"],
      roomTypes: [
        { roomName: "Deluxe Mountain View Room", roomDescription: "Solar heated room with panoramic views of Stok Kangri.", maxGuests: 3, bedType: "King Bed", roomSize: "360 sq ft", priceFrom: 11500 },
      ],
    },
    {
      slug: "pangong-luxury-tented-camp",
      name: "Pangong Tso Luxury Tented Camp",
      shortDescription: "High-altitude glamping camp on the banks of blue Pangong Lake.",
      fullDescription: "Experience starlit nights at 14,000 feet with insulated luxury tents, attached modern bathrooms, heating stoves, and hot meals served in central dining tent.",
      destinationSlug: "leh-ladakh",
      address: "Spangmik Village, Pangong Tso Lake, Ladakh",
      city: "Pangong Tso",
      state: "Ladakh",
      country: "India",
      hotelCategory: HotelCategory.PREMIUM,
      starRating: 4,
      featured: false,
      status: HotelStatus.ACTIVE,
      amenities: ["Multi-Cuisine Restaurant", "24/7 Room Service"],
      roomTypes: [
        { roomName: "Insulated Luxury Glamping Tent", roomDescription: "Double-walled heated tent with private bathroom and lakefront view.", maxGuests: 3, bedType: "Twin / King Beds", roomSize: "300 sq ft", priceFrom: 7800 },
      ],
    },
    {
      slug: "thekkady-periyar-meadow-resort",
      name: "Thekkady Periyar Meadow Resort",
      shortDescription: "Serene eco-resort adjoining Periyar Wildlife Sanctuary in Thekkady.",
      fullDescription: "Surrounded by spice plantations, offering jungle walks, bamboo rafting assistance, traditional Keralite meals, and peaceful green ambiance.",
      destinationSlug: "kerala",
      address: "Sanctuary Road, Thekkady, Kumily",
      city: "Thekkady",
      state: "Kerala",
      country: "India",
      hotelCategory: HotelCategory.STANDARD,
      starRating: 3,
      featured: false,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "Multi-Cuisine Restaurant", "24/7 Room Service"],
      roomTypes: [
        { roomName: "Deluxe Plantation Room", roomDescription: "Cozy balcony room facing spice gardens.", maxGuests: 3, bedType: "Double Bed", roomSize: "270 sq ft", priceFrom: 3400 },
      ],
    },
    {
      slug: "pahalgam-pine-retreat",
      name: "Pahalgam Pine Valley Retreat",
      shortDescription: "Riverside boutique hotel along the rushing Lidder River in Pahalgam.",
      fullDescription: "Wake up to the sound of Lidder River and pine forests. Features wood-paneled rooms, campfire grounds, and trout fishing excursions.",
      destinationSlug: "kashmir",
      address: "Lidder River Bank, KP Road, Pahalgam",
      city: "Pahalgam",
      state: "Jammu & Kashmir",
      country: "India",
      hotelCategory: HotelCategory.STANDARD,
      starRating: 3,
      featured: false,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "Multi-Cuisine Restaurant", "24/7 Room Service"],
      roomTypes: [
        { roomName: "River View Room", roomDescription: "Balcony room with direct view of Lidder River.", maxGuests: 3, bedType: "King Bed", roomSize: "300 sq ft", priceFrom: 4200 },
      ],
    },
    {
      slug: "jodhpur-blue-city-palace",
      name: "Jodhpur Blue City Palace Hotel",
      shortDescription: "Boutique heritage stay overlooking Mehrangarh Fort in Jodhpur.",
      fullDescription: "Situated in the heart of the historic Blue City, featuring rooftop fort-view dining, Rajasthani jharokha windows, and guided fort walks.",
      destinationSlug: "rajasthan",
      address: "Clock Tower Road, Jodhpur",
      city: "Jodhpur",
      state: "Rajasthan",
      country: "India",
      hotelCategory: HotelCategory.STANDARD,
      starRating: 3,
      featured: false,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "Multi-Cuisine Restaurant", "24/7 Room Service"],
      roomTypes: [
        { roomName: "Fort View Room", roomDescription: "Traditional room with spectacular lit-up view of Mehrangarh Fort.", maxGuests: 2, bedType: "Queen Bed", roomSize: "280 sq ft", priceFrom: 3900 },
      ],
    },
    {
      slug: "jaisalmer-desert-camps-resort",
      name: "Jaisalmer Golden Sand Desert Camp",
      shortDescription: "Authentic Thar desert glamping camp at Sam Sand Dunes Jaisalmer.",
      fullDescription: "Experience desert magic with sunset camel safaris, jeep dune bashing, Rajasthani Kalbeliya folk dance performances, and starry night camping.",
      destinationSlug: "rajasthan",
      address: "Sam Sand Dunes, Jaisalmer",
      city: "Jaisalmer",
      state: "Rajasthan",
      country: "India",
      hotelCategory: HotelCategory.PREMIUM,
      starRating: 4,
      featured: true,
      status: HotelStatus.ACTIVE,
      amenities: ["Multi-Cuisine Restaurant", "24/7 Room Service"],
      roomTypes: [
        { roomName: "Swiss Royal Desert Tent", roomDescription: "Carpeted tent with modern attached bathroom and evening cultural show.", maxGuests: 3, bedType: "Double Bed", roomSize: "320 sq ft", priceFrom: 5500 },
      ],
    },
    {
      slug: "candolim-beachfront-suites",
      name: "Candolim Beachfront Suites Goa",
      shortDescription: "Boutique suites stepping right onto the sands of Candolim Beach.",
      fullDescription: "Enjoy sunset cocktails, sea breezes, infinity plunge pools, and spacious modern suites right on Candolim coastline.",
      destinationSlug: "goa",
      address: "Main Beach Road, Candolim, North Goa",
      city: "Goa",
      state: "Goa",
      country: "India",
      hotelCategory: HotelCategory.PREMIUM,
      starRating: 4,
      featured: false,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "Swimming Pool", "Beach Access", "Multi-Cuisine Restaurant"],
      roomTypes: [
        { roomName: "Beachfront Suite", roomDescription: "Modern suite with direct balcony view of Arabian Sea.", maxGuests: 3, bedType: "King Bed", roomSize: "420 sq ft", priceFrom: 9200 },
      ],
    },
    {
      slug: "kovalam-ayurvedic-beach-resort",
      name: "Kovalam Ayurvedic Beach Resort",
      shortDescription: "Rejuvenating Ayurveda wellness retreat overlooking Lighthouse Beach Kovalam.",
      fullDescription: "Authentic doctor-guided Ayurvedic treatments, yoga pavilions, vegetarian satvik dining, and cliffside ocean views.",
      destinationSlug: "kerala",
      address: "Lighthouse Beach, Kovalam, Trivandrum",
      city: "Kovalam",
      state: "Kerala",
      country: "India",
      hotelCategory: HotelCategory.PREMIUM,
      starRating: 4,
      featured: false,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Speed", "Ayurveda & Wellness Spa", "Swimming Pool", "Beach Access", "Multi-Cuisine Restaurant"],
      roomTypes: [
        { roomName: "Ayurveda Ocean Cottage", roomDescription: "Seafacing cottage designed for peaceful wellness stays.", maxGuests: 2, bedType: "King Bed", roomSize: "350 sq ft", priceFrom: 7200 },
      ],
    },
    {
      slug: "nubra-valley-himalayan-resort",
      name: "Nubra Valley Himalayan Organic Resort",
      shortDescription: "Scenic orchard resort in Diskit village, Nubra Valley.",
      fullDescription: "Set among apple and apricot orchards near Hunder sand dunes and Diskit Monastery. Features organic farm dining and camel safari assistance.",
      destinationSlug: "leh-ladakh",
      address: "Diskit Village, Nubra Valley",
      city: "Nubra Valley",
      state: "Ladakh",
      country: "India",
      hotelCategory: HotelCategory.STANDARD,
      starRating: 3,
      featured: false,
      status: HotelStatus.ACTIVE,
      amenities: ["Multi-Cuisine Restaurant", "24/7 Room Service"],
      roomTypes: [
        { roomName: "Orchard Cottage Room", roomDescription: "Wooden room surrounded by organic fruit orchards.", maxGuests: 3, bedType: "King / Twin Beds", roomSize: "320 sq ft", priceFrom: 4800 },
      ],
    },
    {
      slug: "south-goa-budget-inn",
      name: "South Goa Budget Beach Inn",
      shortDescription: "Clean and affordable stay near Colva Beach South Goa.",
      fullDescription: "Perfect for budget travelers and backpackers wanting quiet palm groves, clean air-conditioned rooms, and quick beach access.",
      destinationSlug: "goa",
      address: "Colva Beach Road, South Goa",
      city: "Goa",
      state: "Goa",
      country: "India",
      hotelCategory: HotelCategory.BUDGET,
      starRating: 2,
      featured: false,
      status: HotelStatus.ACTIVE,
      amenities: ["Free High-Speed Wi-Fi", "24/7 Room Service"],
      roomTypes: [
        { roomName: "Standard AC Room", roomDescription: "Basic air-conditioned room with private bathroom.", maxGuests: 2, bedType: "Double Bed", roomSize: "200 sq ft", priceFrom: 1800 },
      ],
    },
  ];

  for (const hSeed of hotelSeeds) {
    const dest = seededDestinations[hSeed.destinationSlug];
    if (!dest) continue;

    const { amenities, roomTypes, destinationSlug, ...hData } = hSeed;

    const createdHotel = await prisma.hotel.upsert({
      where: { slug: hSeed.slug },
      update: {
        name: hData.name,
        shortDescription: hData.shortDescription,
        fullDescription: hData.fullDescription,
        destinationId: dest.id,
        address: hData.address,
        city: hData.city,
        state: hData.state,
        country: hData.country,
        hotelCategory: hData.hotelCategory,
        starRating: hData.starRating,
        featured: hData.featured,
        status: hData.status,
      },
      create: {
        ...hData,
        destinationId: dest.id,
        amenities: {
          connect: amenities
            .filter((aName) => seededAmenities[aName])
            .map((aName) => ({ id: seededAmenities[aName].id })),
        },
      },
    });

    // Create Room Types
    for (const rt of roomTypes) {
      const existingRoom = await prisma.hotelRoomType.findFirst({
        where: { hotelId: createdHotel.id, roomName: rt.roomName },
      });

      if (!existingRoom) {
        await prisma.hotelRoomType.create({
          data: {
            hotelId: createdHotel.id,
            roomName: rt.roomName,
            roomDescription: rt.roomDescription,
            maxGuests: rt.maxGuests,
            bedType: rt.bedType,
            roomSize: rt.roomSize,
            priceFrom: rt.priceFrom,
            active: true,
          },
        });
      }
    }

    // Create Sample Hotel Images
    const existingImage = await prisma.hotelImage.findFirst({ where: { hotelId: createdHotel.id } });
    if (!existingImage) {
      await prisma.hotelImage.createMany({
        data: [
          { hotelId: createdHotel.id, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", altText: `${createdHotel.name} Exterior View`, sortOrder: 1 },
          { hotelId: createdHotel.id, imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", altText: `${createdHotel.name} Luxury Room`, sortOrder: 2 },
          { hotelId: createdHotel.id, imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80", altText: `${createdHotel.name} Pool and Lounge`, sortOrder: 3 },
        ],
      });
    }
  }

  // Update Packages with Hotels
  const packages = await prisma.tourPackage.findMany();
  const allHotels = await prisma.hotel.findMany();

  for (const pkg of packages) {
    const destHotels = allHotels.filter((h) => h.destinationId === pkg.destinationId);
    if (destHotels.length > 0) {
      await prisma.tourPackage.update({
        where: { id: pkg.id },
        data: {
          hotels: {
            connect: destHotels.map((h) => ({ id: h.id })),
          },
        },
      });
    }
  }

  // === Phase 11: Cab Booking System Seeding ===
  const cabAmenitySeeds = [
    { name: "Air Conditioning", icon: "Snowflake" },
    { name: "Music System / Bluetooth", icon: "Music" },
    { name: "USB Charging Points", icon: "Plug" },
    { name: "Pushback Recliner Seats", icon: "Armchair" },
    { name: "Reading Lights", icon: "Lightbulb" },
    { name: "Large Luggage Space", icon: "Backpack" },
    { name: "Sunroof", icon: "Sun" },
    { name: "GPS Navigation", icon: "MapPin" },
    { name: "Clean & Sanitized Interior", icon: "SprayCan" },
  ];

  const seededCabAmenities: Record<string, { id: string; name: string }> = {};
  for (const am of cabAmenitySeeds) {
    const rec = await prisma.cabAmenity.upsert({
      where: { name: am.name },
      update: { icon: am.icon, active: true },
      create: { name: am.name, icon: am.icon, active: true },
    });
    seededCabAmenities[am.name] = rec;
  }

  const cabSeeds = [
    {
      slug: "maruti-dzire-sedan",
      vehicleName: "Maruti Suzuki Dzire",
      vehicleType: VehicleType.SEDAN,
      description: "Comfortable AC sedan perfect for local city rides, airport transfers, and short one-way trips.",
      capacity: 4,
      luggageCapacity: 2,
      ac: true,
      fuelType: CabFuelType.PETROL,
      driverAllowance: 250,
      baseFare: 200,
      extraKmCharge: 12,
      nightCharge: 150,
      priceFrom: 2000,
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80",
      ],
      tripTypes: [CabTripType.LOCAL, CabTripType.AIRPORT_TRANSFER, CabTripType.RAILWAY_TRANSFER, CabTripType.ONE_WAY],
      featured: true,
      status: CabStatus.ACTIVE,
      destinationSlug: "goa",
      amenities: ["Air Conditioning", "Music System / Bluetooth", "USB Charging Points", "Clean & Sanitized Interior"],
    },
    {
      slug: "toyota-innova-crysta-suv",
      vehicleName: "Toyota Innova Crysta",
      vehicleType: VehicleType.SUV,
      description: "Spacious 7-seater SUV ideal for family outstation trips, hill routes, and round trips.",
      capacity: 7,
      luggageCapacity: 4,
      ac: true,
      fuelType: CabFuelType.DIESEL,
      driverAllowance: 300,
      baseFare: 400,
      extraKmCharge: 18,
      nightCharge: 200,
      priceFrom: 3200,
      image: "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=1200&q=80",
      ],
      tripTypes: [CabTripType.LOCAL, CabTripType.OUTSTATION, CabTripType.ONE_WAY, CabTripType.ROUND_TRIP, CabTripType.MULTI_DAY],
      featured: true,
      status: CabStatus.ACTIVE,
      destinationSlug: "rajasthan",
      amenities: ["Air Conditioning", "Music System / Bluetooth", "USB Charging Points", "Pushback Recliner Seats", "Large Luggage Space"],
    },
    {
      slug: "mahindra-xuv700-luxury-suv",
      vehicleName: "Mahindra XUV700 Luxury SUV",
      vehicleType: VehicleType.LUXURY_SUV,
      description: "Premium luxury SUV with plush interiors, large boot space, and advanced safety for executive travel.",
      capacity: 6,
      luggageCapacity: 4,
      ac: true,
      fuelType: CabFuelType.DIESEL,
      driverAllowance: 350,
      baseFare: 500,
      extraKmCharge: 22,
      nightCharge: 250,
      priceFrom: 4200,
      image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80",
      ],
      tripTypes: [CabTripType.OUTSTATION, CabTripType.AIRPORT_TRANSFER, CabTripType.ROUND_TRIP, CabTripType.MULTI_DAY],
      featured: true,
      status: CabStatus.ACTIVE,
      destinationSlug: "kerala",
      amenities: ["Air Conditioning", "Sunroof", "USB Charging Points", "GPS Navigation", "Clean & Sanitized Interior"],
    },
    {
      slug: "force-tempo-traveller-12",
      vehicleName: "Force Tempo Traveller 12 Seater",
      vehicleType: VehicleType.TEMPO_TRAVELLER,
      description: "Comfortable 12-seater tempo traveller for group travel, hill trips, and multi-day tours.",
      capacity: 12,
      luggageCapacity: 8,
      ac: true,
      fuelType: CabFuelType.DIESEL,
      driverAllowance: 350,
      baseFare: 900,
      extraKmCharge: 26,
      nightCharge: 350,
      priceFrom: 5500,
      image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80",
      ],
      tripTypes: [CabTripType.OUTSTATION, CabTripType.MULTI_DAY, CabTripType.ROUND_TRIP],
      featured: false,
      status: CabStatus.ACTIVE,
      destinationSlug: "rajasthan",
      amenities: ["Air Conditioning", "Pushback Recliner Seats", "Reading Lights", "Large Luggage Space", "Music System / Bluetooth"],
    },
    {
      slug: "urbania-luxury-traveller-17",
      vehicleName: "Urbania Luxury Traveller 17 Seater",
      vehicleType: VehicleType.MINI_BUS,
      description: "Luxury 17-seater mini bus with recliner seats, ample luggage space, and premium interiors for big groups.",
      capacity: 17,
      luggageCapacity: 12,
      ac: true,
      fuelType: CabFuelType.DIESEL,
      driverAllowance: 400,
      baseFare: 1200,
      extraKmCharge: 34,
      nightCharge: 450,
      priceFrom: 8500,
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
      ],
      tripTypes: [CabTripType.OUTSTATION, CabTripType.MULTI_DAY, CabTripType.AIRPORT_TRANSFER],
      featured: false,
      status: CabStatus.ACTIVE,
      destinationSlug: "goa",
      amenities: ["Air Conditioning", "Pushback Recliner Seats", "Reading Lights", "Large Luggage Space", "USB Charging Points"],
    },
    {
      slug: "hyundai-creta-hatchback",
      vehicleName: "Hyundai Creta (Premium Hatchback)",
      vehicleType: VehicleType.HATCHBACK,
      description: "Economical and agile hatchback perfect for city runs and short outstation commutes.",
      capacity: 4,
      luggageCapacity: 2,
      ac: true,
      fuelType: CabFuelType.PETROL,
      driverAllowance: 250,
      baseFare: 180,
      extraKmCharge: 11,
      nightCharge: 140,
      priceFrom: 1800,
      image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80",
      ],
      tripTypes: [CabTripType.LOCAL, CabTripType.AIRPORT_TRANSFER, CabTripType.ONE_WAY],
      featured: false,
      status: CabStatus.ACTIVE,
      destinationSlug: "kashmir",
      amenities: ["Air Conditioning", "Music System / Bluetooth", "Clean & Sanitized Interior"],
    },
    {
      slug: "scorpio-n-adventure-suv",
      vehicleName: "Mahindra Scorpio-N Adventure SUV",
      vehicleType: VehicleType.SUV,
      description: "Rugged 7-seater SUV built for Ladakh, hill stations, and long outstation road trips.",
      capacity: 7,
      luggageCapacity: 5,
      ac: true,
      fuelType: CabFuelType.DIESEL,
      driverAllowance: 350,
      baseFare: 450,
      extraKmCharge: 19,
      nightCharge: 220,
      priceFrom: 3500,
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      ],
      tripTypes: [CabTripType.OUTSTATION, CabTripType.MULTI_DAY, CabTripType.ROUND_TRIP],
      featured: false,
      status: CabStatus.ACTIVE,
      destinationSlug: "leh-ladakh",
      amenities: ["Air Conditioning", "USB Charging Points", "GPS Navigation", "Large Luggage Space"],
    },
    {
      slug: "e-triber-electric-hatchback",
      vehicleName: "Tata Tiago EV (Electric)",
      vehicleType: VehicleType.HATCHBACK,
      description: "Eco-friendly electric hatchback for clean, quiet city travel and airport transfers.",
      capacity: 4,
      luggageCapacity: 2,
      ac: true,
      fuelType: CabFuelType.ELECTRIC,
      driverAllowance: 200,
      baseFare: 160,
      extraKmCharge: 10,
      nightCharge: 120,
      priceFrom: 1600,
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80",
      ],
      tripTypes: [CabTripType.LOCAL, CabTripType.AIRPORT_TRANSFER],
      featured: false,
      status: CabStatus.ACTIVE,
      destinationSlug: "andaman",
      amenities: ["Air Conditioning", "USB Charging Points", "Clean & Sanitized Interior"],
    },
  ];

  for (const cabSeed of cabSeeds) {
    const dest = cabSeed.destinationSlug ? seededDestinations[cabSeed.destinationSlug] : undefined;
    const { amenities, destinationSlug, ...cabData } = cabSeed;

    await prisma.vehicle.upsert({
      where: { slug: cabSeed.slug },
      update: {
        ...cabData,
        isActive: true,
        destinationId: dest?.id ?? null,
        amenities: {
          connect: amenities
            .filter((aName) => seededCabAmenities[aName])
            .map((aName) => ({ id: seededCabAmenities[aName].id })),
        },
      },
      create: {
        ...cabData,
        isActive: true,
        destinationId: dest?.id ?? null,
        amenities: {
          connect: amenities
            .filter((aName) => seededCabAmenities[aName])
            .map((aName) => ({ id: seededCabAmenities[aName].id })),
        },
      },
    });
  }

  // Link cabs to packages by destination
  const allPkgs = await prisma.tourPackage.findMany();
  const allCabs = await prisma.vehicle.findMany();

  for (const pkg of allPkgs) {
    const destCabs = allCabs.filter((c) => c.destinationId === pkg.destinationId);
    if (destCabs.length > 0) {
      await prisma.tourPackage.update({
        where: { id: pkg.id },
        data: {
          vehicles: {
            connect: destCabs.map((c) => ({ id: c.id })),
          },
        },
      });
    }
  }

  console.log(`Phase 11 Seed complete. Cabs seeded across destinations and linked to packages.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
