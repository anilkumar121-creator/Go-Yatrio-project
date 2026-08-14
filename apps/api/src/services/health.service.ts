import { prisma } from "@goyatrio/database";

export async function getHealth() {
  let database = "not_configured";

  if (process.env.DATABASE_URL) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "connected";
    } catch {
      database = "unavailable";
    }
  }

  return {
    status: "ok",
    service: "goyatrio-api",
    database,
    timestamp: new Date().toISOString(),
  };
}
