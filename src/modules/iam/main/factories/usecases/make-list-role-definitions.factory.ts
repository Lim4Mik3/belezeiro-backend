import { ListRoleDefinitionsUseCase } from '@iam/app/usecases/list-role-definitions.usecase'
import { makeRoleDefinitionRepository } from '../repositories/make-role-definition-repository.factory'

export function makeListRoleDefinitionsUseCase(): ListRoleDefinitionsUseCase {
	return new ListRoleDefinitionsUseCase(makeRoleDefinitionRepository())
}
