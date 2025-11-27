import { IRoleDefinitionRepository } from "@core/contracts/repositories/i-role-definition-repository";
import { DynamoRoleDefinitionRepository } from "@infra/implementations/repositories/dynamo-role-definition-repository";

export function makeRoleDefinitionRepository(): IRoleDefinitionRepository {
  return new DynamoRoleDefinitionRepository();
}
