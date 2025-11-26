import { IRoleAssignmentRepository } from '../../../app/contracts/repositories/i-role-assignment-repository';
import { InMemoryRoleAssignmentRepository } from '../../../infra/repositories/in-memory-role-assignment-repository';
import { MongoDBRoleAssignmentRepository } from '../../../infra/repositories/mongodb-role-assignment-repository';
import { envGlobal } from '../../../infra/config/env-global';

let instance: IRoleAssignmentRepository | null = null;

export function makeRoleAssignmentRepository(): IRoleAssignmentRepository {
  if (!instance) {
    if (envGlobal.REPOSITORY_TYPE === 'mongodb') {
      instance = new MongoDBRoleAssignmentRepository();
    } else {
      instance = new InMemoryRoleAssignmentRepository();
    }
  }
  return instance;
}
