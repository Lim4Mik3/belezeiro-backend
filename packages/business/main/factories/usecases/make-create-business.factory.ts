import { CreateBusinessUseCase } from "@business/app/usecase/create-business.usecase";
import { makeBusinessRepository } from "../repositories/make-business-repository.factory";
import { makeEventBus } from "@core/main/factories/make-event-bus.factory";

export function makeCreateBusinessUseCase(): CreateBusinessUseCase {
  return new CreateBusinessUseCase(
    makeBusinessRepository(),
    makeEventBus()
  );
}
