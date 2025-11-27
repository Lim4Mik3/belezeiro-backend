import { IRoleDefinitionRepository } from '@core/contracts/repositories/i-role-definition-repository'

class UseCase {
	constructor(private RoleDefinitionRepository: IRoleDefinitionRepository) { }

	async execute(input: UseCase.Input): Promise<UseCase.Output> {
		let roleDefinitions

		if (input.businessId) {
			roleDefinitions =
				await this.RoleDefinitionRepository.findByBusinessId(input.businessId)
		} else if (input.globalOnly) {
			roleDefinitions = await this.RoleDefinitionRepository.findGlobal()
		} else {
			roleDefinitions = await this.RoleDefinitionRepository.findAll()
		}

		return {
			roleDefinitions: roleDefinitions.map((rd) => ({
				id: rd.id,
				name: rd.name,
				scope: rd.scope,
				description: rd.description,
				permissions: rd.permissions.toArray(),
				created_by: rd.created_by,
				business_id: rd.business_id,
				createdAt: rd.createdAt,
				updatedAt: rd.updatedAt,
			})),
		}
	}
}

namespace UseCase {
	export type Input = {
		businessId?: string
		globalOnly?: boolean
	}

	export type Output = {
		roleDefinitions: {
			id: string
			name: string
			scope: string
			description: string
			permissions: string[]
			created_by: string | null
			business_id: string | null
			createdAt: Date
			updatedAt: Date
		}[]
	}
}

export { UseCase as ListRoleDefinitionsUseCase }
