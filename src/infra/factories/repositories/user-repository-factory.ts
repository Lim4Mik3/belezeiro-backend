import { IUserRepository } from "@core/contracts/repositories/i-user-repository";
import { DynamoUserRepository } from "@infra/implementations/repositories/dynamo-user-repository";

export function makeUserRepository(): IUserRepository {
  return new DynamoUserRepository();
}
