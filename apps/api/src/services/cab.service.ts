import { prisma } from "@goyatrio/database";

export const cabService = {
  list: (take = 50, skip = 0) =>
    prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  get: (id: string) => prisma.vehicle.findUnique({ where: { id } }),
  create: (data: unknown) => prisma.vehicle.create({ data: data as never }),
  update: (id: string, data: unknown) =>
    prisma.vehicle.update({ where: { id }, data: data as never }),
  remove: (id: string) => prisma.vehicle.update({ where: { id }, data: { isActive: false } }),
};
