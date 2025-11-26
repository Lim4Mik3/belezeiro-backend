import { IBusinessRepository } from '@core/app/contracts/repositories/i-business-repository';
import { makeBusinessRepository as makeBusinessRepositoryCore } from '@core/main/factories/repositories';

let instance: IBusinessRepository | null = null;

export function makeBusinessRepository(): IBusinessRepository {
  if (!instance) {
    instance = makeBusinessRepositoryCore();
  }
  return instance;
}
