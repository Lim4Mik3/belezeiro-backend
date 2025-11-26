import { GenerateUserSessionSnapshot } from '@iam/app/usecases/generate-user-session-snapshot'
import { makePermissionSnapshotServiceIAM } from '../services/make-permission-snapshot-iam.factory'

export function makeGenerateUserSessionSnapshotUseCase(): GenerateUserSessionSnapshot {
  return new GenerateUserSessionSnapshot(
    makePermissionSnapshotServiceIAM(),
  )
}
