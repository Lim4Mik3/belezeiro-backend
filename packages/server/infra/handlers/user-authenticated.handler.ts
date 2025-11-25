import { EventHandler } from "../queue/redis-queue-processor";
import { UserAuthenticatedEvent } from "@iam/domain/events/user-authenticate";
import { DOMAIN_EVENTS } from "@core/domain/events/event-registry";

export class UserAuthenticatedHandler implements EventHandler<UserAuthenticatedEvent> {
  eventName = DOMAIN_EVENTS.IAM.USER_AUTHENTICATED;

  async handle(event: UserAuthenticatedEvent): Promise<void> {
    console.log("THIAGO NIGRO", event);
  }
}
