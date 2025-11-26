import { IUnitRepository } from 'packages/_core_/app/contracts/repositories/i-unit-repository';
import { makeUnitRepository as makeUnitRepositoryCore } from 'packages/_core_/main/factories/repositories';

let instance: IUnitRepository | null = null;

export function makeUnitRepository(): IUnitRepository {
  if (!instance) {
    instance = makeUnitRepositoryCore();
  }
  return instance;
}
