import { CreateUnitUseCase } from "@business/app/usecase/create-unit.usecase";
import { makeBusinessRepository } from "../repositories/make-business-repository.factory";
import { makeEventBus } from "@core/main/factories/make-event-bus.factory";

export function makeCreateUnitUseCase(): CreateUnitUseCase {
  return new CreateUnitUseCase(
    makeBusinessRepository(),
    makeEventBus()
  );
}
