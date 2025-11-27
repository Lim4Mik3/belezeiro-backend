import { IUnitRepository } from "@core/contracts/repositories/i-unit-repository";
import { DynamoUnitRepository } from "@infra/implementations/repositories/dynamo-unit-repository";

export function makeUnitRepository(): IUnitRepository {
  return new DynamoUnitRepository();
}
