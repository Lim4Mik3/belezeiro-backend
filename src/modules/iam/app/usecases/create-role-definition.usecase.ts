import { IEventBus } from '@core/contracts/event-bus/i-event-bus'
import { IRoleDefinitionRepository } from '@core/contracts/repositories/i-role-definition-repository'
import {
	RoleDefinitionEntity,
	RoleDefinitionScope,
} from '@iam/domain/entities/role-definition-entity'

class UseCase {
	constructor(
		private RoleDefinitionRepository: IRoleDefinitionRepository,
		private EventBus: IEventBus,
	) { }

	async execute(input: UseCase.Input): Promise<UseCase.Output> {
		// Check if role with same name already exists
		const existingRole = await this.RoleDefinitionRepository.findByName(
			input.name,
			input.business_id,
		)
		if (existingRole) {
			throw new Error('Role definition with this name already exists')
		}

		// Create role definition entity
		const roleDefinition = new RoleDefinitionEntity({
			name: input.name,
			scope: input.scope,
			description: input.description,
			permissions: input.permissions,
			created_by: input.created_by,
			business_id: input.business_id,
		})

		// Persist
		await this.RoleDefinitionRepository.create(roleDefinition)

		// Emit domain events (if any)
		const events = roleDefinition.getDomainEvents()
		for (const event of events) {
			await this.EventBus.publish(event)
		}
		roleDefinition.clearDomainEvents()

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
		name: string
		scope: RoleDefinitionScope
		description: string
		permissions: string[]
		created_by?: string
		business_id?: string
	}

	export type Output = {
		id: string
		name: string
		scope: RoleDefinitionScope
		description: string
		permissions: string[]
		created_by: string | null
		business_id: string | null
		createdAt: Date
		updatedAt: Date
	}
}

export { UseCase as CreateRoleDefinitionUseCase }
