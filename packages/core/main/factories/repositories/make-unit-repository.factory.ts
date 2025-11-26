import { IUnitRepository } from '../../../app/contracts/repositories/i-unit-repository';
import { InMemoryUnitRepository } from '../../../infra/repositories/in-memory-unit-repository';
import { MongoDBUnitRepository } from '../../../infra/repositories/mongodb-unit-repository';
import { envGlobal } from '../../../infra/config/env-global';

let instance: IUnitRepository | null = null;

export function makeUnitRepository(): IUnitRepository {
  if (!instance) {
    if (envGlobal.REPOSITORY_TYPE === 'mongodb') {
      instance = new MongoDBUnitRepository();
    } else {
      instance = new InMemoryUnitRepository();
    }
  }
  return instance;
}
