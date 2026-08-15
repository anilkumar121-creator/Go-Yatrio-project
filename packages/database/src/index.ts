import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  goYatrioPrisma?: PrismaClient;
};

function getPrismaClient() {
  if (!globalForPrisma.goYatrioPrisma) {
    globalForPrisma.goYatrioPrisma = new PrismaClient();
  }

  return globalForPrisma.goYatrioPrisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(getPrismaClient(), property, receiver);
  },
});

export * from "@prisma/client";