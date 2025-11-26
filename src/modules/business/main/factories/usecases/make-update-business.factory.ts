import { UpdateBusinessUseCase } from "@business/app/usecase/update-business.usecase";
import { makeBusinessRepository } from "../repositories/make-business-repository.factory";
import { makeEventBus } from "packages/_core_/main/factories/make-event-bus.factory";

export function makeUpdateBusinessUseCase(): UpdateBusinessUseCase {
  return new UpdateBusinessUseCase(
    makeBusinessRepository(),
    makeEventBus()
  );
}
