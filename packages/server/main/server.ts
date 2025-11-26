import "@core/infra/config/load-env";
import { bootstrap } from "./bootstrap";
import { buildApp } from "./app";
import { env } from "../infra/config/env";
import { RedisQueueProcessor } from "../infra/queue/redis-queue-processor";
import { getAllHandlers } from "../infra/handlers";

async function start() {
  let queueProcessor: RedisQueueProcessor | null = null;

  try {
    console.log("🚀 Starting Belezeiro Server...\n");

    // ============================================
    // FASE 1: Bootstrap de dependências
    // ============================================
    await bootstrap();

    // ============================================
    // FASE 2: Inicializar Queue Processor
    // ============================================
    console.log("📦 Initializing Queue Processor...");
    queueProcessor = new RedisQueueProcessor(env.REDIS_URL);

    // Registrar todos os handlers
    const handlers = getAllHandlers();
    console.log(`[Server] Registering ${handlers.length} event handlers...`);
    handlers.forEach((handler) => {
      queueProcessor!.registerHandler(handler);
    });

    // Inicializar (criar consumer groups, aguardar Redis)
    await queueProcessor.initialize();

    // Iniciar processamento
    await queueProcessor.start();

    const registeredEvents = queueProcessor.getRegisteredEvents();
    console.log(`[Server] ✓ Queue Processor ready with ${queueProcessor.getHandlerCount()} handlers\n`);

    // ============================================
    // FASE 3: Inicializar API
    // ============================================
    console.log("🌐 Starting API server...");
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    // ============================================
    // FASE 4: Sucesso!
    // ============================================
    console.log(`
    ┌─────────────────────────────────────────────┐
    │                                             │
    │   ✨ Server is running!                     │
    │                                             │
    │   Environment: ${env.NODE_ENV.padEnd(27)}│
    │   URL: http://${env.HOST}:${env.PORT.toString().padEnd(19)}│
    │                                             │
    │   API Routes:                               │
    │   - POST   /api/v1/auth/google              │
    │   - GET    /api/v1/auth/me                  │
    │   - POST   /api/v1/business               │
    │   - GET    /api/v1/business/:id           │
    │   - PUT    /api/v1/business/:id           │
    │   - DELETE /api/v1/business/:id           │
    │   - POST   /api/v1/business/:id/units     │
    │   - GET    /api/v1/business/:id/units     │
    │   - GET    /api/v1/unit/:id                │
    │   - PUT    /api/v1/unit/:id                │
    │   - DELETE /api/v1/unit/:id                │
    │                                             │
    │   Queue Processor:                          │
    │   - Status: ${queueProcessor.isRunning() ? "RUNNING" : "STOPPED"}                        │
    │   - Handlers: ${queueProcessor.getHandlerCount().toString().padEnd(28)}│
    │   - Events: ${registeredEvents.slice(0, 2).map(e => e.split('.').pop()).join(', ').substring(0, 30).padEnd(32)}│
    │                                             │
    └─────────────────────────────────────────────┘
    `);
  } catch (error) {
    console.error("\n❌ Error starting server:", error);
    if (queueProcessor) {
      await queueProcessor.stop();
    }
    process.exit(1);
  }

  // ============================================
  // Graceful Shutdown
  // ============================================
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n[Server] ${signal} received, shutting down gracefully...`);

    if (queueProcessor) {
      await queueProcessor.stop();
    }

    console.log("[Server] ✓ Shutdown complete");
    process.exit(0);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

start();
