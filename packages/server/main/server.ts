import "@core/infra/config/load-env";
import { bootstrap } from "./bootstrap";
import { buildApp } from "./app";
import { env } from "../infra/config/env";
import { RedisQueueProcessor } from "../infra/queue/redis-queue-processor";
import { getAllHandlers } from "../infra/handlers";

async function start() {
  let queueProcessor: RedisQueueProcessor | null = null;

  try {
    // Bootstrap application dependencies
    bootstrap();

    // Iniciar API
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    // Iniciar Queue Processor
    queueProcessor = new RedisQueueProcessor(env.REDIS_URL);

    // Registrar todos os handlers
    const handlers = getAllHandlers();
    handlers.forEach((handler) => {
      queueProcessor!.registerHandler(handler);
    });

    // Iniciar processamento de filas
    await queueProcessor.start();

    const registeredEvents = queueProcessor.getRegisteredEvents();

    console.log(`
    ┌─────────────────────────────────────────────┐
    │                                             │
    │   🚀 Server is running!                     │
    │                                             │
    │   Environment: ${env.NODE_ENV.padEnd(27)}│
    │   URL: http://${env.HOST}:${env.PORT.toString().padEnd(19)}│
    │                                             │
    │   API Routes:                               │
    │   - POST   /api/v1/auth/google              │
    │   - GET    /api/v1/auth/me                  │
    │   - POST   /api/v1/businesses               │
    │   - GET    /api/v1/businesses/:id           │
    │   - PUT    /api/v1/businesses/:id           │
    │   - DELETE /api/v1/businesses/:id           │
    │   - POST   /api/v1/businesses/:id/units     │
    │   - GET    /api/v1/businesses/:id/units     │
    │   - GET    /api/v1/units/:id                │
    │   - PUT    /api/v1/units/:id                │
    │   - DELETE /api/v1/units/:id                │
    │                                             │
    │   Queue Processor:                          │
    │   - Handlers: ${queueProcessor.getHandlerCount().toString().padEnd(28)}│
    │   - Events: ${registeredEvents.join(", ").substring(0, 30).padEnd(32)}│
    │                                             │
    └─────────────────────────────────────────────┘
    `);
  } catch (error) {
    console.error("Error starting server:", error);
    if (queueProcessor) {
      await queueProcessor.stop();
    }
    process.exit(1);
  }

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("\n[Server] SIGTERM received, shutting down gracefully...");
    if (queueProcessor) {
      await queueProcessor.stop();
    }
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("\n[Server] SIGINT received, shutting down gracefully...");
    if (queueProcessor) {
      await queueProcessor.stop();
    }
    process.exit(0);
  });
}

start();
