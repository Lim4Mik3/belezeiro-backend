import { DeleteUnitUseCase } from "@business/app/usecase/delete-unit.usecase";
import { makeBusinessRepository } from "../repositories/make-business-repository.factory";
import { makeUnitRepository } from "../repositories/make-unit-repository.factory";
import { makeEventBus } from "packages/_core_/main/factories/make-event-bus.factory";

export function makeDeleteUnitUseCase(): DeleteUnitUseCase {
  return new DeleteUnitUseCase(
    makeBusinessRepository(),
    makeUnitRepository(),
    makeEventBus()
  );
}
