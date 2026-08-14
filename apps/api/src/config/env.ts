import { z } from "zod";

const envSchema = z.object({
  API_PORT: z.coerce.number().int().positive().default(4000),
  API_CORS_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);

export function requireJwtSecret() {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required for authentication.");
  }

  return env.JWT_SECRET;
}

export function getCloudinaryConfig() {
  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME ?? "placeholder_cloud_name",
    apiKey: env.CLOUDINARY_API_KEY ?? "placeholder_api_key",
    apiSecret: env.CLOUDINARY_API_SECRET ?? "placeholder_api_secret",
  };
}