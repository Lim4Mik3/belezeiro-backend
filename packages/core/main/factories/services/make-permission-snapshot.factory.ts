import { makeCacheRepository } from "@core/main/factories/make-cache-repository.factory";
import { PermissionSnapshotService } from "@core/infra/services/permission-snapshot.service";
import { makeRoleAssignmentRepository, makeRoleDefinitionRepository, makeUserRepository } from "../repositories";

export function makePermissionSnapshotService(): PermissionSnapshotService {
  const cacheRepository = makeCacheRepository();

  return new PermissionSnapshotService(
    makeUserRepository(),
    makeRoleDefinitionRepository(),
    makeRoleAssignmentRepository(),
    cacheRepository
  );
}
