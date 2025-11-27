import { DeleteBusinessUseCase } from "@business/app/usecase/delete-business.usecase";
import { makeBusinessRepository } from "../repositories/make-business-repository.factory";
import { makeEventBus } from "@infra/factories/event-bus/event-bus-factory";

export function makeDeleteBusinessUseCase(): DeleteBusinessUseCase {
  return new DeleteBusinessUseCase(
    makeBusinessRepository(),
    makeEventBus()
  );
}
