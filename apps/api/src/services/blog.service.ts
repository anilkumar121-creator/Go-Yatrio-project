import { prisma } from "@goyatrio/database";

export const blogService = {
  list: (take = 50, skip = 0) =>
    prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  get: (id: string) => prisma.blog.findUnique({ where: { id } }),
  create: (data: unknown) => prisma.blog.create({ data: data as never }),
  update: (id: string, data: unknown) => prisma.blog.update({ where: { id }, data: data as never }),
  remove: (id: string) => prisma.blog.update({ where: { id }, data: { isPublished: false } }),
};
