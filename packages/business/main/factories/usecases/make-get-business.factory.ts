import { GetBusinessUseCase } from "@business/app/usecase/get-business.usecase";
import { makeBusinessRepository } from "../repositories/make-business-repository.factory";

export function makeGetBusinessUseCase(): GetBusinessUseCase {
  return new GetBusinessUseCase(makeBusinessRepository());
}
