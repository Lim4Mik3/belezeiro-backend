import { AuthenticateUserUseCase } from "@iam/usecases/authenticate-user.usecase";
import { makeEventBus } from "@infra/factories/event-bus/event-bus-factory";
import { makeUserRepository } from "@infra/factories/repositories/user-repository-factory";
import { makeJWTService } from "@infra/factories/services/jwt-service-factory";

export function makeAuthenticateUser(): AuthenticateUserUseCase {
  return new AuthenticateUserUseCase(
    makeUserRepository(),
    makeJWTService(),
    makeEventBus(),
  )
}