import { IUserRepository } from '@core/contracts/repositories/i-user-repository';
import { makeUserRepository as makeUserRepositoryCore } from '@infra/factories/repositories/user-repository-factory';

let instance: IUserRepository | null = null;

export function makeUserRepository(): IUserRepository {
  if (!instance) {
    instance = makeUserRepositoryCore();
  }
  return instance;
}
