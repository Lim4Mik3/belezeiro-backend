import { DeleteRoleDefinitionUseCase } from '@iam/app/usecases/delete-role-definition.usecase'
import { makeRoleDefinitionRepository } from '../repositories/make-role-definition-repository.factory'
import { makeEventBus } from '@core/main/factories/make-event-bus.factory'

export function makeDeleteRoleDefinitionUseCase(): DeleteRoleDefinitionUseCase {
	return new DeleteRoleDefinitionUseCase(
		makeRoleDefinitionRepository(),
		makeEventBus(),
	)
}
