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

export async function businessRoutes(app: FastifyInstance) {
  // Business routes
  app.post("/businesses", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { name, units } = request.body as {
        name: string;
        units: Array<{ name: string }>;
      };

      if (!name) {
        return reply.status(400).send({ error: "Missing required field: name" });
      }

      const useCase = makeCreateBusinessUseCase();
      const result = await useCase.execute({ name, units: units || [] });

      return reply.status(201).send(result);
    } catch (error) {
      console.error("Error in POST /businesses:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.get("/businesses/:id", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const useCase = makeGetBusinessUseCase();
      const result = await useCase.execute({ id });

      if (!result) {
        return reply.status(404).send({ error: "Business not found" });
      }

      return reply.send(result);
    } catch (error) {
      console.error("Error in GET /businesses/:id:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.put("/businesses/:id", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { name } = request.body as { name: string };

      if (!name) {
        return reply.status(400).send({ error: "Missing required field: name" });
      }

      const useCase = makeUpdateBusinessUseCase();
      const result = await useCase.execute({ id, name });

      return reply.send(result);
    } catch (error) {
      console.error("Error in PUT /businesses/:id:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.delete("/businesses/:id", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const useCase = makeDeleteBusinessUseCase();
      await useCase.execute({ id });

      return reply.status(204).send();
    } catch (error) {
      console.error("Error in DELETE /businesses/:id:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Unit routes
  app.post("/businesses/:businessId/units", { preHandler: authMiddleware }, async (request, reply) => {
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

  app.get("/businesses/:businessId/units", { preHandler: authMiddleware }, async (request, reply) => {
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

  app.get("/units/:id", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const useCase = makeGetUnitUseCase();
      const result = await useCase.execute({ id });

      if (!result) {
        return reply.status(404).send({ error: "Unit not found" });
      }

      return reply.send(result);
    } catch (error) {
      console.error("Error in GET /units/:id:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.put("/units/:id", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { name } = request.body as { name: string };

      if (!name) {
        return reply.status(400).send({ error: "Missing required field: name" });
      }

      const useCase = makeUpdateUnitUseCase();
      const result = await useCase.execute({ id, name });

      return reply.send(result);
    } catch (error) {
      console.error("Error in PUT /units/:id:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  app.delete("/units/:id", { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const useCase = makeDeleteUnitUseCase();
      await useCase.execute({ id });

      return reply.status(204).send();
    } catch (error) {
      console.error("Error in DELETE /units/:id:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}
