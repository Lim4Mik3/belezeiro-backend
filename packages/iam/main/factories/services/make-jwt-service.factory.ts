import { IJWTService } from "@iam/app/contracts/services/i-jwt-service";
import { JWTService } from "@iam/infra/services/jwt-service";
import { envGlobal } from "@core/infra/config/env-global";

let instance: IJWTService | null = null;

export function makeJWTService(): IJWTService {
  if (!instance) {
    instance = new JWTService(envGlobal.JWT_SECRET);
  }
  return instance;
}
