import { FastifyInstance } from "fastify";
import { makeAuthenticateUserWithGoogleUseCase } from "@iam/main/factories/usecases/make-authenticate-user-with-google.factory";

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

      return reply.status(result.created ? 201 : 200).send(result);
    } catch (error) {
      console.error("Error in /auth/google:", error);
      return reply.status(500).send({
        error: "Internal server error",
      });
    }
  });

  app.get("/auth/me", {
    preHandler: async (request, reply) => {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return reply.status(401).send({ error: "Missing authorization header" });
      }

      const [, token] = authHeader.split(" ");
      if (!token) {
        return reply.status(401).send({ error: "Invalid authorization format" });
      }

      try {
        const jwtService = await import("@iam/main/factories/services/make-jwt-service.factory").then(m => m.makeJWTService());
        const payload = await jwtService.verify(token);
        request.userId = payload.sub;
      } catch (error) {
        return reply.status(401).send({ error: "Invalid token" });
      }
    },
  }, async (request, reply) => {
    try {
      const userRepository = await import("@iam/main/factories/repositories/make-user-repository.factory").then(m => m.makeUserRepository());
      const user = await userRepository.findById(request.userId!);

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      return reply.send({
        id: user.id,
        name: user.name,
        email: user.email.value,
        photo_url: user.photo_url?.value || null,
      });
    } catch (error) {
      console.error("Error in /auth/me:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}
