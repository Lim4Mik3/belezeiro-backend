import { IRoleAssignmentRepository } from '@core/app/contracts/repositories/i-role-assignment-repository';
import { makeRoleAssignmentRepository as makeRoleAssignmentRepositoryCore } from '@core/main/factories/repositories';

let instance: IRoleAssignmentRepository | null = null;

export function makeRoleAssignmentRepository(): IRoleAssignmentRepository {
  if (!instance) {
    instance = makeRoleAssignmentRepositoryCore();
  }
  return instance;
}
