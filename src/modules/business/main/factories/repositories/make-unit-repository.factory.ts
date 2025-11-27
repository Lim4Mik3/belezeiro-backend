import { IUnitRepository } from '@core/contracts/repositories/i-unit-repository';
import { makeUnitRepository as makeUnitRepositoryCore } from '@infra/factories/repositories/unit-repository-factory';

let instance: IUnitRepository | null = null;

export function makeUnitRepository(): IUnitRepository {
  if (!instance) {
    instance = makeUnitRepositoryCore();
  }
  return instance!;
}
