import { IPermissionSnapshotService } from "@core/contracts/services/i-permissions-snapshot-service";
import { PermissionSnapshotService } from "@infra/implementations/services/permission-snapshot-service";
import { makeUserRepository } from "@infra/factories/repositories/user-repository-factory";
import { makeRoleDefinitionRepository } from "@infra/factories/repositories/role-definition-repository-factory";
import { makeRoleAssignmentRepository } from "@infra/factories/repositories/role-assignment-repository-factory";
import { makeCacheRepository } from "@infra/factories/cache/cache-repository-factory";

export function makePermissionSnapshotService(): IPermissionSnapshotService {
  return new PermissionSnapshotService(
    makeUserRepository(),
    makeRoleDefinitionRepository(),
    makeRoleAssignmentRepository(),
    makeCacheRepository()
  );
}
