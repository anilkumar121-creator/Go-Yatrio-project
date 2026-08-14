import { prisma } from "@goyatrio/database";

export const itineraryService = {
  list: (take = 50, skip = 0) =>
    prisma.itinerary.findMany({
      orderBy: [{ packageId: "asc" }, { dayNumber: "asc" }],
      skip,
      take,
    }),
  get: (id: string) => prisma.itinerary.findUnique({ where: { id }, include: { package: true } }),
  create: (data: unknown) => prisma.itinerary.create({ data: data as never }),
  update: (id: string, data: unknown) =>
    prisma.itinerary.update({ where: { id }, data: data as never }),
  remove: (id: string) => prisma.itinerary.delete({ where: { id } }),
};
