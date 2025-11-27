import { AssignUserToCustomerRoleUseCase } from '@iam/app/usecases/assign-user-to-customer-role.usecase'
import { makeRoleDefinitionRepository } from '../repositories/make-role-definition-repository.factory'
import { makeRoleAssignmentRepository } from '../repositories/make-role-assignment-repository.factory'
import { makeEventBus } from '@infra/factories/event-bus/event-bus-factory'

export function makeAssignUserToCustomerRoleUseCase(): AssignUserToCustomerRoleUseCase {
	return new AssignUserToCustomerRoleUseCase(
		makeRoleDefinitionRepository(),
		makeRoleAssignmentRepository(),
		makeEventBus(),
	)
}
