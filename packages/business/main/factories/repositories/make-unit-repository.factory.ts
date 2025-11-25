import { IUnitRepository } from "@business/app/contracts/repositories/i-unit-repository";
import { InMemoryUnitRepository } from "@business/infra/repositories/in-memory-unit-repository";

let instance: IUnitRepository | null = null;

export function makeUnitRepository(): IUnitRepository {
  if (!instance) {
    instance = new InMemoryUnitRepository();
  }
  return instance;
}
