import { z } from "zod";

const envCoreSchema = z.object({
  // Event Bus
  EVENT_BUS_TYPE: z.enum(["redis", "memory"]).default("redis"),
  EVENT_BUS_RETRY_ATTEMPTS: z
    .string()
    .default("3")
    .transform(Number)
    .pipe(z.number().min(1).max(10)),
  EVENT_BUS_RETRY_DELAY: z
    .string()
    .default("1000")
    .transform(Number)
    .pipe(z.number().min(100)),

  // ID Generation
  ID_GENERATOR_TYPE: z.enum(["ulid", "uuid"]).default("ulid"),

  // Cache
  CACHE_TTL: z
    .string()
    .default("3600")
    .transform(Number)
    .pipe(z.number().min(1)),
  CACHE_MAX_SIZE: z
    .string()
    .default("1000")
    .transform(Number)
    .pipe(z.number().min(1)),
});

export type EnvCore = z.infer<typeof envCoreSchema>;

function loadEnvCore(): EnvCore {
  try {
    const parsed = envCoreSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid core module environment variables:");
      console.error(JSON.stringify(error, null, 2));
      process.exit(1);
    }
    throw error;
  }
}

export const envCore = loadEnvCore();
