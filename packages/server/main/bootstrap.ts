/**
 * Bootstrap application dependencies
 * Configure global instances and dependencies before starting the server
 */

import { BaseEntity } from "@core/domain/entities/base-entity";
import { MakeULIDIDGeneratorServiceFactory } from "@core/main/factories/services/make-ulid-id-generator-service.factory";
import { makeRoleDefinitionRepository } from "@iam/main/factories/repositories/make-role-definition-repository.factory";
import { seedGlobalRoles } from "@iam/main/seeds/seed-global-roles";
import { mongoDBClient } from "@core/infra/clients/mongodb-client";

export async function bootstrap() {
  console.log("[Bootstrap] Configuring application dependencies...");

  // Configure BaseEntity with ID generator
  const idGenerator = MakeULIDIDGeneratorServiceFactory();
  BaseEntity.configure({
    IDGenerator: idGenerator,
  });

  console.log("[Bootstrap] ✓ BaseEntity configured with UlidIdGeneratorService");

  // Wait for MongoDB connection before seeding
  try {
    console.log("[Bootstrap] Waiting for MongoDB connection...");
    await mongoDBClient.waitForConnection(10000);
    console.log("[Bootstrap] ✓ MongoDB connected");

    // Seed global roles
    const roleDefinitionRepository = makeRoleDefinitionRepository();
    await seedGlobalRoles(roleDefinitionRepository, idGenerator);
  } catch (error) {
    console.error("[Bootstrap] ✗ Failed to seed global roles:", error);
  }

  console.log("[Bootstrap] ✓ Application dependencies configured successfully\n");
}
