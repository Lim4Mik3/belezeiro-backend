import { IEventBus } from '@core/bus/i-event-bus'
import { IRoleDefinitionRepository } from '@core/app/contracts/repositories/i-role-definition-repository'

class UseCase {
	constructor(
		private RoleDefinitionRepository: IRoleDefinitionRepository,
		private EventBus: IEventBus,
	) {}

	async execute(input: UseCase.Input): Promise<UseCase.Output> {
		// Find role definition
		const roleDefinition = await this.RoleDefinitionRepository.findById(input.id)
		if (!roleDefinition) {
			throw new Error('Role definition not found')
		}

		// Update fields if provided
		if (input.name !== undefined) {
			// Check if new name already exists (excluding current role)
			const existingRole = await this.RoleDefinitionRepository.findByName(
				input.name,
				roleDefinition.business_id ?? undefined,
			)
			if (existingRole && existingRole.id !== roleDefinition.id) {
				throw new Error('Role definition with this name already exists')
			}
			roleDefinition.updateName(input.name)
		}

		if (input.description !== undefined) {
			roleDefinition.updateDescription(input.description)
		}

		if (input.permissions !== undefined) {
			roleDefinition.updatePermissions(input.permissions)
		}

		// Persist changes
		await this.RoleDefinitionRepository.update(roleDefinition)

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
		id: string
		name?: string
		description?: string
		permissions?: string[]
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

export { UseCase as UpdateRoleDefinitionUseCase }
