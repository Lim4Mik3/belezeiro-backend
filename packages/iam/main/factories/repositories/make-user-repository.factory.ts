import { IUserRepository } from "@iam/app/contracts/repositories/i-user-repository";
import { InMemoryUserRepository } from "@iam/infra/repositories/in-memory-user-repository";

let instance: IUserRepository | null = null;

export function makeUserRepository(): IUserRepository {
  if (!instance) {
    instance = new InMemoryUserRepository();
  }
  return instance;
}
