import { IBusinessRepository } from '../../../app/contracts/repositories/i-business-repository';
import { InMemoryBusinessRepository } from '../../../infra/repositories/in-memory-business-repository';
import { MongoDBBusinessRepository } from '../../../infra/repositories/mongodb-business-repository';
import { envGlobal } from '../../../infra/config/env-global';
import { makeUnitRepository } from './make-unit-repository.factory';

let instance: IBusinessRepository | null = null;

export function makeBusinessRepository(): IBusinessRepository {
  if (!instance) {
    if (envGlobal.REPOSITORY_TYPE === 'mongodb') {
      const unitRepository = makeUnitRepository();
      instance = new MongoDBBusinessRepository(unitRepository);
    } else {
      instance = new InMemoryBusinessRepository();
    }
  }
  return instance;
}
