import { GetUnitUseCase } from "@business/app/usecase/get-unit.usecase";
import { makeUnitRepository } from "../repositories/make-unit-repository.factory";

export function makeGetUnitUseCase(): GetUnitUseCase {
  return new GetUnitUseCase(makeUnitRepository());
}
