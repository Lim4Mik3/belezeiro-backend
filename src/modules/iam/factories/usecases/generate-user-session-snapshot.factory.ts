import { GenerateUserSessionSnapshot } from "@iam/usecases/generate-user-session-snapshot";
import { makePermissionSnapshotService } from "@infra/factories/services/permission-snapshot-service-factory";

export function makeGenerateUserSessionSnapshot(): GenerateUserSessionSnapshot {
  return new GenerateUserSessionSnapshot(
    makePermissionSnapshotService(),
  )
}