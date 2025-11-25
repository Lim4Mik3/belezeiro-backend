import { BaseDomainEvent } from "@core/domain/events/base-domain-event";
import { DOMAIN_EVENTS, EVENT_SOURCES } from "@core/domain/events/event-registry";

/**
 * Data payload for UserAuthenticatedEvent
 */
export type UserAuthenticatedData = {
  userId: string;
  email: string;
  isNewUser: boolean;
  provider?: string;       // "google", "facebook", etc
  authenticatedAt: Date;
};

/**
 * Event emitted when a user successfully authenticates
 *
 * Use cases:
 * - Send welcome email (if new user)
 * - Track analytics
 * - Update cache
 * - Notify other services
 */
export class UserAuthenticatedEvent extends BaseDomainEvent<UserAuthenticatedData> {
  constructor(
    data: UserAuthenticatedData,
    options?: {
      correlationId?: string;
      causationId?: string;
      metadata?: Record<string, any>;
    }
  ) {
    super(
      DOMAIN_EVENTS.IAM.USER_AUTHENTICATED,
      "1.0.0",
      EVENT_SOURCES.IAM,
      data,
      options
    );
  }
}