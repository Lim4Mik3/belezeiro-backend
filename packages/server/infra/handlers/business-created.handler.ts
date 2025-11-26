import { EventHandler } from "../queue/redis-queue-processor";
import { DOMAIN_EVENTS } from "@core/domain/events/event-registry";
import { BusinessCreatedEvent } from "@business/domain/events/business-created";
import { makeAssignUserAsOwnerOfABusinessUseCase } from "@iam/main/factories/usecases/make-assign-user-as-owner-of-a-business.factory";
import { makePermissionSnapshotServiceIAM } from "@iam/main/factories/services/make-permission-snapshot-iam.factory";

export class BusinessCreatedHandler implements EventHandler<BusinessCreatedEvent> {
  eventName = DOMAIN_EVENTS.BUSINESS.BUSINESS_CREATED;

  async handle(event: BusinessCreatedEvent): Promise<void> {
    const assignUserAsBusinessOwner = makeAssignUserAsOwnerOfABusinessUseCase()
    const permissionSnapshotService = makePermissionSnapshotServiceIAM()

    await assignUserAsBusinessOwner.execute({
      ownerId: event.data.userId,
      businessId: event.data.businessId
    });

    // Invalidate user session cache so the new business ownership is reflected immediately
    await permissionSnapshotService.invalidateSession(event.data.userId);

    console.log(`[BusinessCreatedHandler] Session invalidated for user ${event.data.userId} after becoming owner of business ${event.data.businessId}`);
  }
}
