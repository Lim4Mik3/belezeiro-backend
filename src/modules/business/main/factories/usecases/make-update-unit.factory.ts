import { UpdateUnitUseCase } from "@business/app/usecase/update-unit.usecase";
import { makeBusinessRepository } from "../repositories/make-business-repository.factory";
import { makeUnitRepository } from "../repositories/make-unit-repository.factory";
import { makeEventBus } from "packages/_core_/main/factories/make-event-bus.factory";

export function makeUpdateUnitUseCase(): UpdateUnitUseCase {
  return new UpdateUnitUseCase(
    makeBusinessRepository(),
    makeUnitRepository(),
    makeEventBus()
  );
}
