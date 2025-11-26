import { IRoleAssignmentRepository } from 'packages/_core_/app/contracts/repositories/i-role-assignment-repository';
import { IRoleDefinitionRepository } from 'packages/_core_/app/contracts/repositories/i-role-definition-repository';
import { ROLES_REGISTRY } from "@iam/domain/roles/roles-registry";
import { RoleAssignmentEntity } from "@iam/domain/entities/role-assignment-entity";
import { IEventBus } from "@core/app/contracts/event-bus/i-event-bus";

class UseCase {
  constructor(
    private RoleDefinitionRepository: IRoleDefinitionRepository,
    private RoleAssingmentRepository: IRoleAssignmentRepository,
    private EventBus: IEventBus
  ) { }

  async execute(input: UseCase.Input): UseCase.Output {
    const { ownerId, businessId } = input;

    const businessOwnerRole = await this.RoleDefinitionRepository
      .findGlobalRoleByName(ROLES_REGISTRY.BUSINESS_OWNER);

    if (!businessOwnerRole) {
      throw new Error(`Global role: ${ROLES_REGISTRY.BUSINESS_OWNER} was not found, so it not can be assigned to the user id: ${ownerId} and businessID: ${businessId}`);
    }

    const assignment = new RoleAssignmentEntity({
      userId: ownerId,
      roleId: businessOwnerRole.id,
      targetId: businessId,
      expiresAt: null,
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
    ownerId: string;
    businessId: string;
  }

  export type Output = Promise<void>;
}

export { UseCase as AssignUserAsOwnerOfABusinessUseCase };
