import { IBusinessRepository } from 'packages/_core_/app/contracts/repositories/i-business-repository';
import { makeBusinessRepository as makeBusinessRepositoryCore } from 'packages/_core_/main/factories/repositories';

let instance: IBusinessRepository | null = null;

export function makeBusinessRepository(): IBusinessRepository {
  if (!instance) {
    instance = makeBusinessRepositoryCore();
  }
  return instance;
}
