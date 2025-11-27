import { makePermissionSnapshotService } from "@infra/factories/services/permission-snapshot-service-factory";

/**
 * IAM-specific factory for PermissionSnapshotService
 * This wraps the core factory
 */
export function makePermissionSnapshotServiceIAM() {
  return makePermissionSnapshotService();
}
