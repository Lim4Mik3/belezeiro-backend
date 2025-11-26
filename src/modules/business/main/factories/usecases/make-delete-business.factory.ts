import { DeleteBusinessUseCase } from "@business/app/usecase/delete-business.usecase";
import { makeBusinessRepository } from "../repositories/make-business-repository.factory";
import { makeEventBus } from "packages/_core_/main/factories/make-event-bus.factory";

export function makeDeleteBusinessUseCase(): DeleteBusinessUseCase {
  return new DeleteBusinessUseCase(
    makeBusinessRepository(),
    makeEventBus()
  );
}
