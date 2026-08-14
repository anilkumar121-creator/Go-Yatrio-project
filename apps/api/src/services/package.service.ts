import { prisma } from "@goyatrio/database";

export const packageService = {
  list: (take = 50, skip = 0) =>
    prisma.tourPackage.findMany({
      include: { destination: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  get: (id: string) =>
    prisma.tourPackage.findUnique({
      where: { id },
      include: { destination: true, itineraries: { orderBy: { dayNumber: "asc" } } },
    }),
  create: (data: unknown) => prisma.tourPackage.create({ data: data as never }),
  update: (id: string, data: unknown) =>
    prisma.tourPackage.update({ where: { id }, data: data as never }),
  remove: (id: string) => prisma.tourPackage.update({ where: { id }, data: { isActive: false } }),
};
