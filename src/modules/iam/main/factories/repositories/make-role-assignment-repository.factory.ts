import { IRoleAssignmentRepository } from 'packages/_core_/app/contracts/repositories/i-role-assignment-repository';
import { makeRoleAssignmentRepository as makeRoleAssignmentRepositoryCore } from 'packages/_core_/main/factories/repositories';

let instance: IRoleAssignmentRepository | null = null;

export function makeRoleAssignmentRepository(): IRoleAssignmentRepository {
  if (!instance) {
    instance = makeRoleAssignmentRepositoryCore();
  }
  return instance;
}
