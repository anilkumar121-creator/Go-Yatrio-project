import { z } from "zod";

const envSchema = z
  .object({
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
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
    BOOKING_PENDING_PAYMENT_TIMEOUT_MINUTES: z.coerce.number().int().positive().default(30),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().email().default("noreply@goyatrio.com"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "production") {
      if (data.JWT_SECRET === "development_secret_key_goyatrio_2026_min_32_chars") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "A secure, custom JWT_SECRET must be configured in production (cannot use development default).",
        });
      }

      if (!data.DATABASE_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "DATABASE_URL is required in production.",
        });
      }

      const missingCloudinary = [
        data.CLOUDINARY_CLOUD_NAME ? null : "CLOUDINARY_CLOUD_NAME",
        data.CLOUDINARY_API_KEY ? null : "CLOUDINARY_API_KEY",
        data.CLOUDINARY_API_SECRET ? null : "CLOUDINARY_API_SECRET",
      ].filter(Boolean);

      if (missingCloudinary.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Cloudinary environment variables are required in production: ${missingCloudinary.join(", ")}`,
        });
      }

      if (!data.RAZORPAY_KEY_ID || !data.RAZORPAY_KEY_SECRET || !data.RAZORPAY_WEBHOOK_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET) are required in production.`,
        });
      }

      if (!data.RESEND_API_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "RESEND_API_KEY is required in production.",
        });
      }
    }
  });

export const env = envSchema.parse(process.env);

export function requireJwtSecret() {
  return env.JWT_SECRET;
}

export function requireCloudinaryConfig() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary configuration is missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    apiSecret: CLOUDINARY_API_SECRET,
  };
}
