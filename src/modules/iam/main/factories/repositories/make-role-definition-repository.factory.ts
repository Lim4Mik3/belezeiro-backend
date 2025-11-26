import { IRoleDefinitionRepository } from 'packages/_core_/app/contracts/repositories/i-role-definition-repository';
import { makeRoleDefinitionRepository as makeRoleDefinitionRepositoryCore } from 'packages/_core_/main/factories/repositories';

let instance: IRoleDefinitionRepository | null = null;

export function makeRoleDefinitionRepository(): IRoleDefinitionRepository {
  if (!instance) {
    instance = makeRoleDefinitionRepositoryCore();
  }
  return instance;
}
