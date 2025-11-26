import { BaseDomainEvent } from "@core/domain/events/base-domain-event";
import { DOMAIN_EVENTS, EVENT_SOURCES } from "@core/domain/events/event-registry";

export type UserRegisteredEventPayload = {
  userId: string;
  occured_at: Date;
};

/**
 * Event emitted when a user is Registered
 *
 * Use cases:
 * - Send welcome email
 * - Assigment global roles to him
 */
export class UserRegisteredEvent extends BaseDomainEvent<UserRegisteredEventPayload> {
  constructor(
    data: UserRegisteredEventPayload,
    options?: {
      correlationId?: string;
      causationId?: string;
      metadata?: Record<string, any>;
    }
  ) {
    super(
      DOMAIN_EVENTS.IAM.USER_REGISTERED,
      "1.0.0",
      EVENT_SOURCES.IAM,
      data,
      options
    );
  }
}