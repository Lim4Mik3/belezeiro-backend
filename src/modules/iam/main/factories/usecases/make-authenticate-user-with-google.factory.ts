import { AuthenticateUserWithGoogleUseCase } from "@iam/app/usecases/authenticate-user-with-google.usecase";
import { makeUserRepository } from "../repositories/make-user-repository.factory";
import { makeJWTService } from "@infra/factories/services/jwt-service-factory";
import { makeEventBus } from "@infra/factories/event-bus/event-bus-factory";

export function makeAuthenticateUserWithGoogleUseCase(): AuthenticateUserWithGoogleUseCase {
  return new AuthenticateUserWithGoogleUseCase(
    makeUserRepository(),
    makeJWTService(),
    makeEventBus()
  );
}
