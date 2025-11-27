import { ISubscriptionRepository } from "@core/contracts/repositories/i-subscription-repository";
import { DynamoSubscriptionRepository } from "@infra/implementations/repositories/dynamo-subscription-repository";

export function makeSubscriptionRepository(): ISubscriptionRepository {
  return new DynamoSubscriptionRepository();
}
