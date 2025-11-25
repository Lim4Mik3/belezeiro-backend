import { IBusinessRepository } from "@business/app/contracts/repositories/i-business-repository";
import { InMemoryBusinessRepository } from "@business/infra/repositories/in-memory-business-repository";

let instance: IBusinessRepository | null = null;

export function makeBusinessRepository(): IBusinessRepository {
  if (!instance) {
    instance = new InMemoryBusinessRepository();
  }
  return instance;
}
