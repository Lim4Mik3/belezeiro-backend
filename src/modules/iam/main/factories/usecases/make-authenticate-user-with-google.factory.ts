import { AuthenticateUserWithGoogleUseCase } from "@iam/app/usecases/authenticate-user-with-google.usecase";
import { makeUserRepository } from "../repositories/make-user-repository.factory";
import { makeJWTService } from "packages/_core_/main/factories/services/make-jwt-service.factory";
import { makeEventBus } from "packages/_core_/main/factories/make-event-bus.factory";

export function makeAuthenticateUserWithGoogleUseCase(): AuthenticateUserWithGoogleUseCase {
  return new AuthenticateUserWithGoogleUseCase(
    makeUserRepository(),
    makeJWTService(),
    makeEventBus()
  );
}
