import { DeleteUnitUseCase } from "@business/app/usecase/delete-unit.usecase";
import { makeBusinessRepository } from "../repositories/make-business-repository.factory";
import { makeUnitRepository } from "../repositories/make-unit-repository.factory";
import { makeEventBus } from "@infra/factories/event-bus/event-bus-factory";

export function makeDeleteUnitUseCase(): DeleteUnitUseCase {
  return new DeleteUnitUseCase(
    makeBusinessRepository(),
    makeUnitRepository(),
    makeEventBus()
  );
}
