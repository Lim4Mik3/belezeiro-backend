import { IRoleDefinitionRepository } from '@core/contracts/repositories/i-role-definition-repository';
import { makeRoleDefinitionRepository as makeRoleDefinitionRepositoryCore } from '@infra/factories/repositories/role-definition-repository-factory';

let instance: IRoleDefinitionRepository | null = null;

export function makeRoleDefinitionRepository(): IRoleDefinitionRepository {
  if (!instance) {
    instance = makeRoleDefinitionRepositoryCore();
  }
  return instance;
}
