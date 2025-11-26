import { IRoleDefinitionRepository } from '@core/app/contracts/repositories/i-role-definition-repository';
import { makeRoleDefinitionRepository as makeRoleDefinitionRepositoryCore } from '@core/main/factories/repositories';

let instance: IRoleDefinitionRepository | null = null;

export function makeRoleDefinitionRepository(): IRoleDefinitionRepository {
  if (!instance) {
    instance = makeRoleDefinitionRepositoryCore();
  }
  return instance;
}
