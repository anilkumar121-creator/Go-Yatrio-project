import "dotenv/config";
import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

app.listen(env.API_PORT, () => {
  console.log(`GoYatrio API foundation listening on port ${env.API_PORT}`);
});
