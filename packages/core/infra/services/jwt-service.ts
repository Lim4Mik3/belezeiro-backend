import { IJWTService } from "@core/app/contracts/services/i-jwt-service";
import { SignJWT, jwtVerify } from "jose";

export class JWTService implements IJWTService {
  private secretKey: Uint8Array;

  constructor(secret: string) {
    // Convert secret string to Uint8Array for jose
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
        throw new Error("Invalid token: missing or invalid sub claim");
      }

      return { sub: payload.sub };
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}
