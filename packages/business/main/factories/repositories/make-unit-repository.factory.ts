import { IUnitRepository } from '@core/app/contracts/repositories/i-unit-repository';
import { makeUnitRepository as makeUnitRepositoryCore } from '@core/main/factories/repositories';

let instance: IUnitRepository | null = null;

export function makeUnitRepository(): IUnitRepository {
  if (!instance) {
    instance = makeUnitRepositoryCore();
  }
  return instance;
}
