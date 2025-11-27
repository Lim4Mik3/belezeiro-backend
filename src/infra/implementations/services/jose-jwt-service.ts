import { IJWTService } from "@core/contracts/services/i-jwt-service";
import { UnauthorizedError } from "@infra/errors/unauthorized-error";
import { SignJWT, jwtVerify } from "jose";

export class JoseJWTService implements IJWTService {
  private secretKey: Uint8Array;

  constructor(secret: string) {
    this.secretKey = new TextEncoder().encode(secret);
  }

  async assign(payload: { sub: string }): Promise<string> {
    const token = await new SignJWT({ sub: payload.sub })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(this.secretKey);

    return token;
  }

  async verify(token: string): Promise<{ sub: string }> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey);

      if (!payload.sub || typeof payload.sub !== "string") {
        throw new UnauthorizedError("Invalid token: missing or invalid sub claim");
      }

      return { sub: payload.sub };
    } catch (error) {
      throw new UnauthorizedError();
    }
  }
}