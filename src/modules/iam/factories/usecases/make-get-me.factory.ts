import { GetMeUseCase } from "@iam/usecases/get-me.usecase";
import { makeUserRepository } from "@infra/factories/repositories/user-repository-factory";

export function makeGetMeUseCase(): GetMeUseCase {
  return new GetMeUseCase(
    makeUserRepository(),
  )
}