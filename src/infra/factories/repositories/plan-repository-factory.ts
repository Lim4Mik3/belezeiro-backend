import { IPlanRepository } from "@core/contracts/repositories/i-plan-repository";
import { DynamoPlanRepository } from "@infra/implementations/repositories/dynamo-plan-repository";

export function makePlanRepository(): IPlanRepository {
  return new DynamoPlanRepository();
}
