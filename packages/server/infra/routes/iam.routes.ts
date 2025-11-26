import { FastifyInstance } from "fastify";
import { makeAuthenticateUserWithGoogleUseCase } from "@iam/main/factories/usecases/make-authenticate-user-with-google.factory";
import { authMiddleware } from "../middlewares/auth.middleware";
import { makeCreateRoleDefinitionUseCase } from "@iam/main/factories/usecases/make-create-role-definition.factory";
import { makeUpdateRoleDefinitionUseCase } from "@iam/main/factories/usecases/make-update-role-definition.factory";
import { makeGetRoleDefinitionByIdUseCase } from "@iam/main/factories/usecases/make-get-role-definition-by-id.factory";
import { makeListRoleDefinitionsUseCase } from "@iam/main/factories/usecases/make-list-role-definitions.factory";
import { makeDeleteRoleDefinitionUseCase } from "@iam/main/factories/usecases/make-delete-role-definition.factory";
import { can } from "@core/app/services/authorization.service";
import { PERMISSIONS } from "@iam/domain/permissions/permission-registry";

export async function iamRoutes(app: FastifyInstance) {
  app.post("/auth/google", async (request, reply) => {
    try {
      const { name, email, photo_url, provider_id } = request.body as {
        name: string;
        email: string;
        photo_url: string | null;
        provider_id: string;
      };

      if (!name || !email || !provider_id) {
        return reply.status(400).send({
          error: "Missing required fields: name, email, provider_id",
        });
      }

      const useCase = makeAuthenticateUserWithGoogleUseCase();
      const result = await useCase.execute({
        name,
        email,
        photo_url,
        provider_id,
      });

      // Setar cookie de sessão com o token
      reply.setCookie("session", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });

      return reply.status(result.created ? 201 : 200).send({
        token: result.token,
        created: result.created,
      });
    } catch (error) {
      console.error("Error in /auth/google:", error);
      return reply.status(500).send({
        error: "Internal server error",
      });
    }
  });

  app.get("/auth/me", { preHandler: authMiddleware }, async (request, reply) => {
    if (!can(request.permissions, PERMISSIONS.USERS.READ_OWN)) {
      throw new Error("Voce nao pode ver!");
    }

    try {
      return reply.send({ me: request.userId, message: "Hello" });
    } catch (error) {
      console.error("Error in /auth/me:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Role Definition routes
  app.post("/role-definitions", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { name, scope, description, permissions, business_id } = request.body as {
        name: string;
        scope: string;
        description: string;
        permissions: string[];
        business_id?: string;
      };

      if (!name || !scope || !description || !permissions) {
        return reply.status(400).send({
          error: "Missing required fields: name, scope, description, permissions",
        });
      }

      const useCase = makeCreateRoleDefinitionUseCase();
      const result = await useCase.execute({
        name,
        scope: scope as any,
        description,
        permissions,
        created_by: request.userId,
        business_id,
      });

      return reply.status(201).send(result);
    } catch (error: any) {
      console.error("Error in POST /role-definitions:", error);

      if (error.message?.includes("already exists") || error.message?.includes("Invalid")) {
        return reply.status(400).send({ error: error.message });
      }

      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.get("/role-definitions", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { businessId, globalOnly } = request.query as {
        businessId?: string;
        globalOnly?: string;
      };

      const useCase = makeListRoleDefinitionsUseCase();
      const result = await useCase.execute({
        businessId,
        globalOnly: globalOnly === 'true',
      });

      return reply.send(result);
    } catch (error) {
      console.error("Error in GET /role-definitions:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.get("/role-definitions/:id", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const useCase = makeGetRoleDefinitionByIdUseCase();
      const result = await useCase.execute({ id });

      return reply.send(result);
    } catch (error: any) {
      console.error("Error in GET /role-definitions/:id:", error);

      if (error.message === "Role definition not found") {
        return reply.status(404).send({ error: error.message });
      }

      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.put("/role-definitions/:id", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { name, description, permissions } = request.body as {
        name?: string;
        description?: string;
        permissions?: string[];
      };

      const useCase = makeUpdateRoleDefinitionUseCase();
      const result = await useCase.execute({
        id,
        name,
        description,
        permissions,
      });

      return reply.send(result);
    } catch (error: any) {
      console.error("Error in PUT /role-definitions/:id:", error);

      if (error.message === "Role definition not found") {
        return reply.status(404).send({ error: error.message });
      }

      if (error.message?.includes("already exists") || error.message?.includes("Invalid")) {
        return reply.status(400).send({ error: error.message });
      }

      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.delete("/role-definitions/:id", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const useCase = makeDeleteRoleDefinitionUseCase();
      await useCase.execute({ id });

      return reply.status(204).send();
    } catch (error: any) {
      console.error("Error in DELETE /role-definitions/:id:", error);

      if (error.message === "Role definition not found") {
        return reply.status(404).send({ error: error.message });
      }

      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}
