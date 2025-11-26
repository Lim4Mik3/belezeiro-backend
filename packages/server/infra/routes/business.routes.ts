import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware";
import { makeCreateBusinessUseCase } from "@business/main/factories/usecases/make-create-business.factory";
import { makeCreateUnitUseCase } from "@business/main/factories/usecases/make-create-unit.factory";
import { makeGetBusinessUseCase } from "@business/main/factories/usecases/make-get-business.factory";
import { makeGetUnitUseCase } from "@business/main/factories/usecases/make-get-unit.factory";
import { makeUpdateBusinessUseCase } from "@business/main/factories/usecases/make-update-business.factory";
import { makeUpdateUnitUseCase } from "@business/main/factories/usecases/make-update-unit.factory";
import { makeDeleteBusinessUseCase } from "@business/main/factories/usecases/make-delete-business.factory";
import { makeDeleteUnitUseCase } from "@business/main/factories/usecases/make-delete-unit.factory";
import { makeListUnitsByBusinessUseCase } from "@business/main/factories/usecases/make-list-units-by-business.factory";
import { can } from "@core/app/services/authorization.service";
import { PERMISSIONS } from "@iam/domain/permissions/permission-registry";

export async function businessRoutes(app: FastifyInstance) {
  // Business routes
  app.post("/business", { preHandler: authMiddleware }, async (request, reply) => {
    if (!can(request.permissions, PERMISSIONS.BUSINESS.CREATE)) {
      throw new Error("You have no privilegies to execute this action.")
    }

    try {
      const { name, unit } = request.body as {
        name: string;
        unit: { name: string }
      };

      if (!name) {
        return reply.status(400).send({ error: "Missing required field: name" });
      }

      const useCase = makeCreateBusinessUseCase();
      const result = await useCase.execute({
        userId: request.userId!,
        name,
        unit: { name: unit.name }
      });

      return reply.status(201).send(result);
    } catch (error) {
      console.error("Error in POST /businesses:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.get("/business/:id", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const useCase = makeGetBusinessUseCase();
      const result = await useCase.execute({ businessId: id });

      if (!result) {
        return reply.status(404).send({ error: "Business not found" });
      }

      return reply.send(result);
    } catch (error) {
      console.error("Error in GET /businesses/:id:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.put("/business/:id", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { name } = request.body as { name: string };

      if (!name) {
        return reply.status(400).send({ error: "Missing required field: name" });
      }

      const useCase = makeUpdateBusinessUseCase();
      const result = await useCase.execute({ businessId: id, name });

      return reply.send(result);
    } catch (error) {
      console.error("Error in PUT /businesses/:id:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.delete("/business/:id", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const useCase = makeDeleteBusinessUseCase();
      await useCase.execute({ businessId: id });

      return reply.status(204).send();
    } catch (error) {
      console.error("Error in DELETE /businesses/:id:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Unit routes
  app.post("/business/:businessId/units", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { businessId } = request.params as { businessId: string };
      const { name } = request.body as { name: string };

      if (!name) {
        return reply.status(400).send({ error: "Missing required field: name" });
      }

      const useCase = makeCreateUnitUseCase();
      const result = await useCase.execute({ businessId, name });

      return reply.status(201).send(result);
    } catch (error: any) {
      console.error("Error in POST /businesses/:businessId/units:", error);

      if (error.message === "Business not found") {
        return reply.status(404).send({ error: error.message });
      }

      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.get("/business/:businessId/units", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { businessId } = request.params as { businessId: string };

      const useCase = makeListUnitsByBusinessUseCase();
      const result = await useCase.execute({ businessId });

      return reply.send(result);
    } catch (error) {
      console.error("Error in GET /businesses/:businessId/units:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.get("/unit/:id", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const useCase = makeGetUnitUseCase();
      const result = await useCase.execute({ unitId: id });

      if (!result) {
        return reply.status(404).send({ error: "Unit not found" });
      }

      return reply.send(result);
    } catch (error) {
      console.error("Error in GET /units/:id:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.put("/unit/:id", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { name } = request.body as { name: string };

      if (!name) {
        return reply.status(400).send({ error: "Missing required field: name" });
      }

      const useCase = makeUpdateUnitUseCase();
      const result = await useCase.execute({ unitId: id, name });

      return reply.send(result);
    } catch (error) {
      console.error("Error in PUT /units/:id:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.delete("/unit/:id", { preHandler: authMiddleware }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const useCase = makeDeleteUnitUseCase();
    await useCase.execute({ unitId: id });

    return reply.status(204).send();
  });
}
