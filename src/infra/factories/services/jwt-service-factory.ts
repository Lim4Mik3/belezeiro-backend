import { IJWTService } from "@core/contracts/services/i-jwt-service";
import { JoseJWTService } from "@infra/implementations/services/jose-jwt-service";

export function makeJWTService(): IJWTService {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  return new JoseJWTService(secret);
}
