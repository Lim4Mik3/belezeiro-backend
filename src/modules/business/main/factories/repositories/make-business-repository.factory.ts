import { IBusinessRepository } from '@core/contracts/repositories/i-business-repository';
import { makeBusinessRepository as makeBusinessRepositoryCore } from '@infra/factories/repositories/business-repository-factory';

let instance: IBusinessRepository | null = null;

export function makeBusinessRepository(): IBusinessRepository {
  if (!instance) {
    instance = makeBusinessRepositoryCore();
  }
  return instance!;
}
