import { IRoleAssignmentRepository } from "@core/contracts/repositories/i-role-assignment-repository";
import { DynamoRoleAssignmentRepository } from "@infra/implementations/repositories/dynamo-role-assignment-repository";

export function makeRoleAssignmentRepository(): IRoleAssignmentRepository {
  return new DynamoRoleAssignmentRepository();
}
