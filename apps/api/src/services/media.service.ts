import { prisma } from "@goyatrio/database";

export const mediaService = {
  list: (take = 50, skip = 0) =>
    prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  get: (id: string) => prisma.media.findUnique({ where: { id } }),
  create: (data: unknown) => prisma.media.create({ data: data as never }),
  update: (id: string, data: unknown) => prisma.media.update({ where: { id }, data: data as never }),
  remove: (id: string) => prisma.media.delete({ where: { id } }),
};
