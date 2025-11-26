import { EventHandler } from "../queue/redis-queue-processor";
import { UserAuthenticatedEvent } from "@iam/domain/events/user-authenticate";
import { DOMAIN_EVENTS } from "@core/domain/events/event-registry";
import { makeGenerateUserSessionSnapshotUseCase } from "@iam/main/factories/usecases/make-generate-user-session-snapshot.factory";

export class UserAuthenticatedHandler implements EventHandler<UserAuthenticatedEvent> {
  eventName = DOMAIN_EVENTS.IAM.USER_AUTHENTICATED;

  async handle(event: UserAuthenticatedEvent): Promise<void> {
    const startTime = performance.now();
    console.log(`[UserAuthenticatedHandler] Starting handler for user ${event.data.userId}`);

    const usecase = makeGenerateUserSessionSnapshotUseCase();

    await usecase.execute(event);

    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2);
    console.log(`[UserAuthenticatedHandler] Handler completed in ${executionTime}ms for user ${event.data.userId}`);
  }
}
