import { FastifyRequest, FastifyReply } from "fastify";
import { makeJWTService } from "@iam/main/factories/services/make-jwt-service.factory";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({ error: "Missing authorization header" });
    }

    const [, token] = authHeader.split(" ");

    if (!token) {
      return reply.status(401).send({ error: "Invalid authorization format" });
    }

    const jwtService = makeJWTService();
    const payload = await jwtService.verify(token);

    // Adiciona o userId ao request
    request.userId = payload.sub;
  } catch (error) {
    return reply.status(401).send({ error: "Invalid token" });
  }
}

// Extensão de tipos para adicionar userId ao request
declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}
