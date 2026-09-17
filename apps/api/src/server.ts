import "dotenv/config";
import { env } from "./config/env.js";
import { createApp } from "./app.js";
import cron from "node-cron";
import { BookingCleanupService } from "./services/booking/booking-cleanup.service.js";

const app = createApp();

app.listen(env.API_PORT, () => {
  console.log(`GoYatrio API foundation listening on port ${env.API_PORT}`);

  // Initialize scheduled jobs
  console.log("[Scheduler] Initializing scheduled jobs...");
  const cleanupService = new BookingCleanupService();

  // Run the cleanup job every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    try {
      await cleanupService.cleanupStaleBookings();
    } catch (error) {
      console.error("[Scheduler] Error in booking cleanup job:", error);
    }
  });
});
