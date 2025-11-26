import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import cookie from "@fastify/cookie";
import { env } from "../infra/config/env";
import { iamRoutes } from "../infra/routes/iam.routes";
import { businessRoutes } from "../infra/routes/business.routes";
import { errorHandlerMiddleware } from "../infra/middlewares/error-handler.middleware";

export async function buildApp() {
  const app = Fastify({
    logger: {
      enabled: false,
      level: env.NODE_ENV === "development" ? "debug" : "info",
      transport:
        env.NODE_ENV === "development"
          ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          }
          : undefined,
    },
  });

  // Security plugins
  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === "production",
  });

  await app.register(cors, {
    origin: env.NODE_ENV === "development" ? "*" : ["https://yourdomain.com"],
    credentials: true,
  });

  // Cookie support
  await app.register(cookie, {
    secret: env.JWT_SECRET, // para assinar cookies (opcional mas recomendado)
    parseOptions: {},
  });

  // Health check
  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Register routes
  await app.register(iamRoutes, { prefix: "/api/v1" });
  await app.register(businessRoutes, { prefix: "/api/v1" });

  // Error handler
  app.setErrorHandler(errorHandlerMiddleware);

  return app;
}
