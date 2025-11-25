import { DeleteUnitUseCase } from "@business/app/usecase/delete-unit.usecase";
import { makeUnitRepository } from "../repositories/make-unit-repository.factory";
import { makeEventBus } from "@core/main/factories/make-event-bus.factory";

export function makeDeleteUnitUseCase(): DeleteUnitUseCase {
  return new DeleteUnitUseCase(
    makeUnitRepository(),
    makeEventBus()
  );
}
