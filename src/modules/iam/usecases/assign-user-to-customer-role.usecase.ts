import { IRoleAssignmentRepository } from '@core/contracts/repositories/i-role-assignment-repository';
import { IRoleDefinitionRepository } from '@core/contracts/repositories/i-role-definition-repository';
import { ROLES_REGISTRY } from "@iam/domain/roles/roles-registry";
import { RoleAssignmentEntity } from "@iam/domain/entities/role-assignment-entity";
import { IEventBus } from "@core/contracts/event-bus/i-event-bus";

class UseCase {
  constructor(
    private RoleDefinitionRepository: IRoleDefinitionRepository,
    private RoleAssingmentRepository: IRoleAssignmentRepository,
    private EventBus: IEventBus
  ) { }

  async execute(input: UseCase.Input): UseCase.Output {
    const { userId } = input;

    const customerRole = await this.RoleDefinitionRepository
      .findGlobalRoleByName(ROLES_REGISTRY.CUSTOMER);

    if (!customerRole) {
      throw new Error(`Global role: ${ROLES_REGISTRY.CUSTOMER} was not found, so it not can be assigned to the user id: ${userId}`);
    }

    const assignment = new RoleAssignmentEntity({
      userId,
      roleId: customerRole.id,
      expiresAt: null,
      targetId: null,
      assignedAt: new Date(),
    })

    await this.RoleAssingmentRepository.create(assignment);

    const events = assignment.getDomainEvents();
    for (const event of events) {
      await this.EventBus.publish(event);
    }
    assignment.clearDomainEvents();
  }
}

namespace UseCase {
  export type Input = {
    userId: string;
  }

  export type Output = Promise<void>;
}

export { UseCase as AssignUserToCustomerRoleUseCase };
