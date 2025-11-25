import { z } from "zod";

const envIamSchema = z.object({
  // Authentication
  AUTH_PROVIDER: z.enum(["google", "github", "local"]).default("google"),
  AUTH_CALLBACK_URL: z.string().url(),

  // OAuth Google
  GOOGLE_CLIENT_ID: z.string().min(1, "Google Client ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "Google Client Secret is required"),

  // Session
  SESSION_SECRET: z
    .string()
    .min(32, "Session secret must be at least 32 characters"),
  SESSION_MAX_AGE: z
    .string()
    .default("86400000")
    .transform(Number)
    .pipe(z.number().min(1)),

  // Password
  PASSWORD_MIN_LENGTH: z
    .string()
    .default("8")
    .transform(Number)
    .pipe(z.number().min(6).max(128)),
  PASSWORD_SALT_ROUNDS: z
    .string()
    .default("10")
    .transform(Number)
    .pipe(z.number().min(4).max(20)),
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
