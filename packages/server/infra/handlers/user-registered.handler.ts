import { UserRegisteredEvent } from "@iam/domain/events/user-registered";
import { EventHandler } from "../queue/redis-queue-processor";
import { DOMAIN_EVENTS } from "@core/domain/events/event-registry";
import { makeAssignUserToCustomerRoleUseCase } from "@iam/main/factories/usecases/make-assign-user-to-customer-role.factory";

export class UserRegisteredHandler implements EventHandler<UserRegisteredEvent> {
  eventName = DOMAIN_EVENTS.IAM.USER_REGISTERED;

  async handle(event: UserRegisteredEvent): Promise<void> {
    const assingUserToCustomerRole = makeAssignUserToCustomerRoleUseCase()

    assingUserToCustomerRole.execute({ userId: event.data.userId });
  }
}
