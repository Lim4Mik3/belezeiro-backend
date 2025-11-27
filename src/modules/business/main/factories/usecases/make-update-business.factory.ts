import { UpdateBusinessUseCase } from "@business/app/usecase/update-business.usecase";
import { makeBusinessRepository } from "../repositories/make-business-repository.factory";
import { makeEventBus } from "@infra/factories/event-bus/event-bus-factory";

export function makeUpdateBusinessUseCase(): UpdateBusinessUseCase {
  return new UpdateBusinessUseCase(
    makeBusinessRepository(),
    makeEventBus()
  );
}
