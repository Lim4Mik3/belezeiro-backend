import { IRoleAssignmentRepository } from '@core/contracts/repositories/i-role-assignment-repository';
import { makeRoleAssignmentRepository as makeRoleAssignmentRepositoryCore } from '@infra/factories/repositories/role-assignment-repository-factory';

let instance: IRoleAssignmentRepository | null = null;

export function makeRoleAssignmentRepository(): IRoleAssignmentRepository {
  if (!instance) {
    instance = makeRoleAssignmentRepositoryCore();
  }
  return instance;
}
