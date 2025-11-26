/**
 * Centralized registry of all domain events
 *
 * Benefits:
 * - Autocomplete in IDE
 * - Type-safe event types
 * - Living documentation
 * - Explicit versioning
 * - Prevents name duplication
 *
 * Naming convention: <bounded-context>.<aggregate>.<action>.v<version>
 */
export const DOMAIN_EVENTS = {
  /**
   * IAM (Identity and Access Management) Context
   */
  IAM: {
    USER_AUTHENTICATED: "iam.user.authenticated.v1",
    USER_REGISTERED: "iam.user.registered.v1",
    USER_UPDATED: "iam.user.updated.v1",
    USER_DELETED: "iam.user.deleted.v1",
    PASSWORD_RESET_REQUESTED: "iam.user.password-reset-requested.v1",
    PASSWORD_CHANGED: "iam.user.password-changed.v1",
    EMAIL_VERIFIED: "iam.user.email-verified.v1",
  },

  /**
   * Business Context
   */
  BUSINESS: {
    BUSINESS_CREATED: "business.created.v1",
  },
} as const;

/**
 * Type helper to extract all event types
 */
export type DomainEventType =
  {
    [K in keyof typeof DOMAIN_EVENTS]: typeof DOMAIN_EVENTS[K][keyof typeof DOMAIN_EVENTS[K]]
  }[keyof typeof DOMAIN_EVENTS];



/**
 * Event sources (bounded contexts)
 */
export const EVENT_SOURCES = {
  IAM: "iam-service",
  BUSINESS: "business-service"
} as const;

export type EventSource = typeof EVENT_SOURCES[keyof typeof EVENT_SOURCES];
