import { IUserRepository } from 'packages/_core_/app/contracts/repositories/i-user-repository';
import { makeUserRepository as makeUserRepositoryCore } from 'packages/_core_/main/factories/repositories';

let instance: IUserRepository | null = null;

export function makeUserRepository(): IUserRepository {
  if (!instance) {
    instance = makeUserRepositoryCore();
  }
  return instance;
}
