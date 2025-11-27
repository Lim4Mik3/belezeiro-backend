import { IAuthzSnapshot } from "@core/dtos/i-authz-snapshot";

export interface IPermissionSnapshotService {
  getUserSession(userId: string): Promise<IAuthzSnapshot | null>;
  invalidateSession(userId: string): Promise<void>;
}
