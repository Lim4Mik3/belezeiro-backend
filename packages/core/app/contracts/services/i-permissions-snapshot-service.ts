import { IAuthzSnapshot } from "@core/app/contracts/i-authz-snapshot";

export interface IPermissionSnapshotService {
  getUserSession(userId: string): Promise<IAuthzSnapshot | null>;
  invalidateSession(userId: string): Promise<void>;
}
