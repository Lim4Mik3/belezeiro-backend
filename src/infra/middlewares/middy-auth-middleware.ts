import { UnauthorizedError } from "@infra/errors/unauthorized-error";
import { makeJWTService } from "@infra/factories/services/jwt-service-factory";
import { MiddlewareObj } from "@middy/core";
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";

export interface AuthenticatedEvent extends APIGatewayProxyEventV2 {
  userId: string;
}

export const MiddyAuthMiddleware = (): MiddlewareObj<AuthenticatedEvent, APIGatewayProxyResult> => {
  return {
    before: async (request) => {
      const cookies = request.event.cookies || [];

      const sessionCookie = cookies.find((cookie) => cookie.startsWith('session='));

      if (!sessionCookie) {
        throw new UnauthorizedError();
      }

      const sessionToken = sessionCookie.split('=')[1];

      const JWTService = makeJWTService();

      const { sub } = await JWTService.verify(sessionToken) as { sub: string };

      request.event.userId = sub;
    },
  };
};
