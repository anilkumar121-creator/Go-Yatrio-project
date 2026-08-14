import { prisma } from "@goyatrio/database";

export const destinationService = {
  list: (take = 50, skip = 0) =>
    prisma.destination.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  get: (id: string) =>
    prisma.destination.findUnique({
      where: { id },
      include: { packages: true, hotels: true },
    }),
  create: (data: unknown) => prisma.destination.create({ data: data as never }),
  update: (id: string, data: unknown) =>
    prisma.destination.update({ where: { id }, data: data as never }),
  remove: (id: string) => prisma.destination.update({ where: { id }, data: { isActive: false } }),
};
