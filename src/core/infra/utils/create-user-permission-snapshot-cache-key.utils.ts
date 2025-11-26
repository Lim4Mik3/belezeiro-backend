export const CreateUserPermissionSnapshotCacheKey = (userId: string) => {
  return `user:permission-snapshot:${userId}`;
}