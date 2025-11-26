import { IRoleDefinitionRepository } from '@core/app/contracts/repositories/i-role-definition-repository'

class UseCase {
	constructor(private RoleDefinitionRepository: IRoleDefinitionRepository) {}

	async execute(input: UseCase.Input): Promise<UseCase.Output> {
		const roleDefinition = await this.RoleDefinitionRepository.findById(input.id)

		if (!roleDefinition) {
			throw new Error('Role definition not found')
		}

		return {
			id: roleDefinition.id,
			name: roleDefinition.name,
			scope: roleDefinition.scope,
			description: roleDefinition.description,
			permissions: roleDefinition.permissions.toArray(),
			created_by: roleDefinition.created_by,
			business_id: roleDefinition.business_id,
			createdAt: roleDefinition.createdAt,
			updatedAt: roleDefinition.updatedAt,
		}
	}
}

namespace UseCase {
	export type Input = {
		id: string
	}

	export type Output = {
		id: string
		name: string
		scope: string
		description: string
		permissions: string[]
		created_by: string | null
		business_id: string | null
		createdAt: Date
		updatedAt: Date
	}
}

export { UseCase as GetRoleDefinitionByIdUseCase }
