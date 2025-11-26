import { CreateUserPermissionSnapshotCacheKey } from "../utils/create-user-permission-snapshot-cache-key.utils";

const Guard = async (input: Guard.Input): Guard.Output => {
  const { token } = input;
  const JWTService = makeJWTService();

  const { sub } = await JWTService.verify(token) as { sub: string };

  const CacheRepository = makeCacheRepository();

  const snapshotKey = CreateUserPermissionSnapshotCacheKey(sub);
  let snapshot = await CacheRepository.get<IAuthzSnapshot>(snapshotKey);

  if (!snapshot) {
    const PermissionSnapshotService = makePermissionSnapshotService();
    snapshot = await PermissionSnapshotService.getUserSession(sub);

    if (!snapshot) {
      throw new Error('User not found or has no permissions');
    }
  }

  return {
    userId: sub,
    permissions: snapshot
  }
}

namespace Guard {
  export type Input = {
    token: string
  }

  export type Output = Promise<{
    userId: string;
    permissions: IAuthzSnapshot;
  }>
}

export { Guard as AuthorizationGuard };
