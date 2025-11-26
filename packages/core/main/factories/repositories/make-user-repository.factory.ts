import { IUserRepository } from '../../../app/contracts/repositories/i-user-repository';
import { MongoDBUserRepository } from '../../../infra/repositories/mongodb-user-repository';
import { InMemoryUserRepository } from '../../../infra/repositories/in-memory-user-repository';
import { envGlobal } from '../../../infra/config/env-global';

let instance: IUserRepository | null = null;

export function makeUserRepository(): IUserRepository {
  if (!instance) {
    if (envGlobal.REPOSITORY_TYPE === 'mongodb') {
      instance = new MongoDBUserRepository();
    } else {
      instance = new InMemoryUserRepository();
    }
  }
  return instance;
}
