import { UpdateUnitUseCase } from "@business/app/usecase/update-unit.usecase";
import { makeUnitRepository } from "../repositories/make-unit-repository.factory";
import { makeEventBus } from "@core/main/factories/make-event-bus.factory";

export function makeUpdateUnitUseCase(): UpdateUnitUseCase {
  return new UpdateUnitUseCase(
    makeUnitRepository(),
    makeEventBus()
  );
}
