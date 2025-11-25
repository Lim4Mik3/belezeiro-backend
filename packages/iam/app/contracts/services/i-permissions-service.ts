import { IAuthzSnapshot } from "@core/app/contracts/i-authz-snapshot";

export interface IPermissionsService {
  createSnapshot(user_id: string): Promise<IAuthzSnapshot>
}