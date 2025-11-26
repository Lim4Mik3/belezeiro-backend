import { z } from "zod";

const envBusinessSchema = z.object({
  // Database Configuration
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  DATABASE_POOL_MIN: z
    .string()
    .default("2")
    .transform(Number)
    .pipe(z.number().positive()),
  DATABASE_POOL_MAX: z
    .string()
    .default("10")
    .transform(Number)
    .pipe(z.number().positive()),

  // Business Settings
  MAX_UNITS_PER_BUSINESS: z
    .string()
    .default("100")
    .transform(Number)
    .pipe(z.number().positive()),
  BUSINESS_NAME_MAX_LENGTH: z
    .string()
    .default("100")
    .transform(Number)
    .pipe(z.number().positive()),
});

export type EnvBusiness = z.infer<typeof envBusinessSchema>;

function loadEnvBusiness(): EnvBusiness {
  try {
    const parsed = envBusinessSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid business module environment variables:");
      console.error(JSON.stringify(error.errors, null, 2));
      process.exit(1);
    }
    throw error;
  }
}

export const envBusiness = loadEnvBusiness();
