import { IRoleDefinitionRepository } from '../../../app/contracts/repositories/i-role-definition-repository';
import { InMemoryRoleDefinitionRepository } from '../../../infra/repositories/in-memory-role-definition-repository';
import { MongoDBRoleDefinitionRepository } from '../../../infra/repositories/mongodb-role-definition-repository';
import { envGlobal } from '../../../infra/config/env-global';

let instance: IRoleDefinitionRepository | null = null;

export function makeRoleDefinitionRepository(): IRoleDefinitionRepository {
  if (!instance) {
    if (envGlobal.REPOSITORY_TYPE === 'mongodb') {
      instance = new MongoDBRoleDefinitionRepository();
    } else {
      instance = new InMemoryRoleDefinitionRepository();
    }
  }
  return instance;
}
