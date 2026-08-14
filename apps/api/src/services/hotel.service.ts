import { prisma } from "@goyatrio/database";

export const hotelService = {
  list: (take = 50, skip = 0) =>
    prisma.hotel.findMany({
      include: { destination: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  get: (id: string) => prisma.hotel.findUnique({ where: { id }, include: { destination: true } }),
  create: (data: unknown) => prisma.hotel.create({ data: data as never }),
  update: (id: string, data: unknown) =>
    prisma.hotel.update({ where: { id }, data: data as never }),
  remove: (id: string) => prisma.hotel.update({ where: { id }, data: { isActive: false } }),
};
