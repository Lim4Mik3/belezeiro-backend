import { BaseDomainEvent } from "@core/domain/events/base-domain-event";
import { DOMAIN_EVENTS, EVENT_SOURCES } from "@core/domain/events/event-registry";

export type BusinessCreatedEventPayload = {
  businessId: string;
  userId: string;
};

/**
 * Event emitted when a user successfully authenticates
 *
 * Use cases:
 * - Send welcome email (if new user)
 */
export class BusinessCreatedEvent extends BaseDomainEvent<BusinessCreatedEventPayload> {
  constructor(
    data: BusinessCreatedEventPayload,
    options?: {
      correlationId?: string;
      causationId?: string;
      metadata?: Record<string, any>;
    }
  ) {
    super(
      DOMAIN_EVENTS.BUSINESS.BUSINESS_CREATED,
      "1.0.0",
      EVENT_SOURCES.BUSINESS,
      data,
      options
    );
  }
}