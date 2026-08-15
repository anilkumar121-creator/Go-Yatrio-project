import { z } from "zod";

const envSchema = z.object({
  API_PORT: z.coerce.number().int().positive().default(4000),
  API_CORS_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32).default("development_secret_key_goyatrio_2026_min_32_chars"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);

export function requireJwtSecret() {
  return env.JWT_SECRET;
}

export function getCloudinaryConfig() {
  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME ?? "placeholder_cloud_name",
    apiKey: env.CLOUDINARY_API_KEY ?? "placeholder_api_key",
    apiSecret: env.CLOUDINARY_API_SECRET ?? "placeholder_api_secret",
  };
}