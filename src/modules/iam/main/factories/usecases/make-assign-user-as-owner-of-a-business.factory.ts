import { makeRoleDefinitionRepository } from '../repositories/make-role-definition-repository.factory'
import { makeRoleAssignmentRepository } from '../repositories/make-role-assignment-repository.factory'
import { makeEventBus } from '@infra/factories/event-bus/event-bus-factory'
import { AssignUserAsOwnerOfABusinessUseCase } from '@iam/app/usecases/assign-user-as-owner-of-a-business'

export function makeAssignUserAsOwnerOfABusinessUseCase(): AssignUserAsOwnerOfABusinessUseCase {
  return new AssignUserAsOwnerOfABusinessUseCase(
    makeRoleDefinitionRepository(),
    makeRoleAssignmentRepository(),
    makeEventBus(),
  )
}
