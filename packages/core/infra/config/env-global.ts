import { z } from "zod";

const envGlobalSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000").transform(Number),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default("info"),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis Local
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.string().default("6379").transform(Number),
  REDIS_PASSWORD: z.string().optional(),

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),

  // MongoDB
  MONGODB_URL: z.string().url().default("mongodb://admin:admin123@localhost:27017"),
  MONGODB_DATABASE: z.string().default("belezeiro"),

  // JWT
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  // API
  API_VERSION: z.string().default("v1"),

  // Repository
  REPOSITORY_TYPE: z.enum(["mongodb", "in-memory"]).default("mongodb"),
});

export type EnvGlobal = z.infer<typeof envGlobalSchema>;

function loadEnvGlobal(): EnvGlobal {
  try {
    const parsed = envGlobalSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid global environment variables:");
      console.error(JSON.stringify(error.errors, null, 2));
      process.exit(1);
    }
    throw error;
  }
}

export const envGlobal = loadEnvGlobal();
