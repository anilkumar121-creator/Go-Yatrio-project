import { prisma } from "@goyatrio/database";

export const inquiryService = {
  list: (take = 50, skip = 0) =>
    prisma.travelInquiry.findMany({
      include: { package: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  get: (id: string) => prisma.travelInquiry.findUnique({ where: { id }, include: { package: true } }),
  create: (data: unknown) => prisma.travelInquiry.create({ data: data as never }),
  update: (id: string, data: unknown) =>
    prisma.travelInquiry.update({ where: { id }, data: data as never }),
  remove: (id: string) =>
    prisma.travelInquiry.update({ where: { id }, data: { status: "CLOSED" } }),
};
