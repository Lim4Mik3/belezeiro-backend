/**
 * Bootstrap application dependencies
 * Configure global instances and dependencies before starting the server
 */

import { BaseEntity } from "@core/domain/entities/base-entity";
import { MakeULIDIDGeneratorServiceFactory } from "@core/main/factories/services/make-ulid-id-generator-service.factory";

export function bootstrap() {
  console.log("[Bootstrap] Configuring application dependencies...");

  // Configure BaseEntity with ID generator
  const idGenerator = MakeULIDIDGeneratorServiceFactory();
  BaseEntity.configure({
    IDGenerator: idGenerator,
  });

  console.log("[Bootstrap] ✓ BaseEntity configured with UlidIdGeneratorService");
  console.log("[Bootstrap] ✓ Application dependencies configured successfully\n");
}
