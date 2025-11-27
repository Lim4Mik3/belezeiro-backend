import { IEventBus } from '@core/contracts/event-bus/i-event-bus'
import { IRoleDefinitionRepository } from '@core/contracts/repositories/i-role-definition-repository'

class UseCase {
	constructor(
		private RoleDefinitionRepository: IRoleDefinitionRepository,
		private EventBus: IEventBus,
	) { }

	async execute(input: UseCase.Input): Promise<UseCase.Output> {
		// Check if role definition exists
		const roleDefinition = await this.RoleDefinitionRepository.findById(input.id)
		if (!roleDefinition) {
			throw new Error('Role definition not found')
		}

		// Delete role definition
		await this.RoleDefinitionRepository.delete(input.id)

		// Emit domain events (if any)
		const events = roleDefinition.getDomainEvents()
		for (const event of events) {
			await this.EventBus.publish(event)
		}
		roleDefinition.clearDomainEvents()

		return {
			success: true,
		}
	}
}

namespace UseCase {
	export type Input = {
		id: string
	}

	export type Output = {
		success: boolean
	}
}

export { UseCase as DeleteRoleDefinitionUseCase }
