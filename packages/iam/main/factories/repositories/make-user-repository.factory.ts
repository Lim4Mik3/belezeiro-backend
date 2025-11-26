import { IUserRepository } from '@core/app/contracts/repositories/i-user-repository';
import { makeUserRepository as makeUserRepositoryCore } from '@core/main/factories/repositories';

let instance: IUserRepository | null = null;

export function makeUserRepository(): IUserRepository {
  if (!instance) {
    instance = makeUserRepositoryCore();
  }
  return instance;
}
