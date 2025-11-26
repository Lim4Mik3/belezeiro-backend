import { makePermissionSnapshotService } from "packages/_core_/main/factories/services/make-permission-snapshot.factory";

/**
 * IAM-specific factory for PermissionSnapshotService
 * This wraps the core factory
 */
export function makePermissionSnapshotServiceIAM() {
  return makePermissionSnapshotService();
}
