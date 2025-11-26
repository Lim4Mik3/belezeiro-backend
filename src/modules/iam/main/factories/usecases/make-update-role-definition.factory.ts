import { UpdateRoleDefinitionUseCase } from '@iam/app/usecases/update-role-definition.usecase'
import { makeRoleDefinitionRepository } from '../repositories/make-role-definition-repository.factory'
import { makeEventBus } from 'packages/_core_/main/factories/make-event-bus.factory'

export function makeUpdateRoleDefinitionUseCase(): UpdateRoleDefinitionUseCase {
	return new UpdateRoleDefinitionUseCase(
		makeRoleDefinitionRepository(),
		makeEventBus(),
	)
}
