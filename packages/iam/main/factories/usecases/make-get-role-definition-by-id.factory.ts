import { GetRoleDefinitionByIdUseCase } from '@iam/app/usecases/get-role-definition-by-id.usecase'
import { makeRoleDefinitionRepository } from '../repositories/make-role-definition-repository.factory'

export function makeGetRoleDefinitionByIdUseCase(): GetRoleDefinitionByIdUseCase {
	return new GetRoleDefinitionByIdUseCase(makeRoleDefinitionRepository())
}
