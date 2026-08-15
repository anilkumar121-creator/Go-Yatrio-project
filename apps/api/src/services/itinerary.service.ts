import { prisma } from "@goyatrio/database";

export type DayActivityInput = {
  title: string;
  description?: string;
  location?: string;
  timing?: string;
  sortOrder?: number;
};

export type ItineraryDayInput = {
  dayNumber: number;
  sortOrder?: number;
  title: string;
  description: string;
  city?: string;
  hotel?: string;
  meals?: string;
  transfers?: string;
  notes?: string;
  activities?: DayActivityInput[];
};

export type ItineraryCreateInput = {
  packageId: string;
  title: string;
  slug?: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
  days?: ItineraryDayInput[];
};

export type ItineraryUpdateInput = Partial<Omit<ItineraryCreateInput, "packageId">>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function generateUniqueItinerarySlug(title: string, excludeId?: string) {
  const base = slugify(title) || "itinerary";
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.itinerary.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || (excludeId && existing.id === excludeId)) {
      return candidate;
    }

    candidate = `${base}-${counter}`;
    counter++;
  }
}

export const itineraryService = {
  list: async (take = 50, skip = 0, packageId?: string) => {
    const where = packageId ? { packageId } : {};
    const [total, items] = await Promise.all([
      prisma.itinerary.count({ where }),
      prisma.itinerary.findMany({
        where,
        take,
        skip,
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        include: {
          package: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          days: {
            orderBy: { sortOrder: "asc" },
            include: {
              activities: {
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      }),
    ]);

    return { total, items };
  },

  get: async (idOrSlug: string) => {
    return prisma.itinerary.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        package: {
          select: {
            id: true,
            title: true,
            slug: true,
            durationDays: true,
            durationNights: true,
            priceFrom: true,
            currency: true,
            destination: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        days: {
          orderBy: { sortOrder: "asc" },
          include: {
            activities: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });
  },

  create: async (data: ItineraryCreateInput) => {
    const slug = data.slug ? slugify(data.slug) : await generateUniqueItinerarySlug(data.title);

    return prisma.itinerary.create({
      data: {
        packageId: data.packageId,
        title: data.title,
        slug,
        description: data.description,
        isDefault: data.isDefault ?? true,
        isActive: data.isActive ?? true,
        days: data.days && data.days.length > 0
          ? {
              create: data.days.map((day, dayIndex) => ({
                dayNumber: day.dayNumber ?? dayIndex + 1,
                sortOrder: day.sortOrder ?? day.dayNumber ?? dayIndex + 1,
                title: day.title,
                description: day.description,
                city: day.city,
                hotel: day.hotel,
                meals: day.meals,
                transfers: day.transfers,
                notes: day.notes,
                activities: day.activities && day.activities.length > 0
                  ? {
                      create: day.activities.map((act, actIndex) => ({
                        title: act.title,
                        description: act.description,
                        location: act.location,
                        timing: act.timing,
                        sortOrder: act.sortOrder ?? actIndex + 1,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        package: true,
        days: {
          orderBy: { sortOrder: "asc" },
          include: {
            activities: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });
  },

  update: async (id: string, data: ItineraryUpdateInput) => {
    let slug: string | undefined = undefined;
    if (data.slug || data.title) {
      slug = await generateUniqueItinerarySlug(data.slug ?? data.title ?? "itinerary", id);
    }

    return prisma.itinerary.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        description: data.description,
        isDefault: data.isDefault,
        isActive: data.isActive,
      },
      include: {
        package: true,
        days: {
          orderBy: { sortOrder: "asc" },
          include: {
            activities: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });
  },

  remove: async (id: string) => {
    return prisma.itinerary.delete({
      where: { id },
    });
  },

  addDay: async (itineraryId: string, dayData: ItineraryDayInput) => {
    return prisma.itineraryDay.create({
      data: {
        itineraryId,
        dayNumber: dayData.dayNumber,
        sortOrder: dayData.sortOrder ?? dayData.dayNumber,
        title: dayData.title,
        description: dayData.description,
        city: dayData.city,
        hotel: dayData.hotel,
        meals: dayData.meals,
        transfers: dayData.transfers,
        notes: dayData.notes,
        activities: dayData.activities && dayData.activities.length > 0
          ? {
              create: dayData.activities.map((act, idx) => ({
                title: act.title,
                description: act.description,
                location: act.location,
                timing: act.timing,
                sortOrder: act.sortOrder ?? idx + 1,
              })),
            }
          : undefined,
      },
      include: {
        activities: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  updateDay: async (dayId: string, dayData: Partial<ItineraryDayInput>) => {
    return prisma.itineraryDay.update({
      where: { id: dayId },
      data: {
        dayNumber: dayData.dayNumber,
        sortOrder: dayData.sortOrder,
        title: dayData.title,
        description: dayData.description,
        city: dayData.city,
        hotel: dayData.hotel,
        meals: dayData.meals,
        transfers: dayData.transfers,
        notes: dayData.notes,
      },
      include: {
        activities: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  removeDay: async (dayId: string) => {
    return prisma.itineraryDay.delete({
      where: { id: dayId },
    });
  },

  reorderDays: async (
    itineraryId: string,
    dayOrders: { dayId: string; sortOrder: number; dayNumber?: number }[]
  ) => {
    const transactions = dayOrders.map((item) =>
      prisma.itineraryDay.update({
        where: { id: item.dayId, itineraryId },
        data: {
          sortOrder: item.sortOrder,
          dayNumber: item.dayNumber ?? item.sortOrder,
        },
      })
    );

    await prisma.$transaction(transactions);

    return prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: {
        days: {
          orderBy: { sortOrder: "asc" },
          include: {
            activities: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });
  },

  addActivity: async (dayId: string, activityData: DayActivityInput) => {
    return prisma.dayActivity.create({
      data: {
        dayId,
        title: activityData.title,
        description: activityData.description,
        location: activityData.location,
        timing: activityData.timing,
        sortOrder: activityData.sortOrder ?? 1,
      },
    });
  },

  updateActivity: async (activityId: string, activityData: Partial<DayActivityInput>) => {
    return prisma.dayActivity.update({
      where: { id: activityId },
      data: {
        title: activityData.title,
        description: activityData.description,
        location: activityData.location,
        timing: activityData.timing,
        sortOrder: activityData.sortOrder,
      },
    });
  },

  removeActivity: async (activityId: string) => {
    return prisma.dayActivity.delete({
      where: { id: activityId },
    });
  },
};
