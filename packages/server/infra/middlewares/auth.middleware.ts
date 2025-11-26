import { FastifyRequest, FastifyReply } from "fastify";
import { AuthorizationGuard } from "@core/infra/middlewares/authorization-guard";
import { IAuthzSnapshot } from "@core/app/contracts/i-authz-snapshot";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  let token: string | undefined;

  const sessionCookie = request.cookies.session;
  if (sessionCookie) {
    token = sessionCookie;
  }

  if (!token) {
    return reply.status(401).send({ error: "Missing authentication token" });
  }

  try {
    const { userId, permissions } = await AuthorizationGuard({ token });

    request.userId = userId;
    request.permissions = permissions;
  } catch (error) {
    return reply.status(401).send({ error: "Invalid token" });
  }
}

// Extensão de tipos para adicionar userId ao request
declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    permissions: IAuthzSnapshot;
  }
}
