import { CreateRoleDefinitionUseCase } from '@iam/app/usecases/create-role-definition.usecase'
import { makeRoleDefinitionRepository } from '../repositories/make-role-definition-repository.factory'
import { makeEventBus } from '@core/main/factories/make-event-bus.factory'

export function makeCreateRoleDefinitionUseCase(): CreateRoleDefinitionUseCase {
	return new CreateRoleDefinitionUseCase(
		makeRoleDefinitionRepository(),
		makeEventBus(),
	)
}
