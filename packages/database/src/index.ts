import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export { prisma, PrismaClient };
export * from "@prisma/client";
