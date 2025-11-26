import { ListUnitsByBusinessUseCase } from "@business/app/usecase/list-units-by-business.usecase";
import { makeUnitRepository } from "../repositories/make-unit-repository.factory";
import { makeBusinessRepository } from "../repositories/make-business-repository.factory";

export function makeListUnitsByBusinessUseCase(): ListUnitsByBusinessUseCase {
  return new ListUnitsByBusinessUseCase(makeUnitRepository(), makeBusinessRepository());
}
