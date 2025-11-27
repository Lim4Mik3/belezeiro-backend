import { IBusinessRepository } from "@core/contracts/repositories/i-business-repository";
import { DynamoBusinessRepository } from "@infra/implementations/repositories/dynamo-business-repository";

export function makeBusinessRepository(): IBusinessRepository {
  return new DynamoBusinessRepository();
}
