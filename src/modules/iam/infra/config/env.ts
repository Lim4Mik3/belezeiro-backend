import { z } from "zod";

const envIamSchema = z.object({
  // JWT Configuration
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  // OAuth Google
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GOOGLE_REDIRECT_URI: z.string().url("GOOGLE_REDIRECT_URI must be a valid URL"),

  // Session
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters"),
  SESSION_MAX_AGE_HOURS: z
    .string()
    .default("24")
    .transform(Number)
    .pipe(z.number().positive()),
});

export type EnvIam = z.infer<typeof envIamSchema>;

function loadEnvIam(): EnvIam {
  try {
    const parsed = envIamSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid IAM module environment variables:");
      console.error(JSON.stringify(error.errors, null, 2));
      process.exit(1);
    }
    throw error;
  }
}

export const envIam = loadEnvIam();
