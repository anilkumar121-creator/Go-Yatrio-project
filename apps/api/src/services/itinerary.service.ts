import { prisma } from "../db.js";

export type ActivityInput = {
  title: string;
  description?: string;
  location?: string;
  timing?: string;
  sortOrder?: number;
};

export type ItineraryCreateInput = {
  packageId: string;
  dayNumber: number;
  title: string;
  description: string;
  location?: string;
  sortOrder?: number;
  activities?: ActivityInput[];
};

export type ItineraryUpdateInput = Partial<ItineraryCreateInput>;

export type DayCreateInput = {
  dayNumber: number;
  sortOrder?: number;
  title: string;
  description: string;
};

export type DayUpdateInput = Partial<DayCreateInput>;

export type ReorderDayInput = {
  dayId: string;
  sortOrder: number;
  dayNumber?: number;
};

export const itineraryService = {
  list: async (take = 50, skip = 0, packageId?: string) => {
    const where = packageId ? { packageId } : {};
    const [total, items] = await Promise.all([
      prisma.itinerary.count({ where }),
      prisma.itinerary.findMany({
        where,
        take,
        skip,
        orderBy: [{ dayNumber: "asc" }],
        include: {
          package: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          activities: {
            orderBy: { sortOrder: "asc" },
          },
        },
      }),
    ]);

    return { total, items };
  },

  get: async (id: string) => {
    return prisma.itinerary.findUnique({
      where: { id },
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
        activities: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  create: async (data: ItineraryCreateInput) => {
    return prisma.itinerary.create({
      data: {
        packageId: data.packageId,
        dayNumber: data.dayNumber,
        title: data.title,
        description: data.description,
        location: data.location,
        sortOrder: data.sortOrder ?? data.dayNumber,
        activities:
          data.activities && data.activities.length > 0
            ? {
                create: data.activities.map((act, actIndex) => ({
                  title: act.title,
                  description: act.description,
                  location: act.location,
                  timing: act.timing,
                  sortOrder: act.sortOrder ?? actIndex + 1,
                })),
              }
            : undefined,
      },
      include: {
        package: true,
        activities: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  update: async (id: string, data: ItineraryUpdateInput) => {
    return prisma.itinerary.update({
      where: { id },
      data: {
        dayNumber: data.dayNumber,
        title: data.title,
        description: data.description,
        location: data.location,
        sortOrder: data.sortOrder,
      },
      include: {
        package: true,
        activities: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  remove: async (id: string) => {
    return prisma.itinerary.delete({
      where: { id },
    });
  },

  addDay: async (packageId: string, data: DayCreateInput) => {
    // Find the highest sortOrder for this package to append at the end
    const lastDay = await prisma.itinerary.findFirst({
      where: { packageId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const nextSortOrder = (lastDay?.sortOrder ?? 0) + 1;

    return prisma.itinerary.create({
      data: {
        packageId,
        dayNumber: data.dayNumber,
        title: data.title,
        description: data.description,
        sortOrder: data.sortOrder ?? nextSortOrder,
      },
      include: {
        package: true,
        activities: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  updateDay: async (dayId: string, data: DayUpdateInput) => {
    return prisma.itinerary.update({
      where: { id: dayId },
      data: {
        dayNumber: data.dayNumber,
        title: data.title,
        description: data.description,
        sortOrder: data.sortOrder,
      },
      include: {
        package: true,
        activities: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  removeDay: async (dayId: string) => {
    return prisma.itinerary.delete({
      where: { id: dayId },
    });
  },

  reorderDays: async (packageId: string, dayOrders: ReorderDayInput[]) => {
    // Use a transaction to update all days atomically
    await prisma.$transaction(
      dayOrders.map(({ dayId, sortOrder, dayNumber }) =>
        prisma.itinerary.update({
          where: { id: dayId },
          data: {
            sortOrder,
            ...(dayNumber !== undefined && { dayNumber }),
          },
        }),
      ),
    );

    // Return the updated itinerary list for the package
    return prisma.itinerary.findMany({
      where: { packageId },
      orderBy: [{ dayNumber: "asc" }],
      include: {
        package: true,
        activities: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  addActivity: async (itineraryId: string, activityData: ActivityInput) => {
    return prisma.activity.create({
      data: {
        itineraryId,
        title: activityData.title,
        description: activityData.description,
        location: activityData.location,
        timing: activityData.timing,
        sortOrder: activityData.sortOrder ?? 1,
      },
    });
  },

  updateActivity: async (activityId: string, activityData: Partial<ActivityInput>) => {
    return prisma.activity.update({
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
    return prisma.activity.delete({
      where: { id: activityId },
    });
  },
};
